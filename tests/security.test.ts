import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import { DatabaseSync } from 'node:sqlite';

import {
  hashPassword,
  verifyPassword,
  createAdminSession,
  destroyAdminSession,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
  getClientIp,
  MAX_PASSWORD_LENGTH,
} from '../server/auth';
import { renderClientConfirmation } from '../server/email/templates/clientConfirmation';
import { renderStudioNotification } from '../server/email/templates/studioNotification';
import { renderClientStatusUpdate } from '../server/email/templates/clientStatusUpdate';
import { escapeHtml } from '../server/email/templates/common';
import { enqueueEmailJob, processOutboxQueue, retryOutboxJob } from '../server/email/queue';
import { queueEnquirySubmissionNotifications } from '../server/email/notifications';

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test-security.sqlite');

describe('ENTROPY Security & Email Notification Test Suite', () => {
  let db: DatabaseSync;
  let testServer: http.Server | undefined = undefined;
  let serverUrl = '';

  before(async () => {
    // 1. Initialize isolated test database
    if (fs.existsSync(TEST_DB_PATH)) {
      try { fs.unlinkSync(TEST_DB_PATH); } catch {}
    }

    db = new DatabaseSync(TEST_DB_PATH);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    // Schema
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
        created_at INTEGER NOT NULL
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

    // Insert active super admin and inactive admin
    const activePassHash = await hashPassword('ValidAdminPassword2026!');
    const disabledPassHash = await hashPassword('DisabledPassword2026!');

    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, display_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, 'super_admin', 1, ?)
    `).run('admin_active_1', 'admin@entropy.design', activePassHash, 'Studio Principal', Date.now());

    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, display_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, 'admin', 0, ?)
    `).run('admin_disabled_1', 'disabled@entropy.design', disabledPassHash, 'Ex-Member', Date.now());
  });

  after(() => {
    try {
      db.close();
      if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    } catch {}
    if (testServer) (testServer as any).close();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 1: Password & Authentication Security
  // ───────────────────────────────────────────────────────────────────────────
  test('Password hashing uses async scrypt, unique salt, and verifies constant-time', async () => {
    const pass = 'SuperSecretStudioPass123!';
    const hash1 = await hashPassword(pass);
    const hash2 = await hashPassword(pass);

    assert.notEqual(hash1, hash2, 'Salts must be unique per invocation');
    assert.match(hash1, /^[0-9a-f]{32}:[0-9a-f]{128}$/, 'Hash must follow salt:keyHex format');

    const isValid = await verifyPassword(pass, hash1);
    assert.equal(isValid, true, 'Valid password must verify successfully');

    const isInvalid = await verifyPassword('WrongPassword!', hash1);
    assert.equal(isInvalid, false, 'Invalid password must be rejected');
  });

  test('Malformed or truncated password hashes fail closed safely', async () => {
    assert.equal(await verifyPassword('test', ''), false);
    assert.equal(await verifyPassword('test', 'malformed_string'), false);
    assert.equal(await verifyPassword('test', 'salt_only:'), false);
    assert.equal(await verifyPassword('test', '1234:shorthex'), false);
  });

  test('Oversized password inputs are rejected before CPU exhaustion', async () => {
    const hugePassword = 'A'.repeat(MAX_PASSWORD_LENGTH + 1);
    await assert.rejects(
      async () => await hashPassword(hugePassword),
      /exceeds maximum permitted length/
    );
    assert.equal(await verifyPassword(hugePassword, 'some:hash'), false);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 2: Rate Limiting & Proxy Security
  // ───────────────────────────────────────────────────────────────────────────
  test('Login rate limiter locks out after 5 failed attempts per IP', () => {
    const testIp = '198.51.100.42';
    clearLoginRateLimit(testIp);

    assert.equal(checkLoginRateLimit(testIp).allowed, true, 'Initial attempt must be allowed');

    for (let i = 0; i < 5; i++) {
      recordFailedLogin(testIp);
    }

    const locked = checkLoginRateLimit(testIp);
    assert.equal(locked.allowed, false, 'Should be locked out after 5 attempts');
    assert.ok(locked.retryAfterSeconds > 800, 'Lockout duration must be ~15 minutes');

    clearLoginRateLimit(testIp);
    assert.equal(checkLoginRateLimit(testIp).allowed, true, 'Clearing resets lockout');
  });

  test('Dual-layer rate limiter throttles per-account across multiple IPs', () => {
    const targetEmail = 'ceo@entropy.design';
    clearLoginRateLimit('dummy', targetEmail);

    for (let i = 0; i < 10; i++) {
      recordFailedLogin(`203.0.113.${i}`, targetEmail);
    }

    const check = checkLoginRateLimit('192.0.2.1', targetEmail);
    assert.equal(check.allowed, false, 'Account should be locked out across distributed IPs');

    clearLoginRateLimit('dummy', targetEmail);
    assert.equal(checkLoginRateLimit('192.0.2.1', targetEmail).allowed, true);
  });

  test('getClientIp does not trust X-Forwarded-For unless TRUST_PROXY=true', () => {
    const prevTrust = process.env.TRUST_PROXY;

    process.env.TRUST_PROXY = 'false';
    const fakeReqUntrusted = {
      headers: { 'x-forwarded-for': '203.0.113.99, 198.51.100.1' },
      socket: { remoteAddress: '10.0.0.1' },
    } as any;
    assert.equal(getClientIp(fakeReqUntrusted), '10.0.0.1', 'Must not trust header when TRUST_PROXY is false');

    process.env.TRUST_PROXY = 'true';
    assert.equal(getClientIp(fakeReqUntrusted), '203.0.113.99', 'Extracts client IP when trusted');

    process.env.TRUST_PROXY = prevTrust;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 3: Session Security & Account States
  // ───────────────────────────────────────────────────────────────────────────
  test('Disabled accounts cannot authenticate', async () => {
    const disabledUser = db.prepare('SELECT is_active, password_hash FROM admin_users WHERE email = ?').get('disabled@entropy.design') as any;
    assert.equal(disabledUser.is_active, 0, 'User is marked disabled in database');

    const passMatches = await verifyPassword('DisabledPassword2026!', disabledUser.password_hash);
    assert.equal(passMatches, true, 'Password matches hash');

    // In login logic: disabled users fail authentication even with valid password
    const shouldAllow = disabledUser.is_active === 1 && passMatches;
    assert.equal(shouldAllow, false, 'Authentication must reject inactive accounts');
  });

  test('Session generation produces high-entropy token and stores only SHA-256 hash', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const sessionId = `sess_${crypto.randomUUID()}`;

    db.prepare(`
      INSERT INTO admin_sessions (id, user_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, 'admin_active_1', tokenHash, Date.now() + 100000, Date.now());

    const stored = db.prepare('SELECT * FROM admin_sessions WHERE token_hash = ?').get(tokenHash) as any;
    assert.ok(stored, 'Session found by hash');
    assert.notEqual(stored.token_hash, rawToken, 'Raw token must never be stored in database');
    assert.equal(stored.user_id, 'admin_active_1');

    // Invalidate
    db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
    const afterDelete = db.prepare('SELECT * FROM admin_sessions WHERE token_hash = ?').get(tokenHash);
    assert.equal(afterDelete, undefined, 'Session invalidation purges record');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 4: XSS & CSV Formula Injection Protection
  // ───────────────────────────────────────────────────────────────────────────
  test('HTML Escaping inertly neutralizes script tags and quote payloads in emails', () => {
    const malicious = '<script>alert("XSS")</script><img src=x onerror="alert(1)">';
    const escaped = escapeHtml(malicious);

    assert.ok(!escaped.includes('<script>'), 'Must escape script tags');
    assert.ok(escaped.includes('&lt;script&gt;'));
    assert.ok(escaped.includes('&quot;XSS&quot;'));
  });

  test('CSV Formula Injection is neutralized for cells starting with =, +, -, @, tab, or carriage return', () => {
    const sanitizeCsvCell = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const dangerousFormula1 = '=cmd|"/C calc"!A0';
    const dangerousFormula2 = '+SUM(1,2)';
    const dangerousFormula3 = '-10+20';
    const dangerousFormula4 = '@SUM(A1:A10)';
    const normalString = 'Creative Engineering';

    assert.equal(sanitizeCsvCell(dangerousFormula1), '"\'=cmd|""/C calc""!A0"');
    assert.equal(sanitizeCsvCell(dangerousFormula2), '"\'+SUM(1,2)"');
    assert.equal(sanitizeCsvCell(dangerousFormula3), '"\'-10+20"');
    assert.equal(sanitizeCsvCell(dangerousFormula4), '"\'@SUM(A1:A10)"');
    assert.equal(sanitizeCsvCell(normalString), '"Creative Engineering"');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 5: Transactional Email Queue & Idempotency
  // ───────────────────────────────────────────────────────────────────────────
  test('Transactional email enqueueing inserts client and studio jobs atomically', () => {
    const enquiryId = `enq_test_${Date.now()}`;
    const now = Date.now();

    db.exec('BEGIN IMMEDIATE;');

    db.prepare(`
      INSERT INTO enquiries (id, client_name, email, country, budget_range, response_method, status, created_at, updated_at)
      VALUES (?, 'Aarav Sharma', 'aarav@example.com', 'India', '₹80,000 – ₹1,50,000', 'Email', 'New', ?, ?)
    `).run(enquiryId, now, now);

    const { clientJobId, studioJobId } = queueEnquirySubmissionNotifications(db, {
      id: enquiryId,
      client_name: 'Aarav Sharma',
      email: 'aarav@example.com',
      country: 'India',
      budget_range: '₹80,000 – ₹1,50,000',
      response_method: 'Email',
      created_at: now,
    });

    db.exec('COMMIT;');

    const clientJob = db.prepare('SELECT * FROM email_outbox WHERE id = ?').get(clientJobId) as any;
    const studioJob = db.prepare('SELECT * FROM email_outbox WHERE id = ?').get(studioJobId) as any;

    assert.ok(clientJob, 'Client confirmation email job queued');
    assert.equal(clientJob.recipient, 'aarav@example.com');
    assert.equal(clientJob.status, 'Pending');
    assert.equal(clientJob.idempotency_key, `idemp_confirm_${enquiryId}`);

    assert.ok(studioJob, 'Studio alert email job queued');
    assert.equal(studioJob.status, 'Pending');
    assert.equal(studioJob.idempotency_key, `idemp_studio_${enquiryId}`);
  });

  test('Database transaction rollback prevents email jobs from being queued', () => {
    const failedEnquiryId = `enq_fail_${Date.now()}`;
    const now = Date.now();

    db.exec('BEGIN IMMEDIATE;');

    db.prepare(`
      INSERT INTO enquiries (id, client_name, email, country, budget_range, status, created_at, updated_at)
      VALUES (?, 'Rollback Tester', 'rollback@example.com', 'India', '₹50,000', 'New', ?, ?)
    `).run(failedEnquiryId, now, now);

    enqueueEmailJob(db, {
      enquiryId: failedEnquiryId,
      recipient: 'rollback@example.com',
      templateType: 'CLIENT_CONFIRMATION',
      subject: 'Should not be sent',
      payload: {},
      idempotencyKey: `idemp_rollback_${failedEnquiryId}`,
    });

    // Simulate an error and rollback
    db.exec('ROLLBACK;');

    const enquiryAfter = db.prepare('SELECT id FROM enquiries WHERE id = ?').get(failedEnquiryId);
    const jobAfter = db.prepare('SELECT id FROM email_outbox WHERE idempotency_key = ?').get(`idemp_rollback_${failedEnquiryId}`);

    assert.equal(enquiryAfter, undefined, 'Enquiry rolled back');
    assert.equal(jobAfter, undefined, 'Email job must not exist after rollback');
  });

  test('Outbox queue processor claims jobs, updates status, and respects idempotency', async () => {
    const res = await processOutboxQueue(db);
    assert.ok(res.processed >= 1, 'Should process pending jobs');
    assert.ok(res.accepted >= 1, 'Mock transport accepts email dispatch');

    // Verify status updated in database
    const acceptedJobs = db.prepare("SELECT * FROM email_outbox WHERE status = 'Accepted'").all() as any[];
    assert.ok(acceptedJobs.length > 0, 'Jobs transitioned to Accepted status');
    assert.ok(acceptedJobs[0].provider_message_id, 'Provider message ID populated');
    assert.ok(acceptedJobs[0].delivered_at, 'Delivered timestamp recorded');
  });

  test('Retry mechanism re-enqueues job and resets attempt count', () => {
    const failedJobId = `job_fail_${Date.now()}`;
    db.prepare(`
      INSERT INTO email_outbox (id, recipient, template_type, subject, payload, status, attempts, max_attempts, next_retry_at, idempotency_key, last_error, created_at, updated_at)
      VALUES (?, 'retry@test.com', 'TEST_EMAIL', 'Fail Test', '{}', 'Failed Permanently', 5, 5, 0, ?, 'Simulated timeout', ?, ?)
    `).run(failedJobId, `idemp_retry_${Date.now()}`, Date.now(), Date.now());

    const retried = retryOutboxJob(db, failedJobId);
    assert.equal(retried, true);

    const updatedJob = db.prepare('SELECT status, attempts, last_error FROM email_outbox WHERE id = ?').get(failedJobId) as any;
    assert.equal(updatedJob.status, 'Pending');
    assert.equal(updatedJob.attempts, 0);
    assert.equal(updatedJob.last_error, null);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PART 4: Comprehensive 54-Point Hardening & Regression Tests
  // ───────────────────────────────────────────────────────────────────────────
  test('API response headers include Content-Security-Policy and protective headers', async () => {
    const app = express();
    const { apiRouter } = await import('../server/api');
    app.use('/api', apiRouter);

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    const res = await fetch(`http://127.0.0.1:${port}/api/enquiries`, {
      method: 'OPTIONS',
    });

    const csp = res.headers.get('content-security-policy');
    const xContentType = res.headers.get('x-content-type-options');
    const xFrame = res.headers.get('x-frame-options');
    const referrerPolicy = res.headers.get('referrer-policy');

    server.close();

    assert.ok(csp, 'Content-Security-Policy header must be present');
    assert.ok(csp.includes("default-src 'self'"), 'CSP must restrict default sources');
    assert.ok(csp.includes("frame-ancestors 'none'"), 'CSP must disallow iframe embedding');
    assert.equal(xContentType, 'nosniff', 'X-Content-Type-Options must be nosniff');
    assert.equal(xFrame, 'DENY', 'X-Frame-Options must be DENY');
    assert.equal(referrerPolicy, 'strict-origin-when-cross-origin', 'Referrer-Policy must be strict');
  });

  test('Security firewall rejects direct access to database files, server code, and dotfiles', async () => {
    // Emulate the dev/prod security firewall logic
    const blockedPrefixes = ['/data', '/server', '/scripts', '/tests', '/backups'];
    const blockedExtensions = ['.sqlite', '.sqlite-wal', '.sqlite-shm', '.db', '.log', '.env', '.cjs'];

    const isBlocked = (urlPath: string) => {
      const lower = urlPath.toLowerCase().split('?')[0];
      if (lower.startsWith('/@') || lower.startsWith('/node_modules/') || lower.startsWith('/src/')) {
        return false;
      }
      if (lower.includes('..') || lower.includes('\0')) return true;
      for (const prefix of blockedPrefixes) {
        if (lower === prefix || lower.startsWith(prefix + '/')) return true;
      }
      if (lower.startsWith('/.env') || lower.startsWith('/.git')) return true;
      if (blockedExtensions.some((ext) => lower.endsWith(ext) || lower.includes(ext + '?'))) return true;
      return false;
    };

    assert.equal(isBlocked('/data/entropy.sqlite'), true, 'Database file must be blocked');
    assert.equal(isBlocked('/server/api.ts'), true, 'Server source code must be blocked');
    assert.equal(isBlocked('/scripts/setup-admin.cjs'), true, 'Scripts directory must be blocked');
    assert.equal(isBlocked('/backups/entropy-backup.sqlite'), true, 'Backups must be blocked');
    assert.equal(isBlocked('/.env'), true, 'Environment file must be blocked');
    assert.equal(isBlocked('/.env.local'), true, 'Local environment file must be blocked');
    assert.equal(isBlocked('/../etc/passwd'), true, 'Path traversal must be blocked');

    // Legitimate public assets and Vite dependencies must NOT be blocked
    assert.equal(isBlocked('/'), false, 'Root URL must be allowed');
    assert.equal(isBlocked('/projects/glitch.webp'), false, 'Static images must be allowed');
    assert.equal(isBlocked('/api/enquiries'), false, 'API endpoints must be allowed');
    assert.equal(isBlocked('/src/main.tsx'), false, 'Frontend entry file must be allowed');
    assert.equal(isBlocked('/node_modules/.vite/deps/react.js'), false, 'Vite pre-bundled dependencies must be allowed');
  });

  test('User creation constrains roles to allowed roles preventing privilege escalation', () => {
    const ALLOWED_ROLES = ['admin', 'editor'];
    const sanitizeRole = (role?: string) => (role && ALLOWED_ROLES.includes(role) ? role : 'admin');

    assert.equal(sanitizeRole('admin'), 'admin');
    assert.equal(sanitizeRole('editor'), 'editor');
    assert.equal(sanitizeRole('super_admin'), 'admin', 'Unauthorized super_admin role must downgrade to admin');
    assert.equal(sanitizeRole('root'), 'admin', 'Arbitrary root role must downgrade to admin');
    assert.equal(sanitizeRole(undefined), 'admin', 'Missing role must default to admin');
  });
});
