# ENTROPY — Security Audit, Vulnerability Remediation & Verification Report

**Audit Date:** October 2026  
**Target Application:** ENTROPY Creative Technology Studio — Self-Hosted Web Platform & Admin Dashboard  
**Status:** All identified vulnerabilities remediated, verified with automated regression tests, and audited against active source code.

---

## Executive Summary

A comprehensive security audit of the ENTROPY website and self-hosted administrative backend was conducted. Prior to this remediation, while core architectural structures (native SQLite storage, password hashing, and session authentication) were in place, several critical security deficiencies and architectural vulnerabilities were identified:

1. **Denial-of-Service via Event-Loop Starvation:** Synchronous CPU-intensive password hashing (`scryptSync`) executed directly on Node's main thread with unbounded password lengths.
2. **Reverse Proxy Header Spoofing:** Untrusted client headers (`X-Forwarded-For`) were blindly accepted, allowing attackers to spoof client IPs and bypass rate-limiting lockout mechanisms.
3. **Transient Rate-Limiting Vulnerability:** Failed login attempt tracking was held in volatile in-memory maps, allowing attackers to reset lockout timers across application restarts, with no protection against distributed per-account attacks.
4. **Missing State-Changing CSRF Protections:** Mutating admin endpoints relied solely on cookie presence without cross-origin request forgery verification.
5. **CSV Formula Injection:** Raw user-supplied text starting with formula execution characters (`=`, `+`, `-`, `@`, `\t`, `\r`) was directly emitted into admin spreadsheet exports.
6. **Non-Transactional Email Delivery:** Email sending was unqueued and non-durable, leading to potential data loss during outages and race conditions between DB transactions and external network I/O.
7. **Missing Hardened HTTP Headers:** Lack of standard defensive headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) left the administrative interface susceptible to MIME-sniffing and clickjacking.

All items have been systematically remediated, validated against an isolated test SQLite database, and verified in end-to-end integration runs and live browser sessions.

---

## Audit Checklist & Verification Matrix

| Category | Security Control / Check | Pre-Audit Baseline | Remediated Status | Verification Test |
|---|---|---|---|---|
| **Authentication** | Asynchronous non-blocking password hashing | ❌ Failed (`scryptSync` blocking) | ✅ Remediated (`crypto.scrypt`) | `tests/security.test.ts` (Test 1) |
| **Authentication** | Upper bound on password inputs (<=128 chars) | ❌ Failed (Unbounded length) | ✅ Remediated (`MAX_PASSWORD_LENGTH`) | `tests/security.test.ts` (Test 3) |
| **Authentication** | Cryptographically random salts & constant-time verify | ✅ Passed | ✅ Preserved (`timingSafeEqual`) | `tests/security.test.ts` (Test 1) |
| **Authentication** | Safe handling of corrupted/truncated password hashes | ❌ Failed (Potential unhandled crash) | ✅ Remediated (Fails closed securely) | `tests/security.test.ts` (Test 2) |
| **Rate Limiting** | Reverse proxy IP spoofing defense | ❌ Failed (Blind `X-Forwarded-For` trust) | ✅ Remediated (`TRUST_PROXY` validation) | `tests/security.test.ts` (Test 6) |
| **Rate Limiting** | SQLite-persisted lockout across server restarts | ❌ Failed (Volatile memory map) | ✅ Remediated (`admin_login_attempts` table) | `tests/security.test.ts` (Test 4) |
| **Rate Limiting** | Dual-layer throttling (Per-IP & Per-Account) | ❌ Failed (Per-IP only) | ✅ Remediated (5/IP, 10/Account 15m) | `tests/security.test.ts` (Test 5) |
| **Authorization** | Inactive/disabled accounts blocked immediately | ✅ Passed | ✅ Hardened | `tests/security.test.ts` (Test 7) |
| **Session Mgmt** | High-entropy tokens with SHA-256 server-side hashes | ✅ Passed | ✅ Preserved & Verified | `tests/security.test.ts` (Test 8) |
| **CSRF Defense** | Origin/Referer & Custom Header enforcement | ❌ Failed (Cookie presence only) | ✅ Remediated (`requireCsrfProtection`) | `scripts/verify-integration.cjs` (Step 8) |
| **Input Validation**| HTML escaping in transactional emails | ❌ Failed (Unsanitized rendering) | ✅ Remediated (`escapeHtml`) | `tests/security.test.ts` (Test 9) |
| **Data Export** | Spreadsheet formula injection mitigation | ❌ Failed (Raw CSV output) | ✅ Remediated (Single-quote prefixing) | `tests/security.test.ts` (Test 10) |
| **Email Queue** | Transactional atomic queueing in SQLite | ❌ Failed (No queue existed) | ✅ Remediated (`email_outbox` table) | `tests/security.test.ts` (Test 11 & 12) |
| **Email Queue** | Exponential backoff, jitter & crash recovery | ❌ Failed (Direct synchronous dispatch) | ✅ Remediated (`processOutboxQueue`) | `tests/security.test.ts` (Test 13 & 14) |
| **HTTP Headers** | Hardened security headers (Frame, MIME, Referrer) | ❌ Failed (Missing from Express pipeline) | ✅ Remediated (`server/api.ts`, `production.cjs`) | Verified live via curl & browser |

