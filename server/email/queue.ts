import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { getDatabase } from '../db';
import { sendMailMessage } from './mailer';
import { renderEmailTemplate } from './templates';
import type { EmailOutboxJob, EmailDeliveryStatus } from './types';

let workerIntervalId: NodeJS.Timeout | null = null;
let isProcessing = false;

/**
 * Inserts a new notification job into the durable email_outbox table.
 * Designed to execute within an existing SQLite transaction alongside enquiry mutations.
 */
export function enqueueEmailJob(
  db: DatabaseSync,
  params: {
    enquiryId?: string | null;
    recipient: string;
    templateType: EmailOutboxJob['template_type'];
    subject: string;
    payload: Record<string, any>;
    idempotencyKey: string;
    maxAttempts?: number;
  }
): string {
  const jobId = `job_${crypto.randomUUID()}`;
  const now = Date.now();
  const maxAttempts = params.maxAttempts || 5;

  const insertStmt = db.prepare(`
    INSERT INTO email_outbox (
      id, enquiry_id, recipient, template_type, subject, payload,
      status, attempts, max_attempts, next_retry_at, idempotency_key,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', 0, ?, ?, ?, ?, ?)
    ON CONFLICT(idempotency_key) DO NOTHING
  `);

  insertStmt.run(
    jobId,
    params.enquiryId || null,
    params.recipient.trim().toLowerCase(),
    params.templateType,
    params.subject,
    JSON.stringify(params.payload),
    maxAttempts,
    now,
    params.idempotencyKey,
    now,
    now
  );

  return jobId;
}

/**
 * Executes a single processing pass over the outbox queue.
 * Recovers stuck jobs, picks pending jobs, renders templates, and dispatches via active transport.
 */
export async function processOutboxQueue(dbInstance?: DatabaseSync): Promise<{
  processed: number;
  accepted: number;
  retried: number;
  failed: number;
}> {
  if (isProcessing) {
    return { processed: 0, accepted: 0, retried: 0, failed: 0 };
  }

  isProcessing = true;
  const db = dbInstance || getDatabase();
  const now = Date.now();

  let processedCount = 0;
  let acceptedCount = 0;
  let retriedCount = 0;
  let failedCount = 0;

  try {
    // 1. Crash Recovery: Recover jobs stuck in 'Processing' for > 5 minutes
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    db.prepare(`
      UPDATE email_outbox 
      SET status = 'Pending', updated_at = ?
      WHERE status = 'Processing' AND updated_at < ?
    `).run(now, fiveMinutesAgo);

    // 2. Fetch actionable jobs (Pending or Retry Scheduled ready for attempt)
    const selectStmt = db.prepare(`
      SELECT * FROM email_outbox
      WHERE status IN ('Pending', 'Retry Scheduled') AND next_retry_at <= ?
      ORDER BY created_at ASC
      LIMIT 10
    `);

    const jobs = selectStmt.all(now) as unknown as EmailOutboxJob[];

    for (const job of jobs) {
      processedCount++;

      // Atomically claim job
      const claimStmt = db.prepare(`
        UPDATE email_outbox 
        SET status = 'Processing', updated_at = ?
        WHERE id = ? AND status IN ('Pending', 'Retry Scheduled')
      `);
      claimStmt.run(Date.now(), job.id);

      try {
        const payloadObj = JSON.parse(job.payload);
        const rendered = renderEmailTemplate(job.template_type, payloadObj);

        const delivery = await sendMailMessage({
          to: job.recipient,
          subject: rendered.subject,
          text: rendered.text,
          html: rendered.html,
          idempotencyKey: job.idempotency_key,
        });

        const currentTimestamp = Date.now();

        if (delivery.accepted) {
          acceptedCount++;
          db.prepare(`
            UPDATE email_outbox 
            SET status = 'Accepted',
                provider_message_id = ?,
                delivered_at = ?,
                last_error = NULL,
                updated_at = ?
            WHERE id = ?
          `).run(delivery.messageId, currentTimestamp, currentTimestamp, job.id);
        } else {
          // Failure handling
          const newAttempts = job.attempts + 1;
          const isRetryable = delivery.isRetryable !== false && newAttempts < job.max_attempts;

          if (isRetryable) {
            retriedCount++;
            // Exponential backoff with jitter: 2^attempt * 30s + jitter
            const backoffSeconds = Math.min(3600, Math.pow(2, newAttempts) * 30 + Math.floor(Math.random() * 10));
            const nextRetryAt = currentTimestamp + backoffSeconds * 1000;

            db.prepare(`
              UPDATE email_outbox 
              SET status = 'Retry Scheduled',
                  attempts = ?,
                  next_retry_at = ?,
                  last_error = ?,
                  updated_at = ?
              WHERE id = ?
            `).run(newAttempts, nextRetryAt, delivery.error || 'Transport delivery failed', currentTimestamp, job.id);
          } else {
            failedCount++;
            db.prepare(`
              UPDATE email_outbox 
              SET status = 'Failed Permanently',
                  attempts = ?,
                  last_error = ?,
                  updated_at = ?
              WHERE id = ?
            `).run(newAttempts, delivery.error || 'Delivery permanently rejected', currentTimestamp, job.id);
          }
        }
      } catch (err: any) {
        failedCount++;
        const currentTimestamp = Date.now();
        db.prepare(`
          UPDATE email_outbox 
          SET status = 'Failed Permanently',
              last_error = ?,
              updated_at = ?
          WHERE id = ?
        `).run(err.message || 'Template rendering or dispatch error', currentTimestamp, job.id);
      }
    }
  } catch (error: any) {
    if (error?.code !== 'ERR_INVALID_STATE') {
      console.error('[Email Outbox Worker Error]:', error);
    }
  } finally {
    isProcessing = false;
  }

  return {
    processed: processedCount,
    accepted: acceptedCount,
    retried: retriedCount,
    failed: failedCount,
  };
}

/**
 * Manually retries a failed or scheduled job on demand by an administrator.
 */
export function retryOutboxJob(db: DatabaseSync, jobId: string): boolean {
  const job = db.prepare('SELECT id, status FROM email_outbox WHERE id = ?').get(jobId) as { id: string; status: string } | undefined;
  if (!job) return false;

  const now = Date.now();
  db.prepare(`
    UPDATE email_outbox 
    SET status = 'Pending',
        attempts = 0,
        next_retry_at = ?,
        last_error = NULL,
        updated_at = ?
    WHERE id = ?
  `).run(now, now, jobId);

  // Trigger quick processing pass safely
  setTimeout(() => {
    try {
      processOutboxQueue(db).catch(() => {});
    } catch {}
  }, 50);
  return true;
}

/**
 * Starts the background worker loop.
 */
export function startEmailWorker(intervalMs = 10000): void {
  if (workerIntervalId) return;

  console.log(`⚡ [ENTROPY Email Worker] Started (polling every ${intervalMs / 1000}s).`);
  // Run immediate pass on startup
  processOutboxQueue().catch(console.error);

  workerIntervalId = setInterval(() => {
    processOutboxQueue().catch(console.error);
  }, intervalMs);
}

/**
 * Cleanly stops the background worker loop.
 */
export function stopEmailWorker(): void {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    console.log('⚡ [ENTROPY Email Worker] Stopped.');
  }
}
