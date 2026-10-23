import { escapeHtml, renderEmailLayout } from './common';
import type { EmailTemplateRenderResult } from '../types';

export interface ClientStatusUpdateVars {
  client_name: string;
  custom_subject?: string;
  admin_message: string;
}

export function renderClientStatusUpdate(vars: ClientStatusUpdateVars): EmailTemplateRenderResult {
  const subject = vars.custom_subject || 'Your project proposal from ENTROPY';

  const plainText = `Hi ${vars.client_name},

Thank you for discussing your project with ENTROPY.

We've prepared the next steps for your project and would like to share the proposal with you.

${vars.admin_message}

If you have any questions or would like to discuss any part of the proposal, simply reply to this email or contact us at entropy.helpdesk@gmail.com.

Best regards,
ENTROPY
Brand × Design × Technology
Vadodara, Gujarat, India — 390007`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px 0; letter-spacing: -0.5px;">
      ${escapeHtml(subject)}
    </h2>
    <p style="margin: 0 0 16px 0;">
      Hi <strong>${escapeHtml(vars.client_name)}</strong>,
    </p>
    <p style="margin: 0 0 20px 0;">
      Thank you for discussing your project with ENTROPY. We've prepared the next steps for your project and would like to share the details with you.
    </p>

    <!-- Message Body from Studio -->
    <div style="background-color: #141722; border-left: 3px solid #38BDF8; border-radius: 4px 12px 12px 4px; padding: 20px; margin: 24px 0; font-size: 14px; line-height: 1.7; color: #F3F4F6; white-space: pre-wrap;">
      ${escapeHtml(vars.admin_message)}
    </div>

    <p style="margin: 0 0 24px 0; color: #A1A1AA; font-size: 13px;">
      If you have any questions or would like to adjust any phase of the scope, simply reply to this transmission or write to us at 
      <a href="mailto:entropy.helpdesk@gmail.com" style="color: #38BDF8; text-decoration: none;">entropy.helpdesk@gmail.com</a>.
    </p>

    <p style="margin: 0; color: #71717A; font-size: 12px;">
      Best regards,<br>
      <strong style="color: #FFFFFF;">ENTROPY Studio Team</strong>
    </p>
  `;

  return {
    subject,
    text: plainText,
    html: renderEmailLayout(subject, bodyHtml),
  };
}
