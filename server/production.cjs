/**
 * ENTROPY — Production Standalone Fullstack Server
 * Serves the compiled static frontend from dist/ and handles /api requests
 * with persistent SQLite database storage, security hardening, and transactional email worker.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.resolve(projectRoot, 'data');
const distDir = path.resolve(projectRoot, 'dist');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.resolve(dataDir, 'entropy.sqlite'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA synchronous = NORMAL;');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    last_login_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    email TEXT NOT NULL,
    country TEXT NOT NULL,
    phone TEXT,
    project_type TEXT,
    page_count TEXT,
    budget_range TEXT NOT NULL,
    description TEXT,
    response_method TEXT NOT NULL DEFAULT 'Email',
    status TEXT NOT NULL DEFAULT 'New',
    admin_notes TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS email_outbox (
    id TEXT PRIMARY KEY,
    enquiry_id TEXT,
    recipient TEXT NOT NULL,
    template_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    next_retry_at INTEGER NOT NULL,
    idempotency_key TEXT UNIQUE NOT NULL,
    provider_message_id TEXT,
    last_error TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    delivered_at INTEGER,
    FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS admin_login_attempts (
    key TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL,
    lockout_until INTEGER NOT NULL,
    last_attempt_at INTEGER NOT NULL
  );
`);

// ─────────────────────────────────────────────────────────────────────────────
// 1. Security Firewall: Intercepts & Blocks Protected System Resources
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const rawUrl = req.url || '';
  const decodedPath = decodeURIComponent(rawUrl.split('?')[0]);
  const lowerPath = decodedPath.toLowerCase();

  // Block directory traversal or null byte injections
  if (decodedPath.includes('..') || decodedPath.includes('\0')) {
    return res.status(403).json({ error: 'Access forbidden: Invalid path traversal detected.' });
  }

  // Sensitive directory prefixes
  const blockedPrefixes = ['/data', '/server', '/scripts', '/tests', '/backups', '/node_modules'];
  for (const prefix of blockedPrefixes) {
    if (lowerPath === prefix || lowerPath.startsWith(prefix + '/')) {
      return res.status(403).json({ error: `Access forbidden: ${prefix.substring(1)} is a protected resource.` });
    }
  }

  // Sensitive extensions and exact files
  const blockedExtensions = ['.sqlite', '.sqlite-wal', '.sqlite-shm', '.db', '.log', '.env', '.cjs'];
  const blockedExactFiles = ['/package.json', '/package-lock.json', '/tsconfig.json', '/bun.lock'];

  if (
    lowerPath.startsWith('/.') ||
    lowerPath.includes('/.') ||
    blockedExtensions.some((ext) => lowerPath.endsWith(ext) || lowerPath.includes(ext + '?')) ||
    blockedExactFiles.includes(lowerPath)
  ) {
    return res.status(403).json({ error: 'Access forbidden: Protected system resource.' });
  }

  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Global Security Headers
// ─────────────────────────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' ws: wss: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
});

// Parse JSON and URL-encoded bodies with limits
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Helper functions for crypto & hashing
function hashPasswordAsync(password) {
  return new Promise((resolve, reject) => {
    if (typeof password !== 'string' || password.length < 8) {
      return reject(new Error('Password must be at least 8 characters long'));
    }
    if (password.length > 128) {
      return reject(new Error('Password cannot exceed 128 characters'));
    }
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

function verifyPasswordAsync(password, storedHash) {
  return new Promise((resolve) => {
    if (typeof password !== 'string' || typeof storedHash !== 'string' || password.length > 128) {
      return resolve(false);
    }
    try {
      const [salt, keyHex] = storedHash.split(':');
      if (!salt || !keyHex || keyHex.length !== 128) return resolve(false);
      const keyBuffer = Buffer.from(keyHex, 'hex');
      if (keyBuffer.length !== 64) return resolve(false);

      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }, (err, derivedKey) => {
        if (err) return resolve(false);
        try {
          resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
        } catch {
          resolve(false);
        }
      });
    } catch {
      resolve(false);
    }
  });
}

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      try {
        list[name] = decodeURIComponent(parts.join('='));
      } catch {
        list[name] = parts.join('=');
      }
    }
  });
  return list;
}

function getClientIp(req) {
  if (process.env.TRUST_PROXY === 'true' && req.headers['x-forwarded-for']) {
    const forwarded = String(req.headers['x-forwarded-for']).split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function logAuditEvent(userId, userEmail, action, targetType, targetId, details) {
  try {
    const id = `audit_${crypto.randomUUID()}`;
    const now = Date.now();
    const detailsStr = details ? JSON.stringify(details) : null;
    db.prepare(`
      INSERT INTO admin_audit_logs (id, user_id, user_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userEmail, action, targetType || null, targetId || null, detailsStr, now);
  } catch (err) {
    console.error('[Audit Log Error]:', err);
  }
}

// Persistent rate limiting in SQLite
function checkLoginRateLimit(ip, email) {
  const now = Date.now();
  const ipRow = db.prepare('SELECT attempts, lockout_until FROM admin_login_attempts WHERE key = ?').get(`ip:${ip}`);
  if (ipRow && ipRow.lockout_until > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((ipRow.lockout_until - now) / 1000) };
  }
  if (email) {
    const accRow = db.prepare('SELECT attempts, lockout_until FROM admin_login_attempts WHERE key = ?').get(`acc:${email}`);
    if (accRow && accRow.lockout_until > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((accRow.lockout_until - now) / 1000) };
    }
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

function recordFailedLogin(ip, email) {
  const now = Date.now();
  const lockoutDuration = 15 * 60 * 1000;
  const updateKey = (key, threshold) => {
    const row = db.prepare('SELECT attempts FROM admin_login_attempts WHERE key = ?').get(key);
    const count = (row ? row.attempts : 0) + 1;
    const lockout = count >= threshold ? now + lockoutDuration : 0;
    db.prepare(`
      INSERT INTO admin_login_attempts (key, attempts, lockout_until, last_attempt_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET attempts = excluded.attempts, lockout_until = excluded.lockout_until, last_attempt_at = excluded.last_attempt_at
    `).run(key, count, lockout, now);
  };
  updateKey(`ip:${ip}`, 5);
  if (email) updateKey(`acc:${email}`, 10);
}

function clearLoginRateLimit(ip, email) {
  db.prepare('DELETE FROM admin_login_attempts WHERE key = ?').run(`ip:${ip}`);
  if (email) db.prepare('DELETE FROM admin_login_attempts WHERE key = ?').run(`acc:${email}`);
}

// CSRF Protection Middleware
function requireCsrfProtection(req, res, next) {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next();

  const isPublicEnquiry = req.path === '/api/enquiries';
  const origin = req.headers['origin'] || req.headers['referer'];
  const host = req.headers['host'];

  if (origin && typeof origin === 'string') {
    try {
      const originUrl = new URL(origin);
      const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
      const hostMatch = host && originUrl.host === host;
      if (!isLocalhost && !hostMatch) {
        return res.status(403).json({ error: 'Cross-origin request rejected by CSRF policy.' });
      }
    } catch {
      return res.status(403).json({ error: 'Malformed Origin.' });
    }
  }

  if (!isPublicEnquiry && req.path.startsWith('/api/admin')) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json') && !req.headers['x-entropy-admin-action'] && !req.headers['x-requested-with']) {
      return res.status(403).json({ error: 'Missing CSRF header or invalid content-type.' });
    }
  }
  next();
}

app.use(requireCsrfProtection);

// Auth Middleware
function requireAdminAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['entropy_admin_session'];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = Date.now();
    const stmt = db.prepare(`
      SELECT s.id AS session_id, s.expires_at, u.id AS user_id, u.email, u.display_name, u.role, u.is_active
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > ?
    `);
    const user = stmt.get(tokenHash, now);

    if (!user || user.is_active !== 1) {
      res.setHeader('Set-Cookie', 'entropy_admin_session=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0');
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    req.adminUser = {
      id: user.user_id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
    };
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal security error' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL ENGINE IN PRODUCTION
// ─────────────────────────────────────────────────────────────────────────────
function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }

  return nodemailer.createTransport({
    name: 'entropy-mock',
    version: '1.0.0',
    send: (mail, cb) => {
      const messageId = `<prod_mock_${Date.now()}@entropy.design>`;
      console.log(`📨 [PROD MOCK EMAIL] To: ${mail.data.to} | Subject: ${mail.data.subject}`);
      cb(null, { messageId, response: '250 Mock Accepted' });
    },
  });
}

const transporter = getTransporter();

async function processOutboxQueue() {
  const now = Date.now();
  const jobs = db.prepare(`
    SELECT * FROM email_outbox 
    WHERE status IN ('Pending', 'Retry Scheduled') AND next_retry_at <= ?
    LIMIT 10
  `).all(now);

  for (const job of jobs) {
    db.prepare("UPDATE email_outbox SET status = 'Processing', updated_at = ? WHERE id = ?").run(Date.now(), job.id);
    try {
      const payload = JSON.parse(job.payload);
      let subject = job.subject;
      let text = `ENTROPY transmission: ${subject}\n\nRecipient: ${job.recipient}`;
      let html = `<p>${text}</p>`;

      if (job.template_type === 'CLIENT_CONFIRMATION') {
        text = `Hi ${payload.client_name},\n\nWe've received your project enquiry.\nReference: ${payload.enquiry_reference}\nBudget: ${payload.budget_range}\n\nENTROPY`;
        html = `<h2>Enquiry Received</h2><p>Hi ${payload.client_name},</p><p>We have received your brief. Reference: <strong>${payload.enquiry_reference}</strong>.</p><p>ENTROPY Studio</p>`;
      }

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'ENTROPY <entropy.helpdesk@gmail.com>',
        to: job.recipient,
        subject,
        text,
        html,
      });

      db.prepare("UPDATE email_outbox SET status = 'Accepted', provider_message_id = ?, delivered_at = ?, updated_at = ? WHERE id = ?")
        .run(info.messageId || 'msg_sent', Date.now(), Date.now(), job.id);
    } catch (err) {
      const newAttempts = job.attempts + 1;
      const status = newAttempts >= job.max_attempts ? 'Failed Permanently' : 'Retry Scheduled';
      const nextRetry = Date.now() + Math.min(3600, Math.pow(2, newAttempts) * 30) * 1000;
      db.prepare("UPDATE email_outbox SET status = ?, attempts = ?, next_retry_at = ?, last_error = ?, updated_at = ? WHERE id = ?")
        .run(status, newAttempts, nextRetry, err.message, Date.now(), job.id);
    }
  }
}

setInterval(processOutboxQueue, 10000);

// ─────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// 1. Submit Enquiry (Transactional)
app.post('/api/enquiries', (req, res) => {
  const { name, email, country, phone, projectType, pageCount, budgetRange, description, responseMethod } = req.body;
  if (!name || !email || !country || !budgetRange) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  try {
    const enquiryId = `enq_${crypto.randomUUID()}`;
    const now = Date.now();
    const cleanEmail = email.trim().toLowerCase();

    db.exec('BEGIN IMMEDIATE;');

    db.prepare(`
      INSERT INTO enquiries (id, client_name, email, country, phone, project_type, page_count, budget_range, description, response_method, status, admin_notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', '', ?, ?)
    `).run(enquiryId, name.trim(), cleanEmail, country.trim(), phone || null, projectType || null, pageCount || null, budgetRange.trim(), description || null, responseMethod === 'WhatsApp' ? 'WhatsApp' : 'Email', now, now);

    logAuditEvent(null, 'Public Visitor', 'ENQUIRY_SUBMITTED', 'enquiry', enquiryId, {
      client_name: name.trim(),
      email: cleanEmail,
      budget: budgetRange.trim(),
    });

    // Queue Email A: Client Confirmation
    db.prepare(`
      INSERT INTO email_outbox (id, enquiry_id, recipient, template_type, subject, payload, status, attempts, max_attempts, next_retry_at, idempotency_key, created_at, updated_at)
      VALUES (?, ?, ?, 'CLIENT_CONFIRMATION', 'We’ve received your project enquiry — ENTROPY', ?, 'Pending', 0, 5, ?, ?, ?, ?)
    `).run(`job_${crypto.randomUUID()}`, enquiryId, cleanEmail, JSON.stringify({ client_name: name.trim(), enquiry_reference: enquiryId, budget_range: budgetRange.trim() }), now, `idemp_confirm_${enquiryId}`, now, now);

    // Queue Email B: Studio Notification
    const studioEmail = process.env.STUDIO_NOTIFICATION_EMAIL || 'entropy.helpdesk@gmail.com';
    db.prepare(`
      INSERT INTO email_outbox (id, enquiry_id, recipient, template_type, subject, payload, status, attempts, max_attempts, next_retry_at, idempotency_key, created_at, updated_at)
      VALUES (?, ?, ?, 'STUDIO_NOTIFICATION', ?, ?, 'Pending', 0, 5, ?, ?, ?, ?)
    `).run(`job_${crypto.randomUUID()}`, enquiryId, studioEmail, `New project enquiry: ${name.trim()} — ${projectType || 'General'}`, JSON.stringify({ client_name: name.trim(), client_email: cleanEmail, budget_range: budgetRange.trim(), enquiry_reference: enquiryId }), now, `idemp_studio_${enquiryId}`, now, now);

    db.exec('COMMIT;');
    setTimeout(processOutboxQueue, 20);

    res.status(201).json({ success: true, id: enquiryId });
  } catch (err) {
    try { db.exec('ROLLBACK;'); } catch {}
    res.status(500).json({ error: 'Failed to record enquiry.' });
  }
});

// 2. Admin Login
app.post('/api/admin/login', async (req, res) => {
  const ip = getClientIp(req);
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const rateLimit = checkLoginRateLimit(ip, cleanEmail);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: `Too many attempts. Retry in ${rateLimit.retryAfterSeconds}s.` });
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(cleanEmail);
  const isValid = user && user.is_active === 1 ? await verifyPasswordAsync(password, user.password_hash) : false;

  if (!user || user.is_active !== 1 || !isValid) {
    recordFailedLogin(ip, cleanEmail);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  clearLoginRateLimit(ip, cleanEmail);
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  db.prepare(`
    INSERT INTO admin_sessions (id, user_id, token_hash, expires_at, created_at, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(`sess_${crypto.randomUUID()}`, user.id, tokenHash, expiresAt, Date.now(), ip, req.headers['user-agent'] || null);

  db.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').run(Date.now(), user.id);
  logAuditEvent(user.id, user.email, 'ADMIN_LOGIN', 'user', user.id, { ip });

  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `entropy_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}; Max-Age=604800${isProd ? '; Secure' : ''}`);
  res.json({ success: true, user: { id: user.id, email: user.email, displayName: user.display_name, role: user.role } });
});

// 3. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['entropy_admin_session'];
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
  }
  res.setHeader('Set-Cookie', 'entropy_admin_session=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0');
  res.json({ success: true });
});

// 4. Admin Me
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  res.json({ authenticated: true, user: req.adminUser });
});

// 5. Admin Metrics
app.get('/api/admin/metrics', requireAdminAuth, (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS count FROM enquiries').get().count;
  const newCount = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'New'").get().count;
  const awaiting = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status IN ('New', 'Contacted')").get().count;
  const inDiscussion = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'In Discussion'").get().count;
  const proposalSent = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Proposal Sent'").get().count;
  const won = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Won'").get().count;
  const lost = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Lost'").get().count;
  const archived = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Archived'").get().count;

  res.json({ total, new: newCount, awaitingFollowUp: awaiting, inDiscussion, proposalSent, won, lost, archived });
});

// 6. Admin Enquiries List
app.get('/api/admin/enquiries', requireAdminAuth, (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];
  if (search) {
    where.push('(client_name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status && status !== 'All') {
    where.push('status = ?');
    params.push(status);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS count FROM enquiries ${whereSql}`).get(...params).count;
  const records = db.prepare(`SELECT * FROM enquiries ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  res.json({ enquiries: records, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } });
});

// 7. Admin Enquiry Detail
app.get('/api/admin/enquiries/:id', requireAdminAuth, (req, res) => {
  const record = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Not found' });
  const logs = db.prepare('SELECT * FROM admin_audit_logs WHERE target_id = ? ORDER BY created_at DESC').all(req.params.id);
  const emails = db.prepare('SELECT * FROM email_outbox WHERE enquiry_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ enquiry: record, auditLogs: logs, emails });
});

// 8. Admin Enquiry Update
app.patch('/api/admin/enquiries/:id', requireAdminAuth, (req, res) => {
  const { status, adminNotes } = req.body;
  const existing = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  db.prepare('UPDATE enquiries SET status = ?, admin_notes = ?, updated_at = ? WHERE id = ?')
    .run(status || existing.status, typeof adminNotes === 'string' ? adminNotes : existing.admin_notes, Date.now(), req.params.id);

  logAuditEvent(req.adminUser.id, req.adminUser.email, 'ENQUIRY_UPDATED', 'enquiry', req.params.id, {
    newStatus: status || existing.status,
  });

  const updated = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  res.json({ success: true, enquiry: updated });
});

// 9. Admin CSV Export with Formula Injection Neutralization
app.get('/api/admin/export', requireAdminAuth, (_req, res) => {
  const records = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
  const sanitizeCell = (v) => {
    let str = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(str)) str = `'${str}`;
    return `"${str.replace(/"/g, '""')}"`;
  };
  const headers = ['ID', 'Name', 'Email', 'Country', 'Phone', 'Project Type', 'Budget', 'Status', 'Date', 'Description', 'Notes'];
  const rows = [headers.join(',')];
  records.forEach((r) => {
    rows.push([
      sanitizeCell(r.id), sanitizeCell(r.client_name), sanitizeCell(r.email), sanitizeCell(r.country), sanitizeCell(r.phone),
      sanitizeCell(r.project_type), sanitizeCell(r.budget_range), sanitizeCell(r.status), sanitizeCell(new Date(r.created_at).toISOString()),
      sanitizeCell(r.description), sanitizeCell(r.admin_notes)
    ].join(','));
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="entropy-enquiries-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(rows.join('\r\n'));
});

// 10. Admin Users: Create New Admin Account (with Role Validation)
app.post('/api/admin/users', requireAdminAuth, async (req, res) => {
  const { email, password, displayName, role } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Email, password, and display name are required.' });
  }
  if (typeof password !== 'string' || password.length < 10) {
    return res.status(400).json({ error: 'Password must be at least 10 characters long.' });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Password exceeds maximum allowed length.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An admin account with this email already exists.' });
    }

    const ALLOWED_ROLES = ['admin', 'editor'];
    const assignedRole = role && ALLOWED_ROLES.includes(role) ? role : 'admin';
    const userId = `admin_${crypto.randomUUID()}`;
    const passwordHash = await hashPasswordAsync(password);
    const now = Date.now();

    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, display_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(userId, cleanEmail, passwordHash, displayName.trim(), assignedRole, now);

    logAuditEvent(req.adminUser.id, req.adminUser.email, 'ADMIN_USER_CREATED', 'user', userId, {
      created_email: cleanEmail,
      role: assignedRole,
    });

    res.status(201).json({
      success: true,
      user: { id: userId, email: cleanEmail, displayName: displayName.trim(), role: assignedRole },
    });
  } catch (err) {
    console.error('[Create Admin User Error]:', err);
    res.status(500).json({ error: 'Failed to create administrator account.' });
  }
});

// 11. Email Outbox Listing & Retry
app.get('/api/admin/email/outbox', requireAdminAuth, (req, res) => {
  const jobs = db.prepare('SELECT * FROM email_outbox ORDER BY created_at DESC LIMIT 50').all();
  res.json({ jobs });
});

app.post('/api/admin/email/retry/:id', requireAdminAuth, (req, res) => {
  db.prepare("UPDATE email_outbox SET status = 'Pending', attempts = 0, next_retry_at = ?, last_error = NULL, updated_at = ? WHERE id = ?")
    .run(Date.now(), Date.now(), req.params.id);
  logAuditEvent(req.adminUser.id, req.adminUser.email, 'EMAIL_JOB_RETRIED', 'email_job', req.params.id);
  setTimeout(processOutboxQueue, 20);
  res.json({ success: true });
});

// Serve static frontend in production with route-level prerendered HTML resolution
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { redirect: false }));
  app.get('*', (req, res) => {
    const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
    const specificHtml = path.resolve(distDir, cleanPath, 'index.html');
    if (cleanPath && fs.existsSync(specificHtml)) {
      return res.sendFile(specificHtml);
    }
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [ENTROPY Production Server] Listening on http://0.0.0.0:${PORT}`);
  console.log(`📁 Database path: ${path.resolve(dataDir, 'entropy.sqlite')}`);
});
