# ENTROPY — Admin Portal, Database & Enquiry Management Architecture

This document outlines the local server-side architecture, SQLite database storage, authentication, and operational procedures for ENTROPY's private administrator dashboard and client project enquiry pipeline.

---

## 1. System Overview

- **Public Contact Form (`/contact`, `/get-started`):** Captures client project briefs using the approved dark-glass interface and transmits them via `POST /api/enquiries`.
- **Backend API (`server/api.ts`):** Validates and normalizes inputs, applies spam rate-limiting, and persists briefs transactionally into a private, server-side SQLite database.
- **Persistent Local Database (`data/entropy.sqlite`):** Native SQLite database with WAL (Write-Ahead Logging) mode, foreign key enforcement, and indexes. Excluded from version control via `.gitignore`.
- **Private Admin Dashboard (`/admin`, `/admin/enquiries`, `/admin/enquiries/:id`):** Protected administrative interface allowing authorized studio principals to review real-time pipeline metrics, search and filter incoming briefs, update project statuses, and record internal notes.
- **Authentication (`server/auth.ts`):** 100% self-hosted authentication with `scrypt` password hashing, cryptographically random server-side session tokens, HttpOnly/SameSite cookies, and brute-force lockout protection. No third-party auth providers required.

---

## 2. Database Schema (`data/entropy.sqlite`)

### `enquiries`
Stores submitted client briefs:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique ID (`enq_...`) |
| `client_name` | TEXT | NOT NULL | Client full name |
| `email` | TEXT | NOT NULL | Contact email address |
| `country` | TEXT | NOT NULL | Client country base |
| `phone` | TEXT | NULLABLE | Phone number / WhatsApp |
| `project_type` | TEXT | NULLABLE | Creative discipline requested |
| `page_count` | TEXT | NULLABLE | Estimated scope / page count |
| `budget_range` | TEXT | NOT NULL | Approved INR budget tier |
| `description` | TEXT | NULLABLE | Full project brief description |
| `response_method`| TEXT | DEFAULT 'Email' | Preferred contact channel |
| `status` | TEXT | DEFAULT 'New' | Pipeline status (`New`, `Contacted`, `In Discussion`, `Proposal Sent`, `Won`, `Lost`, `Archived`) |
| `admin_notes` | TEXT | DEFAULT '' | Private studio principal notes |
| `created_at` | INTEGER | NOT NULL | Submission Unix timestamp |
| `updated_at` | INTEGER | NOT NULL | Last status/notes update timestamp |

### `admin_users`
Stores authorized administrator accounts:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique admin ID (`admin_...`) |
| `email` | TEXT | UNIQUE NOT NULL | Administrator login email |
| `password_hash` | TEXT | NOT NULL | `scrypt` derived key with random salt |
| `display_name` | TEXT | NOT NULL | Name displayed in admin header |
| `role` | TEXT | DEFAULT 'admin' | Role / permissions (`admin`, `super_admin`) |
| `is_active` | INTEGER | DEFAULT 1 | Active (1) or Disabled (0) |
| `created_at` | INTEGER | NOT NULL | Creation timestamp |
| `last_login_at`| INTEGER | NULLABLE | Last authenticated login timestamp |

### `admin_sessions`
Stores server-side session references:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Session ID (`sess_...`) |
| `user_id` | TEXT | NOT NULL (FK) | Reference to `admin_users(id)` |
| `token_hash` | TEXT | UNIQUE NOT NULL | SHA-256 hash of session token |
| `expires_at` | INTEGER | NOT NULL | Session expiry timestamp (7 days) |
| `created_at` | INTEGER | NOT NULL | Session creation timestamp |
| `ip_address` | TEXT | NULLABLE | Client IP address for auditing |
| `user_agent` | TEXT | NULLABLE | Client user agent |

### `admin_audit_logs`
Stores security and operational activity:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique audit log ID (`audit_...`) |
| `user_id` | TEXT | NULLABLE (FK) | Admin ID who initiated action |
| `user_email` | TEXT | NULLABLE | Email address |
| `action` | TEXT | NOT NULL | Action code (`ADMIN_LOGIN`, `ENQUIRY_UPDATED`, etc.) |
| `target_type`| TEXT | NULLABLE | Target entity type (`enquiry`, `user`) |
| `target_id` | TEXT | NULLABLE | Target entity ID |
| `details` | TEXT | NULLABLE | JSON encoded event metadata |
| `created_at` | INTEGER | NOT NULL | Timestamp |

