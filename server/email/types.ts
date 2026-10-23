export type EmailDeliveryStatus = 
  | 'Pending' 
  | 'Processing' 
  | 'Accepted' 
  | 'Retry Scheduled' 
  | 'Failed Permanently';

export interface EmailOutboxJob {
  id: string;
  enquiry_id: string | null;
  recipient: string;
  template_type: 'CLIENT_CONFIRMATION' | 'STUDIO_NOTIFICATION' | 'CLIENT_STATUS_UPDATE' | 'INTERNAL_REMINDER' | 'TEST_EMAIL';
  subject: string;
  payload: string; // JSON string of template variables
  status: EmailDeliveryStatus;
  attempts: number;
  max_attempts: number;
  next_retry_at: number;
  idempotency_key: string;
  provider_message_id: string | null;
  last_error: string | null;
  created_at: number;
  updated_at: number;
  delivered_at: number | null;
}

export interface MailDeliveryResult {
  accepted: boolean;
  messageId: string;
  provider: string;
  error?: string;
  isRetryable?: boolean;
}

export interface EmailTemplateRenderResult {
  subject: string;
  text: string;
  html: string;
}