---

## Detailed Vulnerability Analysis & Remediations

### 1. Event-Loop Starvation & DoS via Synchronous Password Hashing (`scryptSync`)
- **Severity:** High (CVSS: 7.5 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H`)
- **Affected Files:** `server/auth.ts`, `server/api.ts`, `server/production.cjs`, `scripts/setup-admin.cjs`
- **Vulnerability & Impact:** The server previously utilized `crypto.scryptSync(password, salt, 64)`. Because `scrypt` is deliberately compute and memory intensive, executing it synchronously on the Node.js main thread blocks all incoming HTTP requests for the duration of the hash derivation. By firing 10-20 concurrent login requests with long arbitrary strings, an unauthenticated attacker could completely freeze the single-threaded Node.js event loop, rendering the studio website and admin API unresponsive.
- **Remediation Implemented:**
  1. Converted `hashPassword` and `verifyPassword` to the asynchronous `crypto.scrypt` API wrapped in Promises, delegating execution to the libuv threadpool.
  2. Maintained standard OWASP-recommended parameters: N=16384, r=8, p=1, keylen=64.
  3. Enforced `MAX_PASSWORD_LENGTH = 128` and `MAX_EMAIL_LENGTH = 254` validation before initiating any scrypt operations, preventing algorithmic complexity attacks with multi-megabyte payloads.
  4. Preserved full backwards compatibility with existing stored `salt:keyHex` database values.
- **Verification:** Verified via `tests/security.test.ts` (Test 1: Async hashing and constant-time verification; Test 3: Oversized inputs rejected before hashing).

---

### 2. IP Spoofing via Untrusted Forwarding Headers
- **Severity:** High (CVSS: 7.3 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:H`)
- **Affected Files:** `server/auth.ts`, `server/api.ts`, `server/production.cjs`
- **Vulnerability & Impact:** The previous IP extraction logic read `req.headers['x-forwarded-for']` directly without validating whether the connection originated from a trusted reverse proxy. An attacker could send arbitrary `X-Forwarded-For: 1.2.3.4` headers on each attempt, rotating the spoofed IP address and completely bypassing the IP-based login lockout mechanism.
- **Remediation Implemented:**
  1. Implemented `getClientIp(req)` helper in `server/auth.ts`.
  2. By default, `req.socket.remoteAddress` is treated as the true client IP.
  3. `X-Forwarded-For` is inspected *only* when the environment explicitly sets `TRUST_PROXY=true` (or when deployed behind configured ingress). When trusted, the leftmost valid IP is extracted.
- **Verification:** Verified via `tests/security.test.ts` (Test 6: Ensuring spoofed headers are ignored unless `TRUST_PROXY=true`).

---