### `email_outbox`
Stores durable transactional email notifications:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique job ID (`job_...`) |
| `enquiry_id` | TEXT | NULLABLE (FK) | Related enquiry reference |
| `recipient` | TEXT | NOT NULL | Target email address |
| `template_type`| TEXT | NOT NULL | Notification type (`CLIENT_CONFIRMATION`, `STUDIO_NOTIFICATION`, `CLIENT_STATUS_UPDATE`, `INTERNAL_REMINDER`, `TEST_EMAIL`) |
| `subject` | TEXT | NOT NULL | Rendered email subject |
| `payload` | TEXT | NOT NULL | JSON template variables |
| `status` | TEXT | NOT NULL | Status (`Pending`, `Processing`, `Accepted`, `Retry Scheduled`, `Failed Permanently`) |
| `attempts` | INTEGER | DEFAULT 0 | Delivery attempt counter |
| `max_attempts` | INTEGER | DEFAULT 5 | Maximum retry threshold before permanent failure |
| `next_retry_at`| INTEGER | NOT NULL | Unix timestamp eligible for next attempt |
| `idempotency_key`| TEXT | UNIQUE NOT NULL | Prevents duplicate sending across retries |
| `last_error` | TEXT | NULLABLE | Safe failure error message |
| `provider_message_id` | TEXT | NULLABLE | Upstream provider message identifier |
| `delivered_at` | INTEGER | NULLABLE | Timestamp accepted by provider |
| `created_at` | INTEGER | NOT NULL | Job queue timestamp |
| `updated_at` | INTEGER | NOT NULL | Last status update timestamp |

### `admin_login_attempts`
Stores persistent rate-limiting and brute-force lockout states across server restarts:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `key` | TEXT | PRIMARY KEY | Rate limit bucket key (`ip:<ip>` or `account:<email>`) |
| `attempts` | INTEGER | NOT NULL | Failed attempt counter |
| `lockout_until`| INTEGER | NOT NULL | Unix timestamp when lockout expires |
| `last_attempt_at`| INTEGER | NOT NULL | Timestamp of most recent failed attempt |

---

## 3. Administrator Account Provisioning

Administrator accounts **cannot** be registered through public signup. Use the secure server CLI command to provision accounts or reset passwords:

### Initial Provisioning or Password Reset:
```bash
node scripts/setup-admin.cjs <email> <password> "<Display Name>"
```

**Example:**
```bash
node scripts/setup-admin.cjs admin@entropy.design EntropyAdmin2026! "Studio Principal"
```

Default credentials configured for testing:
- **Email:** `admin@entropy.design`
- **Password:** `EntropyAdmin2026!`
- **Portal URL:** `http://localhost:3000/admin/login`

---

## 4. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port for the production web server |
| `NODE_ENV` | `development` | Set to `production` for secure cookie flags and optimizations |
| `ADMIN_EMAIL` | Optional | Fallback email for `setup-admin.cjs` |
| `ADMIN_PASSWORD`| Optional | Fallback password for `setup-admin.cjs` |
| `TRUST_PROXY` | `false` | Set to `true` when behind a reverse proxy (e.g. Nginx, Cloudflare) |
| `SITE_BASE_URL` | `http://localhost:3000` | Canonical origin for admin link rendering and CSRF origin verification |
| `SMTP_HOST` | None (dev mock fallback) | Outbound SMTP server hostname (e.g. `smtp.resend.com`, `smtp.sendgrid.net`) |
| `SMTP_PORT` | `587` | Outbound SMTP connection port (`587` for STARTTLS, `465` for SSL) |
| `SMTP_SECURE` | `false` | Set to `true` for port 465 SSL connections |
| `SMTP_USER` | None | Authenticated SMTP username or API key name |
| `SMTP_PASSWORD`| None | Authenticated SMTP password or API secret key |
| `EMAIL_FROM` | `"ENTROPY" <hello@entropy.design>` | Verified outbound sender address |
| `EMAIL_REPLY_TO`| `entropy.helpdesk@gmail.com` | Client reply-to destination |
| `STUDIO_NOTIFICATION_EMAIL` | `entropy.helpdesk@gmail.com` | Studio mailbox receiving new enquiry alerts |

---

## 5. Backup & Restoration Procedures

Client briefs are stored in `data/entropy.sqlite`. To create a timestamped backup:

### Create a Backup:
```bash
node scripts/db-backup.cjs backup
```
Backups are saved to `backups/entropy-backup-<timestamp>.sqlite`.

### Restore from Backup:
```bash
node scripts/db-backup.cjs restore backups/entropy-backup-<timestamp>.sqlite
```

---

