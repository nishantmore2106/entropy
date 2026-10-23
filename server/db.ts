import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Resolve project root and data directory
const projectRoot = process.cwd();
const dataDir = path.resolve(projectRoot, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'entropy.sqlite');

let databaseInstance: DatabaseSync | null = null;

/**
 * Initializes and returns the persistent SQLite database instance.
 * Sets high-concurrency WAL mode and enforces schema integrity.
 */
export function getDatabase(): DatabaseSync {
  if (databaseInstance) {
    return databaseInstance;
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL (Write-Ahead Logging) for high concurrency and performance
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Run schema initialization
  initSchema(db);

  databaseInstance = db;
  return databaseInstance;
}

/**
 * Ensures all required tables and indexes exist.
 */
function initSchema(db: DatabaseSync) {
  // 1. Admin Users Table
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
  `);

  // 2. Admin Sessions Table
  db.exec(`
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
  `);

  // 3. Client Enquiries Table
  db.exec(`
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
  `);

  // 4. Admin Audit Logs Table
  db.exec(`
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
  `);

  // 5. Durable Email Outbox Table (Transactional notification queue)
  db.exec(`
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
  `);

  // 6. Persistent Login Attempts Table (Survives application restarts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_login_attempts (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL,
      lockout_until INTEGER NOT NULL,
      last_attempt_at INTEGER NOT NULL
    );
  `);

  // Performance & Query Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_enquiries_email ON enquiries(email);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_email_outbox_status_retry ON email_outbox(status, next_retry_at);
    CREATE INDEX IF NOT EXISTS idx_email_outbox_enquiry_id ON email_outbox(enquiry_id);
    CREATE INDEX IF NOT EXISTS idx_email_outbox_idempotency ON email_outbox(idempotency_key);
    CREATE INDEX IF NOT EXISTS idx_login_attempts_lockout ON admin_login_attempts(lockout_until);
  `);
}

export default getDatabase;
