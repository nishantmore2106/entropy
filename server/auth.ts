import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { getDatabase } from './db';

export const SESSION_COOKIE_NAME = 'entropy_admin_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days absolute lifetime
export const SESSION_IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours idle timeout
export const MAX_PASSWORD_LENGTH = 128; // Upper bound to prevent DoS via CPU exhaustion
export const MAX_EMAIL_LENGTH = 254;

/**
 * Extracts client IP securely with proxy-awareness.
 * Only trusts X-Forwarded-For when TRUST_PROXY === 'true'.
 */
export function getClientIp(req: Request): string {
  const trustProxy = process.env.TRUST_PROXY === 'true';
  if (trustProxy && req.headers['x-forwarded-for']) {
    const rawForwarded = req.headers['x-forwarded-for'];
    const forwardedStr = Array.isArray(rawForwarded) ? rawForwarded[0] : rawForwarded;
    const clientIp = forwardedStr.split(',')[0].trim();
    if (clientIp) return clientIp;
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Asynchronously hashes a plaintext password using crypto.scrypt with a unique 16-byte salt.
 * Returns formatted string "salt:derivedKeyHex".
 * Non-blocking: executes on libuv worker threads instead of freezing the event loop.
 */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof password !== 'string') {
      return reject(new Error('Password must be a string'));
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return reject(new Error(`Password exceeds maximum permitted length of ${MAX_PASSWORD_LENGTH} characters`));
    }
    if (password.length < 8) {
      return reject(new Error('Password must be at least 8 characters long'));
    }

    const salt = crypto.randomBytes(16).toString('hex');
    // Work factor: N=16384, r=8, p=1 (standard scrypt parameters)
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Asynchronously verifies a plaintext password against a stored "salt:derivedKeyHex" hash
 * using constant-time comparison to prevent timing attacks.
 * Fails safely if hash format is corrupted or malformed.
 */
export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof password !== 'string' || typeof storedHash !== 'string') {
      return resolve(false);
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return resolve(false);
    }

    try {
      const parts = storedHash.split(':');
      if (parts.length !== 2) return resolve(false);

      const [salt, keyHex] = parts;
      if (!salt || !keyHex || keyHex.length !== 128) {
        return resolve(false);
      }

      const keyBuffer = Buffer.from(keyHex, 'hex');
      if (keyBuffer.length !== 64) {
        return resolve(false);
      }

      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }, (err, derivedKey) => {
        if (err) return resolve(false);
        try {
          const match = crypto.timingSafeEqual(keyBuffer, derivedKey);
          resolve(match);
        } catch {
          resolve(false);
        }
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Dual-layer persistent rate limiting:
 * Checks both IP and target account (email) against admin_login_attempts table.
 * Survives application restarts.
 */
export function checkLoginRateLimit(ip: string, email?: string): { allowed: boolean; retryAfterSeconds: number } {
  try {
    const db = getDatabase();
    const now = Date.now();

    // 1. Check IP lockout (5 failed attempts = 15m lockout)
    const ipKey = `ip:${ip.trim().toLowerCase()}`;
    const ipRow = db.prepare('SELECT attempts, lockout_until FROM admin_login_attempts WHERE key = ?').get(ipKey) as {
      attempts: number;
      lockout_until: number;
    } | undefined;

    if (ipRow && ipRow.lockout_until > now) {
      const remaining = Math.ceil((ipRow.lockout_until - now) / 1000);
      return { allowed: false, retryAfterSeconds: remaining };
    }

    // 2. Check Account lockout if email provided (10 failed attempts across IPs = 15m lockout)
    if (email) {
      const accKey = `acc:${email.trim().toLowerCase()}`;
      const accRow = db.prepare('SELECT attempts, lockout_until FROM admin_login_attempts WHERE key = ?').get(accKey) as {
        attempts: number;
        lockout_until: number;
      } | undefined;

      if (accRow && accRow.lockout_until > now) {
        const remaining = Math.ceil((accRow.lockout_until - now) / 1000);
        return { allowed: false, retryAfterSeconds: remaining };
      }
    }

    return { allowed: true, retryAfterSeconds: 0 };
  } catch (err) {
    // Fail safe
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Records a failed login attempt for both the IP and the account.
 */
export function recordFailedLogin(ip: string, email?: string) {
  try {
    const db = getDatabase();
    const now = Date.now();
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    const updateAttempt = (key: string, threshold: number) => {
      const row = db.prepare('SELECT attempts FROM admin_login_attempts WHERE key = ?').get(key) as { attempts: number } | undefined;
      const currentAttempts = (row ? row.attempts : 0) + 1;
      const lockoutUntil = currentAttempts >= threshold ? now + lockoutDuration : 0;

      db.prepare(`
        INSERT INTO admin_login_attempts (key, attempts, lockout_until, last_attempt_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          attempts = excluded.attempts,
          lockout_until = excluded.lockout_until,
          last_attempt_at = excluded.last_attempt_at
      `).run(key, currentAttempts, lockoutUntil, now);
    };

    updateAttempt(`ip:${ip.trim().toLowerCase()}`, 5);
    if (email) {
      updateAttempt(`acc:${email.trim().toLowerCase()}`, 10);
    }
  } catch (err) {
    console.error('[Rate Limit Record Error]:', err);
  }
}

/**
 * Clears rate limit counters for an IP and account upon successful authentication.
 */
export function clearLoginRateLimit(ip: string, email?: string) {
  try {
    const db = getDatabase();
    db.prepare('DELETE FROM admin_login_attempts WHERE key = ?').run(`ip:${ip.trim().toLowerCase()}`);
    if (email) {
      db.prepare('DELETE FROM admin_login_attempts WHERE key = ?').run(`acc:${email.trim().toLowerCase()}`);
    }
  } catch (err) {
    // Ignore error
  }
}

/**
 * Periodically prunes expired rate limit records to prevent unbounded table growth.
 */
export function pruneExpiredRateLimits() {
  try {
    const db = getDatabase();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    db.prepare('DELETE FROM admin_login_attempts WHERE last_attempt_at < ? AND lockout_until < ?').run(cutoff, Date.now());
  } catch {
    // Ignore
  }
}

/**
 * Helper to parse cookies from the request Cookie header safely.
 */
export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
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

export interface AdminUserRecord {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: number;
}

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
}

/**
 * Creates a new server-side session for an authenticated admin.
 * Returns raw session token (to be sent in cookie) and expiry time.
 */
export function createAdminSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): { token: string; expiresAt: number } {
  const db = getDatabase();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sessionId = `sess_${crypto.randomUUID()}`;
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  const insert = db.prepare(`
    INSERT INTO admin_sessions (id, user_id, token_hash, expires_at, created_at, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(sessionId, userId, tokenHash, expiresAt, now, ipAddress || null, userAgent || null);

  return { token, expiresAt };
}

/**
 * Invalidates (deletes) a session from the database.
 */
export function destroyAdminSession(token: string) {
  try {
    const db = getDatabase();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const del = db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?');
    del.run(tokenHash);
  } catch (err) {
    // Session destroy failed or already deleted
  }
}

/**
 * Sets the secure HttpOnly session cookie on the response.
 */
export function setSessionCookie(res: Response, token: string, expiresAt: number) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${new Date(expiresAt).toUTCString()}`,
    `Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}`,
  ];

  if (isProd) {
    cookieParts.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

/**
 * Clears the session cookie on the response.
 */
export function clearSessionCookie(res: Response) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`
  );
}

/**
 * Express middleware to enforce admin authentication.
 * Returns 401 Unauthorized for unauthenticated, expired, or disabled requests.
 */
export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const db = getDatabase();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = Date.now();

    const stmt = db.prepare(`
      SELECT 
        s.id AS session_id,
        s.expires_at,
        s.created_at AS session_created_at,
        u.id AS user_id,
        u.email,
        u.display_name,
        u.role,
        u.is_active
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > ?
    `);

    const result = stmt.get(tokenHash, now) as {
      session_id: string;
      expires_at: number;
      session_created_at: number;
      user_id: string;
      email: string;
      display_name: string;
      role: string;
      is_active: number;
    } | undefined;

    if (!result || result.is_active !== 1) {
      // If user exists but is inactive or session is expired, delete session immediately
      if (result) {
        destroyAdminSession(token);
      }
      clearSessionCookie(res);
      res.status(401).json({ error: 'Session expired or account is disabled' });
      return;
    }

    // Attach verified admin identity to request object
    req.adminUser = {
      id: result.user_id,
      email: result.email,
      displayName: result.display_name,
      role: result.role,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal security verification error' });
  }
}

/**
 * CSRF Protection Middleware for state-changing requests (POST, PATCH, PUT, DELETE).
 * Verifies Origin / Referer against allowed origins and requires custom header on admin mutations.
 */
export function requireCsrfProtection(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // Exempt public enquiry submission from custom header, but check origin if present
  const isPublicEnquiry = req.path === '/enquiries' || req.originalUrl?.endsWith('/api/enquiries');

  const origin = req.headers['origin'] || req.headers['referer'];
  const host = req.headers['host'];

  if (origin && typeof origin === 'string') {
    try {
      const originUrl = new URL(origin);
      const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
      const hostMatch = host && originUrl.host === host;
      const configuredSiteUrl = process.env.SITE_BASE_URL ? new URL(process.env.SITE_BASE_URL).host : null;
      const matchesConfigured = configuredSiteUrl && originUrl.host === configuredSiteUrl;

      if (!isLocalhost && !hostMatch && !matchesConfigured) {
        res.status(403).json({ error: 'Cross-origin request forbidden by CSRF protection policy.' });
        return;
      }
    } catch {
      res.status(403).json({ error: 'Malformed Origin or Referer header.' });
      return;
    }
  }

  // For protected admin operations, require custom header to eliminate cross-site browser form execution
  if (!isPublicEnquiry && req.path.startsWith('/admin')) {
    // Exempt login/logout if standard fetch, but check custom header or JSON content-type
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json') && !req.headers['x-entropy-admin-action'] && !req.headers['x-requested-with']) {
      res.status(403).json({ error: 'Invalid mutation request. Content-Type must be application/json or include CSRF header.' });
      return;
    }
  }

  next();
}

/**
 * Records an entry in the admin audit logs table.
 */
export function logAuditEvent(
  userId: string | null,
  userEmail: string | null,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, any>
) {
  try {
    const db = getDatabase();
    const id = `audit_${crypto.randomUUID()}`;
    const now = Date.now();
    const detailsStr = details ? JSON.stringify(details) : null;

    const stmt = db.prepare(`
      INSERT INTO admin_audit_logs (id, user_id, user_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, userEmail, action, targetType || null, targetId || null, detailsStr, now);
  } catch (err) {
    console.error('[Audit Log Error]:', err);
  }
}