## 6. Running in Production

To build the static assets and launch the standalone production server:

```bash
# 1. Build client-side assets
npm run build

# 2. Start the fullstack production server
node server/production.cjs
```
This runs Express serving `/api` endpoints with SQLite storage and static frontend assets from `dist/` on port 3000. The durable email outbox worker automatically starts alongside the HTTP server and recovers any pending transmissions.

---

## 7. Email Notification Operations & Sender Verification Guide

### 7.1 Architecture & Transactional Guarantees
The ENTROPY email system employs a **durable outbox pattern** backed by native SQLite:
1. When a client submits an enquiry on `/contact` or `/get-started`, the database opens an immediate transaction.
2. The enquiry record is inserted, the security audit event is logged, and two email jobs are queued into `email_outbox`:
   - **Email A (`CLIENT_CONFIRMATION`):** Sent to the client with their enquiry reference, project details, and contact channels.
   - **Email B (`STUDIO_NOTIFICATION`):** Sent to `entropy.helpdesk@gmail.com` with complete brief details and an authenticated link to the admin dashboard.
3. If any database write fails, the entire transaction is rolled back; **no emails are ever queued or sent for an unpersisted enquiry**.
4. The background queue worker periodically polls for `Pending` or `Retry Scheduled` records, claims them atomically to prevent concurrent double-sends, and dispatches them via the configured transport.

### 7.2 Delivery States
- **Pending:** Queued and awaiting the worker's next delivery pass.
- **Processing:** Claimed by an active worker thread. Jobs lingering in this state for >5 minutes (due to an unexpected process termination) are automatically recovered back to `Pending`.
- **Accepted:** Successfully received and accepted by the upstream mail transport / provider. *Note: As with all SMTP protocols, acceptance denotes provider transmission handover, not guaranteed placement in the recipient's primary inbox.*
- **Retry Scheduled:** Encountered a transient network or timeout error; scheduled for retry using exponential backoff with random jitter.
- **Failed Permanently:** Exceeded the maximum retry count (default: 5) or encountered an unrecoverable rejection. Requires manual administrator review.

### 7.3 Exponential Backoff & Idempotency
- **Idempotency Keys:** Every email job generates a unique, deterministic hash (e.g. `client_conf_<enquiry_id>`). Duplicate insert attempts are ignored by the database.
- **Retry Delay Formula:** `backoffMs = min(60000 * 2^(attempts-1), 7200000) + jitter(0-15000ms)`.
- **Manual Retry:** Administrators can re-enqueue failed jobs from the `/admin/email` dashboard with a single click via `POST /api/admin/email/retry/:id`.

### 7.4 Client Status & Proposal Emails (Email C)
When an enquiry reaches stages such as `Proposal Sent` or `Won`, studio principals can deliberately draft and transmit updates directly from the enquiry detail page (`/admin/enquiries/:id`).
- Before sending, an interactive preview modal displays recipient, subject, and body.
- Transmission requires deliberate administrator confirmation and is audited in `admin_audit_logs`.
- Status emails are never dispatched automatically for routine internal notes or triage.

### 7.5 Production DNS Configuration (SPF, DKIM, DMARC)
For reliable inbox placement to Google Mail, Microsoft 365, and corporate domains, the sending domain (`entropy.design`) must configure appropriate DNS records with the domain registrar:

1. **SPF (Sender Policy Framework):**
   Add a TXT record to the root domain authorizing the provider:
   ```text
   Type:  TXT
   Host:  @
   Value: v=spf1 include:_spf.resend.com ~all
   ```
   *(Replace with the SPF include specified by your selected SMTP provider).*

2. **DKIM (DomainKeys Identified Mail):**
   Add the public key CNAME or TXT records provided in your provider dashboard:
   ```text
   Type:  CNAME
   Host:  resend._domainkey.entropy.design
   Value: dkim.resend.com
   ```

3. **DMARC (Domain-based Message Authentication, Reporting, and Conformance):**
   Add a TXT record at `_dmarc.entropy.design`:
   ```text
   Type:  TXT
   Host:  _dmarc
   Value: v=DMARC1; p=quarantine; pct=100; rua=mailto:entropy.helpdesk@gmail.com
   ```

### 7.6 Diagnostics & Testing
Studio administrators can verify email transport connectivity at any time:
1. Navigate to `/admin/email` in the dashboard.
2. Click **Run Transport Test**.
3. Enter an optional test recipient (defaults to `entropy.helpdesk@gmail.com`).
4. Click **Send Test Transmission**.
5. The modal will report live connection status, provider response code, and message ID.

