import type { DatabaseSync } from 'node:sqlite';
import { enqueueEmailJob } from './queue';

export interface EnquiryRecordForNotification {
  id: string;
  client_name: string;
  email: string;
  country: string;
  phone?: string | null;
  project_type?: string | null;
  page_count?: string | null;
  budget_range: string;
  description?: string | null;
  response_method: string;
  created_at: number;
}

/**
 * Enqueues transactional email notifications when a new enquiry is saved to SQLite.
 * Both the Client Confirmation (Email A) and Studio Notification (Email B) are queued
 * inside the caller's ongoing database transaction.
 */
export function queueEnquirySubmissionNotifications(
  db: DatabaseSync,
  enquiry: EnquiryRecordForNotification
): { clientJobId: string; studioJobId: string } {
  const studioEmail = process.env.STUDIO_NOTIFICATION_EMAIL || 'entropy.helpdesk@gmail.com';
  const siteBaseUrl = process.env.SITE_BASE_URL || 'http://localhost:3000';
  const adminEnquiryUrl = `${siteBaseUrl.replace(/\/+$/, '')}/admin/enquiries/${enquiry.id}`;

  const submittedAtFormatted = new Date(enquiry.created_at).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // 1. Email A: Client Enquiry Confirmation
  const clientJobId = enqueueEmailJob(db, {
    enquiryId: enquiry.id,
    recipient: enquiry.email,
    templateType: 'CLIENT_CONFIRMATION',
    subject: 'We’ve received your project enquiry — ENTROPY',
    idempotencyKey: `idemp_confirm_${enquiry.id}`,
    payload: {
      client_name: enquiry.client_name,
      enquiry_reference: enquiry.id,
      project_type: enquiry.project_type || 'Custom Design & Engineering',
      budget_range: enquiry.budget_range,
      response_method: enquiry.response_method,
    },
  });

  // 2. Email B: Studio Pipeline Notification
  const studioJobId = enqueueEmailJob(db, {
    enquiryId: enquiry.id,
    recipient: studioEmail,
    templateType: 'STUDIO_NOTIFICATION',
    subject: `New project enquiry: ${enquiry.client_name} — ${enquiry.project_type || 'General Brief'}`,
    idempotencyKey: `idemp_studio_${enquiry.id}`,
    payload: {
      client_name: enquiry.client_name,
      client_email: enquiry.email,
      client_phone: enquiry.phone,
      country: enquiry.country,
      project_type: enquiry.project_type,
      page_count: enquiry.page_count,
      budget_range: enquiry.budget_range,
      response_method: enquiry.response_method,
      submitted_at: submittedAtFormatted,
      enquiry_reference: enquiry.id,
      project_description: enquiry.description,
      admin_url: adminEnquiryUrl,
    },
  });

  return { clientJobId, studioJobId };
}

/**
 * Enqueues a deliberate client status update / proposal email initiated by an administrator.
 */
export function queueManualClientEmail(
  db: DatabaseSync,
  params: {
    enquiryId: string;
    clientEmail: string;
    clientName: string;
    subject?: string;
    adminMessage: string;
    adminEmail: string;
  }
): string {
  const idempotencyKey = `idemp_manual_${params.enquiryId}_${Date.now()}`;

  return enqueueEmailJob(db, {
    enquiryId: params.enquiryId,
    recipient: params.clientEmail,
    templateType: 'CLIENT_STATUS_UPDATE',
    subject: params.subject || 'Your project proposal from ENTROPY',
    idempotencyKey,
    payload: {
      client_name: params.clientName,
      custom_subject: params.subject,
      admin_message: params.adminMessage,
    },
  });
}

/**
 * Enqueues an administrative transport test email.
 */
export function queueDiagnosticTestEmail(
  db: DatabaseSync,
  recipient: string,
  operatorName: string
): string {
  const timestamp = new Date().toISOString();
  const idempotencyKey = `idemp_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return enqueueEmailJob(db, {
    recipient,
    templateType: 'TEST_EMAIL',
    subject: `[Test] ENTROPY Mailer Diagnostic: ${timestamp}`,
    idempotencyKey,
    payload: {
      timestamp,
      operator: operatorName,
    },
    maxAttempts: 2,
  });
}