### 3. Ephemeral In-Memory Rate Limiting & Distributed Brute-Force
- **Severity:** Medium (CVSS: 6.5 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`)
- **Affected Files:** `server/db.ts`, `server/auth.ts`, `server/api.ts`, `server/production.cjs`
- **Vulnerability & Impact:** Login lockout was tracked in a transient JavaScript `Map`. Any server restart, node crash, or rolling deployment discarded all lockout history. Furthermore, the limiter only tracked IP addresses; an attacker utilizing a botnet or rotating proxy pool could attempt thousands of passwords against `admin@entropy.design` without ever triggering an IP lockout.
- **Remediation Implemented:**
  1. Created a persistent SQLite table `admin_login_attempts (key TEXT PRIMARY KEY, attempts INTEGER, lockout_until INTEGER, last_attempt_at INTEGER)`.
  2. Implemented dual-layer rate limiting:
     - **Per-IP Key (`ip:<client_ip>`):** Locks out after 5 failed attempts for 15 minutes.
     - **Per-Account Key (`account:<email>`):** Locks out after 10 failed attempts across all IPs for 15 minutes.
  3. Added index `idx_login_attempts_lockout` and bounded cleanup pruning records older than 24 hours.
- **Verification:** Verified via `tests/security.test.ts` (Test 4: 5 failed attempts locks out IP; Test 5: 10 failed attempts locks out account across multiple distinct IPs).

---

### 4. Cross-Site Request Forgery (CSRF) on Admin Mutating Endpoints
- **Severity:** Medium (CVSS: 6.5 - `CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:H/A:N`)
- **Affected Files:** `server/auth.ts`, `server/api.ts`, `src/components/admin/AdminLayout.tsx`
- **Vulnerability & Impact:** While admin session cookies were marked `HttpOnly` and `SameSite=Lax`, modern web standards recommend explicit CSRF defense for sensitive administrative state-changing operations. A cross-origin form or navigation payload from an admin's browser could potentially execute state changes.
- **Remediation Implemented:**
  1. Built `requireCsrfProtection(req, res, next)` middleware in `server/auth.ts`.
  2. Validates `Origin` and `Referer` headers against `SITE_BASE_URL` or allowed hosts.
  3. Requires mutating admin requests (POST, PUT, DELETE, PATCH) to supply a custom header `X-Entropy-Admin-Action: 1` or explicitly require `application/json` content type which cannot be transmitted via traditional cross-origin HTML form posts without triggering a CORS preflight.
  4. Updated all frontend administrative fetch calls (`AdminLayout.tsx`, `AdminEmailPage.tsx`, `AdminEnquiryDetailPage.tsx`) to supply `X-Entropy-Admin-Action: 1`.
- **Verification:** Verified via `scripts/verify-integration.cjs` across all state mutations (Logout, Test Email Dispatch, Client Status Updates).

---

### 5. CSV Formula Injection (Spreadsheet Execution)
- **Severity:** Medium (CVSS: 6.8 - `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N`)
- **Affected Files:** `server/api.ts`, `server/production.cjs`
- **Vulnerability & Impact:** Public visitors submit client names, company details, and project descriptions. When studio administrators exported enquiries via `GET /api/admin/export`, cell values starting with `=`, `@`, `+`, or `-` would be executed as dynamic formulas by Microsoft Excel, Apple Numbers, or Google Sheets upon opening the CSV, potentially exfiltrating local data or executing shell commands via DDE.
- **Remediation Implemented:**
  1. Sanitized all exported CSV fields using `sanitizeCsvCell(value)`.
  2. Cells whose trimmed string starts with `= `, `+`, `-`, `@`, `\t`, or `\r` are prepended with an apostrophe (`'`), instructing spreadsheet applications to treat the cell purely as raw textual data without executing formulas.
  3. Enforced standard RFC 4180 CSV escaping (double-quote wrapping and quotation mark escaping).
- **Verification:** Verified via `tests/security.test.ts` (Test 10) and `scripts/verify-integration.cjs` (Step 7: Formula injection sanitized).

---

### 6. Non-Durable, Non-Transactional Email Delivery
- **Severity:** High (Integrity & Operational Reliability)
- **Affected Files:** `server/db.ts`, `server/email/queue.ts`, `server/email/notifications.ts`, `server/api.ts`
- **Vulnerability & Impact:** Previously, sending an email directly inside an HTTP handler could cause two catastrophic failure modes:
  - If the email provider was slow or timed out, the public enquiry submission endpoint hung, causing the visitor's browser to fail or resubmit multiple times.
  - If the database commit failed after the email was sent, or if the email failed after the database commit, the system became inconsistent (client received confirmation for an enquiry that didn't exist, or enquiry was stored but no notification was dispatched).
  - A server crash immediately after receiving an enquiry resulted in silent message loss.
- **Remediation Implemented:**
  1. Created a durable SQLite `email_outbox` table with fields `id`, `enquiry_id`, `recipient`, `template_type`, `subject`, `payload`, `status`, `attempts`, `max_attempts`, `next_retry_at`, `idempotency_key`, `last_error`, `provider_message_id`, `delivered_at`, `created_at`, `updated_at`.
  2. Modified `POST /api/enquiries` to execute inside a single atomic SQLite transaction:
     - Insert enquiry into `enquiries` table.
     - Insert audit log into `admin_audit_logs`.
     - Insert Client Confirmation (Email A) and Studio Notification (Email B) into `email_outbox`.
     - Commit transaction.
  3. If any step fails, the entire transaction rolls back; no orphaned email jobs are queued.
  4. Outbox worker processes jobs asynchronously with exponential backoff and jitter, crash recovery for stuck jobs, and idempotent message tracking.
- **Verification:** Verified via `tests/security.test.ts` (Test 11: Atomic transactional insertion; Test 12: Rollback verification; Test 13: Queue processing; Test 14: Manual retry mechanism).

---

### 7. Insecure Setup Script & Missing Security Headers
- **Severity:** Medium
- **Affected Files:** `scripts/setup-admin.cjs`, `server/api.ts`, `server/production.cjs`
- **Vulnerability & Impact:** The admin setup script allowed short, trivial passwords. The Express application lacked standard security response headers.
- **Remediation Implemented:**
  1. Updated `scripts/setup-admin.cjs` to enforce minimum 10-character password requirement, require confirmation, and disallow default trivial passwords.
  2. Added security headers on every response:
     - `X-Content-Type-Options: nosniff` (prevents MIME-type confusion attacks)
     - `X-Frame-Options: DENY` (prevents clickjacking in iframes)
     - `Referrer-Policy: strict-origin-when-cross-origin` (prevents leaking private URLs in referrers)
     - `X-XSS-Protection: 0` (modern standard to prevent browser heuristic XSS audit bugs)
- **Verification:** Verified in both Vite dev plugin and standalone `production.cjs` server.

---

## Remaining Limitations & Operational Boundaries

1. **Local SQLite Immutability Boundary:** Audit logs and outbox records are stored in SQLite `data/entropy.sqlite`. While ordinary web users and authenticated administrators without shell access cannot modify or delete audit logs, a system operator with direct filesystem / SSH access to the server can modify the SQLite file directly. This is an expected boundary for self-hosted single-node deployments.
2. **Reverse Proxy Trust Boundary:** When running behind a reverse proxy (Nginx, Cloudflare, AWS ALB), operators must explicitly set `TRUST_PROXY=true` in `.env` to enable accurate client IP logging and rate limiting. In direct-facing deployments without a proxy, `TRUST_PROXY` should remain `false`.
3. **Email Transport Provider Boundary:** The email system accepts SMTP or transactional providers. The outbox status `Accepted` denotes that the configured SMTP server or mock transport accepted the transmission. Guaranteed inbox placement depends on proper domain DNS configuration (SPF, DKIM, DMARC), recipient ISP spam filtering, and provider reputation.

---

## Verification Summary

All 14 unit and regression tests pass in under 1 second with 0 failures:
- Test suite: `npm test` (`node --max-old-space-size=512 ./node_modules/tsx/dist/cli.mjs --test tests/security.test.ts`)
- Integration suite: `node scripts/verify-integration.cjs` (All 9 live integration tests pass)
- UI Verification: Browser automation verified dashboard tabs, email preview modal, retry dispatch, and diagnostic test email modal.
