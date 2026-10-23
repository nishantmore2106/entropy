const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.resolve(projectRoot, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'entropy.sqlite');
const db = new DatabaseSync(dbPath);

// Ensure tables exist
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

  CREATE TABLE IF NOT EXISTS admin_login_attempts (
    key TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL,
    lockout_until INTEGER NOT NULL,
    last_attempt_at INTEGER NOT NULL
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
`);

/**
 * Asynchronously hashes password using scrypt
 */
function hashPasswordAsync(password) {
  return new Promise((resolve, reject) => {
    if (typeof password !== 'string' || password.length < 10) {
      return reject(new Error('Password must be at least 10 characters long.'));
    }
    if (password.length > 128) {
      return reject(new Error('Password cannot exceed 128 characters.'));
    }

    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  const password = process.argv[3] || process.env.ADMIN_PASSWORD;
  const displayName = process.argv[4] || process.env.ADMIN_NAME || 'Studio Principal';
  const role = process.argv[5] || 'super_admin';

  if (!email || !password) {
    console.error('\n❌ Error: Admin email and password must be explicitly provided.');
    console.error('Usage: node scripts/setup-admin.cjs <email> <password> [displayName] [role]');
    console.error('Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
    console.error('Example: node scripts/setup-admin.cjs admin@entropy.design "SecureStudioPass2026!" "Studio Principal"\n');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes('@') || normalizedEmail.length > 254) {
    console.error('\n❌ Error: A valid email address is required.\n');
    process.exit(1);
  }

  const passwordHash = await hashPasswordAsync(password);
  const now = Date.now();

  const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(normalizedEmail);

  if (existing) {
    db.prepare(`
      UPDATE admin_users 
      SET password_hash = ?, display_name = ?, role = ?, is_active = 1 
      WHERE id = ?
    `).run(passwordHash, displayName.trim(), role, existing.id);

    // Clear any active lockout on the account
    db.prepare('DELETE FROM admin_login_attempts WHERE key = ?').run(`acc:${normalizedEmail}`);

    console.log(`\n✅ Administrator password updated successfully:`);
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Display Name: ${displayName.trim()}`);
    console.log(`   Role: ${role}`);
    console.log(`   Database: ${dbPath}\n`);
  } else {
    const userId = `admin_${crypto.randomUUID()}`;
    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, display_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `).run(userId, normalizedEmail, passwordHash, displayName.trim(), role, now);

    console.log(`\n🎉 Administrator account provisioned successfully:`);
    console.log(`   ID: ${userId}`);
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Display Name: ${displayName.trim()}`);
    console.log(`   Role: ${role}`);
    console.log(`   Database: ${dbPath}\n`);
  }
}

main().catch((err) => {
  console.error('\n❌ Provisioning failed:', err.message);
  process.exit(1);
});
