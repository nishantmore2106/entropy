import express, { Request, Response, Router } from 'express';
import crypto from 'node:crypto';
import { getDatabase } from './db';
import {
  hashPassword,
  verifyPassword,
  createAdminSession,
  destroyAdminSession,
  setSessionCookie,
  clearSessionCookie,
  requireAdminAuth,
  requireCsrfProtection,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
  getClientIp,
  parseCookies,
  logAuditEvent,
  MAX_PASSWORD_LENGTH,
  MAX_EMAIL_LENGTH,
  type AuthenticatedRequest,
} from './auth';
import {
  queueEnquirySubmissionNotifications,
  queueManualClientEmail,
  queueDiagnosticTestEmail,
} from './email/notifications';
import { processOutboxQueue, retryOutboxJob } from './email/queue';
import { verifyMailerConnection } from './email/mailer';

export const apiRouter: Router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Global Security Headers Middleware
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
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

// Middleware to parse JSON request bodies with bounded payload limits
apiRouter.use(express.json({ limit: '500kb' }));

// Apply CSRF protection to state-changing requests
apiRouter.use(requireCsrfProtection);

// In-memory rate limiting for public enquiry submissions (Spam protection)
const enquirySubmissions = new Map<string, { count: number; resetAt: number }>();

function checkEnquiryRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = enquirySubmissions.get(ip);

  if (!record || record.resetAt <= now) {
    enquirySubmissions.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 }); // 10 min window
    return true;
  }

  if (record.count >= 10) {
    return false;
  }

  record.count += 1;
  return true;
}

