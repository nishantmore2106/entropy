# ENTROPY — Creative Technology Studio

An independent creative technology studio website working at the intersection of **Brand × Design × Technology**.

## Architecture & Layout Overview

1. **SECTION 0 — Empty Hero Placeholder**:
   - Pure black canvas (`#000000`, `100svh`, full width).
   - Zero navigation, text, graphics, or animations. Designed for external integration of the animated wormhole experience.
2. **Scroll-Activated Header**:
   - Pinned editorial header with brand wordmark, section anchors, and inquiry button.
   - Smoothly reveals only after scrolling past the empty hero ($y > 85\text{svh}$).
3. **SECTION 1 — Selected Work**:
   - Varied portfolio showcase spanning Brand Identity, Motion Web, UI/UX Systems, and Web Application Development.
   - Click-to-open case study drawer with challenge analysis, deliverables, and technical architecture specs.
4. **SECTION 2 — Studio Manifesto**:
   - Typographic statement: *"Good ideas deserve more than good looks."*
   - Explores the 5 foundational pillars uniting strategy, brand, and custom engineering.
5. **SECTION 3 — Services & Capabilities**:
   - Detailed breakdown of all 4 studio disciplines: Branding, UI/UX Design, Website Design & Development, and Digital Product Development.
   - Expandable capability drawers and direct service brief request triggers.
6. **SECTION 4 — Why ENTROPY (The Approach)**:
   - 4 foundational differentiators: Strategy Before Execution, Brand & Technology Together, Custom by Nature, and Made to Evolve.
7. **SECTION 5 — Our Process**:
   - 5-stage delivery sequence: Discover $\to$ Define $\to$ Design $\to$ Build $\to$ Refine & Launch with interactive phase selector.
8. **SECTION 6 — Trust & Outcomes**:
   - Direct practitioner access standards, 100% IP ownership, transparent weekly sprints, and modular handover frameworks.
9. **SECTION 7 — Final Call to Action**:
   - *"Have an idea worth building?"* with interactive Project Inquiry drawer and direct email actions.
10. **SECTION 8 — Studio Footer**:
    - Centralized coordinates, directory navigation, and copyright notice.

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite 8**
- **Tailwind CSS v4**
- **Lucide React**
- **GSAP & Motion**

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm start
```
Starts the standalone production server on port 3000 (or `$PORT`), serving the optimized `dist/` bundle, mounting the persistent SQLite API, enforcing security firewalls, and handling background email dispatch.

### Automated Security & Integration Tests
```bash
npm test
```
Executes the full 17-test automated security suite verifying password hashing, rate limiters, session storage, CSRF, CSV sanitization, firewall rules, and email queues.

## Environment Variables (.env)

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment (`development` or `production`) | `production` |
| `SITE_BASE_URL` | Public studio canonical origin | `https://entropy.design` |
| `TRUST_PROXY` | Set to `true` when behind Cloudflare, Nginx, or AWS ALB | `false` |
| `SMTP_HOST` | Outbound SMTP host (e.g., `smtp.resend.com`) | `""` (mock transport) |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username / API key | `""` |
| `SMTP_PASSWORD` | SMTP password / API key secret | `""` |
| `EMAIL_FROM` | Sender identity header | `ENTROPY <entropy.helpdesk@gmail.com>` |
| `STUDIO_NOTIFICATION_EMAIL` | Internal inbox for enquiry alerts | `entropy.helpdesk@gmail.com` |

## Production Deployment Checklist

1. **Build the bundle**: `npm run build`
2. **Set Environment Variables**: Configure SMTP and `TRUST_PROXY=true` in your hosting dashboard.
3. **Start the service**: `npm start` (runs `node server/production.cjs`).
4. **Primary Admin Provisioning**: Run `node scripts/setup-admin.cjs` once to initialize the studio administrator credentials.
5. **Periodic Backups**: Run `node scripts/db-backup.cjs backup` via cron to snapshot the SQLite database.
