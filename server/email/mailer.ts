import nodemailer, { type Transporter } from 'nodemailer';
import type { MailDeliveryResult } from './types';

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  idempotencyKey?: string;
}

/**
 * Validates and retrieves current email transport configuration from environment.
 */
export function getEmailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const from = process.env.EMAIL_FROM?.trim() || 'ENTROPY Studio <entropy.helpdesk@gmail.com>';
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || 'entropy.helpdesk@gmail.com';

  const isConfigured = Boolean(host && user && pass);

  return {
    isConfigured,
    host,
    port,
    secure,
    user,
    pass,
    from,
    replyTo,
  };
}

let cachedTransporter: Transporter | null = null;

/**
 * Creates or retrieves the active nodemailer transporter instance.
 * Falls back to an in-memory test transport if SMTP credentials are not configured.
 */
export function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const config = getEmailConfig();

  if (config.isConfigured) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  } else {
    // Development / Diagnostic Mock Transport
    // Emulates real SMTP response behavior without failing or requiring third-party credentials
    cachedTransporter = nodemailer.createTransport({
      name: 'entropy-mock-transport',
      version: '1.0.0',
      send: (mail: any, callback: (err: Error | null, info?: any) => void) => {
        const messageId = `<mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@entropy.design>`;
        console.log(`📨 [MOCK EMAIL TRANSPORT ACCEPTED]`);
        console.log(`   To: ${mail.data.to}`);
        console.log(`   Subject: ${mail.data.subject}`);
        console.log(`   Message ID: ${messageId}`);
        callback(null, {
          envelope: mail.message.getEnvelope(),
          messageId,
          response: '250 2.0.0 OK (Mock Transport Accepted)',
        });
      },
    } as any);
  }

  return cachedTransporter;
}

/**
 * Dispatches an email message through the active transport.
 * Distinguishes transient (retryable) errors from permanent delivery rejections.
 */
export async function sendMailMessage(options: MailOptions): Promise<MailDeliveryResult> {
  const config = getEmailConfig();
  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: options.to,
      replyTo: options.replyTo || config.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
      headers: options.idempotencyKey ? {
        'X-Entropy-Idempotency-Key': options.idempotencyKey,
      } : undefined,
    });

    return {
      accepted: true,
      messageId: info.messageId || `msg_${Date.now()}`,
      provider: config.isConfigured ? (config.host || 'smtp') : 'mock-transport',
    };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown transport delivery error';
    const isRetryable = isErrorRetryable(error);

    return {
      accepted: false,
      messageId: '',
      provider: config.isConfigured ? (config.host || 'smtp') : 'mock-transport',
      error: errorMessage,
      isRetryable,
    };
  }
}

/**
 * Classifies if a mail delivery error is transient and eligible for retry.
 */
function isErrorRetryable(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const responseCode = error.responseCode || 0;

  // Network/connection timeouts and 4xx SMTP codes are retryable
  if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EHOSTUNREACH', 'ESOCKET'].includes(code)) {
    return true;
  }
  if (responseCode >= 400 && responseCode < 500) {
    return true; // 4xx Temporary failure
  }
  return false;
}

/**
 * Diagnostic check to verify transport readiness without sending email.
 */
export async function verifyMailerConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  transport: string;
  error?: string;
}> {
  const config = getEmailConfig();
  if (!config.isConfigured) {
    return {
      configured: false,
      connected: true,
      transport: 'mock-transport (SMTP credentials not configured in environment)',
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return {
      configured: true,
      connected: true,
      transport: `${config.host}:${config.port}`,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      transport: `${config.host}:${config.port}`,
      error: err.message,
    };
  }
}