// Simple email regex RFC 5322 compliant check
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLIC API: Submit Project Enquiry (Transactional SQLite + Email Queue)
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.post('/enquiries', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);

  if (!checkEnquiryRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many submissions from this connection. Please wait 10 minutes.' });
    return;
  }

  const {
    name,
    email,
    country,
    phone,
    projectType,
    pageCount,
    budgetRange,
    description,
    responseMethod,
  } = req.body;

  // Strict Validation and Sanitization
  if (!name || typeof name !== 'string' || !name.trim() || name.length > 100) {
    res.status(400).json({ error: 'Valid client name is required (max 100 characters).' });
    return;
  }

  if (!email || typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email.trim())) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  if (!country || typeof country !== 'string' || country.length > 100) {
    res.status(400).json({ error: 'Valid country is required.' });
    return;
  }

  if (!budgetRange || typeof budgetRange !== 'string' || budgetRange.length > 100) {
    res.status(400).json({ error: 'Budget range selection is required.' });
    return;
  }

  if (description && (typeof description !== 'string' || description.length > 10000)) {
    res.status(400).json({ error: 'Project description exceeds maximum permitted size.' });
    return;
  }

  if (phone && (typeof phone !== 'string' || phone.length > 40)) {
    res.status(400).json({ error: 'Phone number format invalid.' });
    return;
  }

  const db = getDatabase();
  const enquiryId = `enq_${crypto.randomUUID()}`;
  const now = Date.now();
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanCountry = country.trim();
  const cleanPhone = phone ? phone.trim() : null;
  const cleanProjectType = projectType ? String(projectType).trim() : null;
  const cleanPageCount = pageCount ? String(pageCount).trim() : null;
  const cleanBudget = budgetRange.trim();
  const cleanDescription = description ? description.trim() : null;
  const cleanResponse = responseMethod === 'WhatsApp' ? 'WhatsApp' : 'Email';

  try {
    // Execute atomic SQLite transaction: Enquiry + Audit Log + Outbox Jobs
    db.exec('BEGIN IMMEDIATE;');

    const insertStmt = db.prepare(`
      INSERT INTO enquiries (
        id, client_name, email, country, phone, project_type, page_count,
        budget_range, description, response_method, status, admin_notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', '', ?, ?)
    `);

    insertStmt.run(
      enquiryId,
      cleanName,
      normalizedEmail,
      cleanCountry,
      cleanPhone,
      cleanProjectType,
      cleanPageCount,
      cleanBudget,
      cleanDescription,
      cleanResponse,
      now,
      now
    );

    // Audit log
    logAuditEvent(null, 'Public Visitor', 'ENQUIRY_SUBMITTED', 'enquiry', enquiryId, {
      client_name: cleanName,
      email: normalizedEmail,
      project_type: cleanProjectType,
      budget: cleanBudget,
    });

    // Enqueue transactional email jobs in the SAME transaction
    queueEnquirySubmissionNotifications(db, {
      id: enquiryId,
      client_name: cleanName,
      email: normalizedEmail,
      country: cleanCountry,
      phone: cleanPhone,
      project_type: cleanProjectType,
      page_count: cleanPageCount,
      budget_range: cleanBudget,
      description: cleanDescription,
      response_method: cleanResponse,
      created_at: now,
    });

    db.exec('COMMIT;');

    // Trigger immediate outbox tick asynchronously
    setTimeout(() => processOutboxQueue().catch(console.error), 20);

    res.status(201).json({
      success: true,
      id: enquiryId,
      message: 'Enquiry received successfully',
    });
  } catch (error) {
    try {
      db.exec('ROLLBACK;');
    } catch {}
    console.error('[Enquiry Submission Error]:', error);
    res.status(500).json({ error: 'An error occurred while transmitting the brief. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ADMIN AUTH: Asynchronous Login with Persistent Dual-Layer Rate Limiting
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.post('/admin/login', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Enforce bounds before rate limit or hashing
  if (normalizedEmail.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    res.status(400).json({ error: 'Input exceeds maximum allowed length.' });
    return;
  }

  // Persistent dual-layer rate check (checked before expensive password hashing)
  const rateLimit = checkLoginRateLimit(clientIp, normalizedEmail);
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
    });
    return;
  }

  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM admin_users WHERE email = ?');
    const user = stmt.get(normalizedEmail) as {
      id: string;
      email: string;
      password_hash: string;
      display_name: string;
      role: string;
      is_active: number;
    } | undefined;

    // Asynchronously verify password against stored scrypt hash
    const isValidPassword = user && user.is_active === 1
      ? await verifyPassword(password, user.password_hash)
      : false;

    if (!user || user.is_active !== 1 || !isValidPassword) {
      recordFailedLogin(clientIp, normalizedEmail);
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Reset rate limits on success
    clearLoginRateLimit(clientIp, normalizedEmail);

    // Update last login timestamp
    const now = Date.now();
    db.prepare('UPDATE admin_users SET last_login_at = ? WHERE id = ?').run(now, user.id);

    // Create session
    const userAgent = (req.headers['user-agent'] as string) || '';
    const { token, expiresAt } = createAdminSession(user.id, clientIp, userAgent);

    // Set secure HttpOnly session cookie
    setSessionCookie(res, token, expiresAt);

    // Audit log
    logAuditEvent(user.id, user.email, 'ADMIN_LOGIN', 'user', user.id, { ip: clientIp });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Admin Login Error]:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADMIN AUTH: Logout
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['entropy_admin_session'];

  if (token) {
    destroyAdminSession(token);
  }

  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADMIN AUTH: Get Current Admin Identity
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.get('/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    authenticated: true,
    user: req.adminUser,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. ADMIN METRICS: Overview Stats
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.get('/admin/metrics', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();

    const totalRow = db.prepare('SELECT COUNT(*) AS count FROM enquiries').get() as { count: number };
    const newRow = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'New'").get() as { count: number };
    const awaitingRow = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status IN ('New', 'Contacted')").get() as { count: number };
    const inDiscussionRow = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'In Discussion'").get() as { count: number };
    const proposalSentRow = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Proposal Sent'").get() as { count: number };
    const wonRow = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Won'").get() as { count: number };
    const lostRow = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Lost'").get() as { count: number };
    const archivedRow = db.prepare("SELECT COUNT(*) AS count FROM enquiries WHERE status = 'Archived'").get() as { count: number };

    res.json({
      total: totalRow.count,
      new: newRow.count,
      awaitingFollowUp: awaitingRow.count,
      inDiscussion: inDiscussionRow.count,
      proposalSent: proposalSentRow.count,
      won: wonRow.count,
      lost: lostRow.count,
      archived: archivedRow.count,
    });
  } catch (error) {
    console.error('[Admin Metrics Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve overview metrics.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ADMIN ENQUIRIES: Filtered, Searchable & Paginated List
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.get('/admin/enquiries', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const projectType = typeof req.query.projectType === 'string' ? req.query.projectType.trim() : '';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (search) {
      whereClauses.push('(client_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (projectType && projectType !== 'All') {
      whereClauses.push('project_type = ?');
      params.push(projectType);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countStmt = db.prepare(`SELECT COUNT(*) AS count FROM enquiries ${whereSql}`);
    const totalMatching = (countStmt.get(...params) as { count: number }).count;

    const selectSql = `
      SELECT 
        id, client_name, email, country, phone, project_type, page_count,
        budget_range, response_method, status, created_at, updated_at
      FROM enquiries
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const records = db.prepare(selectSql).all(...params, limit, offset);

    res.json({
      enquiries: records,
      pagination: {
        total: totalMatching,
        page,
        limit,
        totalPages: Math.ceil(totalMatching / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Admin Enquiries List Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve enquiries list.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. ADMIN ENQUIRY: Individual Record Details & Audit Trail
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.get('/admin/enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const enquiry = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id);

    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }

    const logs = db.prepare(`
      SELECT * FROM admin_audit_logs 
      WHERE target_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(id);

    // Also fetch associated email transmissions
    const emails = db.prepare(`
      SELECT id, template_type, recipient, subject, status, attempts, created_at, delivered_at, last_error
      FROM email_outbox
      WHERE enquiry_id = ?
      ORDER BY created_at DESC
    `).all(id);

    res.json({
      enquiry,
      auditLogs: logs,
      emails,
    });
  } catch (error) {
    console.error('[Admin Enquiry Detail Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve enquiry details.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. ADMIN ENQUIRY: Update Status & Admin Notes
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.patch('/admin/enquiries/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const existing = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id) as any;

    if (!existing) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }

    const VALID_STATUSES = [
      'New',
      'Contacted',
      'In Discussion',
      'Proposal Sent',
      'Won',
      'Lost',
      'Archived',
    ];

    const newStatus = status && VALID_STATUSES.includes(status) ? status : existing.status;
    const newNotes = typeof adminNotes === 'string' ? adminNotes.slice(0, 5000) : existing.admin_notes;
    const now = Date.now();

    const updateStmt = db.prepare(`
      UPDATE enquiries 
      SET status = ?, admin_notes = ?, updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(newStatus, newNotes, now, id);

    if (newStatus !== existing.status || newNotes !== existing.admin_notes) {
      logAuditEvent(
        req.adminUser!.id,
        req.adminUser!.email,
        'ENQUIRY_UPDATED',
        'enquiry',
        id,
        {
          previousStatus: existing.status,
          newStatus,
          notesChanged: newNotes !== existing.admin_notes,
        }
      );
    }

    const updated = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id);
    res.json({ success: true, enquiry: updated });
  } catch (error) {
    console.error('[Admin Enquiry Update Error]:', error);
    res.status(500).json({ error: 'Failed to update enquiry.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. ADMIN EXPORT: CSV Download with Spreadsheet Formula Injection Protection
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.get('/admin/export', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();
    const records = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all() as any[];

    const headers = [
      'Enquiry ID',
      'Client Name',
      'Email',
      'Country',
      'Phone',
      'Project Type',
      'Pages',
      'Budget Range',
      'Response Method',
      'Status',
      'Submitted At',
      'Description',
      'Admin Notes',
    ];

    // Mitigates CSV Formula Injection (Prepends ' to cells starting with =, +, -, @, tab, or carriage return)
    const sanitizeCsvCell = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);

      // Check for formula trigger characters
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }

      // Escape quotes
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];

    for (const r of records) {
      const row = [
        sanitizeCsvCell(r.id),
        sanitizeCsvCell(r.client_name),
        sanitizeCsvCell(r.email),
        sanitizeCsvCell(r.country),
        sanitizeCsvCell(r.phone),
        sanitizeCsvCell(r.project_type),
        sanitizeCsvCell(r.page_count),
        sanitizeCsvCell(r.budget_range),
        sanitizeCsvCell(r.response_method),
        sanitizeCsvCell(r.status),
        sanitizeCsvCell(new Date(r.created_at).toISOString()),
        sanitizeCsvCell(r.description),
        sanitizeCsvCell(r.admin_notes),
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="entropy-enquiries-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('[Admin Export Error]:', error);
    res.status(500).json({ error: 'Failed to export enquiries data.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. ADMIN USERS: Create New Administrator Account
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.post('/admin/users', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, displayName, role } = req.body;

  if (!email || !password || !displayName) {
    res.status(400).json({ error: 'Email, password, and display name are required.' });
    return;
  }

  if (typeof password !== 'string' || password.length < 10) {
    res.status(400).json({ error: 'Password must be at least 10 characters long.' });
    return;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    res.status(400).json({ error: 'Password exceeds maximum permitted length.' });
    return;
  }

  try {
    const db = getDatabase();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An admin account with this email already exists.' });
      return;
    }

    const userId = `admin_${crypto.randomUUID()}`;
    const passwordHash = await hashPassword(password);
    const now = Date.now();

    const ALLOWED_ROLES = ['admin', 'editor'];
    const assignedRole = role && ALLOWED_ROLES.includes(role) ? role : 'admin';

    const insert = db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, display_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);

    insert.run(userId, normalizedEmail, passwordHash, displayName.trim(), assignedRole, now);

    logAuditEvent(req.adminUser!.id, req.adminUser!.email, 'ADMIN_USER_CREATED', 'user', userId, {
      created_email: normalizedEmail,
      role: assignedRole,
    });

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        email: normalizedEmail,
        displayName: displayName.trim(),
        role: assignedRole,
      },
    });
  } catch (error: any) {
    console.error('[Create Admin User Error]:', error);
    const clientMsg = process.env.NODE_ENV === 'production'
      ? 'Failed to create administrator account.'
      : (error?.message || 'Failed to create administrator account.');
    res.status(500).json({ error: clientMsg });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. EMAIL ADMIN: List Outbox Activity & Real-Time Stats
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.get('/admin/email/outbox', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();

    const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (statusFilter && statusFilter !== 'All') {
      whereClauses.push('status = ?');
      params.push(statusFilter);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const totalMatching = (db.prepare(`SELECT COUNT(*) AS count FROM email_outbox ${whereSql}`).get(...params) as any).count;
    const pendingCount = (db.prepare("SELECT COUNT(*) AS count FROM email_outbox WHERE status = 'Pending'").get() as any).count;
    const acceptedCount = (db.prepare("SELECT COUNT(*) AS count FROM email_outbox WHERE status = 'Accepted'").get() as any).count;
    const retriedCount = (db.prepare("SELECT COUNT(*) AS count FROM email_outbox WHERE status = 'Retry Scheduled'").get() as any).count;
    const failedCount = (db.prepare("SELECT COUNT(*) AS count FROM email_outbox WHERE status = 'Failed Permanently'").get() as any).count;

    const jobs = db.prepare(`
      SELECT 
        id, enquiry_id, recipient, template_type, subject, payload,
        status, attempts, max_attempts, next_retry_at, idempotency_key,
        provider_message_id, last_error, created_at, updated_at, delivered_at
      FROM email_outbox
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      jobs,
      counts: {
        total: totalMatching,
        pending: pendingCount,
        accepted: acceptedCount,
        retrying: retriedCount,
        failed: failedCount,
      },
      pagination: {
        total: totalMatching,
        page,
        limit,
        totalPages: Math.ceil(totalMatching / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Email Outbox List Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve email outbox records.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. EMAIL ADMIN: Retry a Failed Job
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.post('/admin/email/retry/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const success = retryOutboxJob(db, id);
    if (!success) {
      res.status(404).json({ error: 'Email job not found.' });
      return;
    }

    logAuditEvent(req.adminUser!.id, req.adminUser!.email, 'EMAIL_JOB_RETRIED', 'email_job', id);

    res.json({ success: true, message: 'Job scheduled for immediate re-attempt.' });
  } catch (error) {
    console.error('[Email Retry Error]:', error);
    res.status(500).json({ error: 'Failed to reschedule email job.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. EMAIL ADMIN: Send Diagnostic Test Email
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.post('/admin/email/test', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { recipient } = req.body;
  const targetRecipient = (recipient && typeof recipient === 'string' && EMAIL_REGEX.test(recipient.trim()))
    ? recipient.trim().toLowerCase()
    : 'entropy.helpdesk@gmail.com';

  try {
    const db = getDatabase();
    const jobId = queueDiagnosticTestEmail(db, targetRecipient, req.adminUser!.displayName);

    // Process immediately
    await processOutboxQueue(db);

    const job = db.prepare('SELECT * FROM email_outbox WHERE id = ?').get(jobId) as any;
    const connectionInfo = await verifyMailerConnection();

    logAuditEvent(req.adminUser!.id, req.adminUser!.email, 'TEST_EMAIL_DISPATCHED', 'email_job', jobId, {
      recipient: targetRecipient,
      status: job?.status,
    });

    res.json({
      success: job?.status === 'Accepted',
      status: job?.status,
      messageId: job?.provider_message_id,
      recipient: targetRecipient,
      connection: connectionInfo,
      note: 'Status reflects transport acceptance. Does not guarantee inbox placement by recipient ISP.',
    });
  } catch (error: any) {
    console.error('[Test Email Error]:', error);
    const clientMsg = process.env.NODE_ENV === 'production'
      ? 'Failed to dispatch test transmission.'
      : (error?.message || 'Failed to dispatch test transmission.');
    res.status(500).json({ error: clientMsg });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. EMAIL ADMIN: Deliberately Send Status Update / Proposal Email to Client
// ─────────────────────────────────────────────────────────────────────────────
apiRouter.post('/admin/enquiries/:id/email', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { subject, message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'Message body cannot be empty.' });
    return;
  }

  try {
    const db = getDatabase();
    const enquiry = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id) as any;

    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }

    const jobId = queueManualClientEmail(db, {
      enquiryId: id,
      clientEmail: enquiry.email,
      clientName: enquiry.client_name,
      subject: subject && typeof subject === 'string' ? subject.trim() : undefined,
      adminMessage: message.trim(),
      adminEmail: req.adminUser!.email,
    });

    // Audit log
    logAuditEvent(req.adminUser!.id, req.adminUser!.email, 'CLIENT_EMAIL_SENT', 'enquiry', id, {
      recipient: enquiry.email,
      jobId,
      subject,
    });

    // Trigger immediate outbox tick
    setTimeout(() => processOutboxQueue().catch(console.error), 20);

    res.json({
      success: true,
      jobId,
      message: 'Status update transmission queued successfully for delivery.',
    });
  } catch (error) {
    console.error('[Manual Client Email Error]:', error);
    res.status(500).json({ error: 'Failed to queue client email.' });
  }
});

export default apiRouter;
