/**
 * ENTROPY — SQLite Database Secure Backup & Restore Utility
 * Usage:
 *   Backup:  node scripts/db-backup.cjs backup
 *   Restore: node scripts/db-backup.cjs restore <backup_file_path>
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.resolve(projectRoot, 'data');
const backupsDir = path.resolve(projectRoot, 'backups');
const dbFile = path.resolve(dataDir, 'entropy.sqlite');

const action = process.argv[2] || 'backup';

if (action === 'backup') {
  if (!fs.existsSync(dbFile)) {
    console.error('❌ Error: Database file does not exist at:', dbFile);
    process.exit(1);
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `entropy-backup-${timestamp}.sqlite`;
  const backupPath = path.resolve(backupsDir, backupFileName);

  fs.copyFileSync(dbFile, backupPath);

  // WAL/Journal copy if exists
  const walFile = `${dbFile}-wal`;
  if (fs.existsSync(walFile)) {
    fs.copyFileSync(walFile, `${backupPath}-wal`);
  }

  console.log('✅ SQLite Database backup created successfully:');
  console.log(`   Source: ${dbFile}`);
  console.log(`   Backup: ${backupPath}`);
  console.log(`   Size:   ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB\n`);
} else if (action === 'restore') {
  const targetBackup = process.argv[3];
  if (!targetBackup || !fs.existsSync(targetBackup)) {
    console.error('❌ Error: Please specify a valid backup file path to restore.');
    console.error('   Example: node scripts/db-backup.cjs restore backups/entropy-backup-2026-10-22.sqlite');
    process.exit(1);
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.copyFileSync(targetBackup, dbFile);
  console.log('✅ SQLite Database restored successfully:');
  console.log(`   Restored from: ${targetBackup}`);
  console.log(`   Destination:   ${dbFile}\n`);
} else {
  console.log('Usage:');
  console.log('  node scripts/db-backup.cjs backup');
  console.log('  node scripts/db-backup.cjs restore <path_to_backup_file>');
}
