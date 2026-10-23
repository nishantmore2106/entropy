import { escapeHtml, renderEmailLayout } from './common';
import type { EmailTemplateRenderResult } from '../types';

export interface ClientConfirmationVars {
  client_name: string;
  enquiry_reference: string;
  project_type: string;
  budget_range: string;
  response_method?: string;
}

export function renderClientConfirmation(vars: ClientConfirmationVars): EmailTemplateRenderResult {
  const subject = 'We’ve received your project enquiry — ENTROPY';

  const plainText = `Hi ${vars.client_name},

Thank you for reaching out to ENTROPY.

We've received your project enquiry and appreciate you taking the time to share your ideas with us.

Your enquiry reference: ${vars.enquiry_reference}
Project type: ${vars.project_type || 'Custom Creative Engineering'}
Budget range: ${vars.budget_range}

Our team will review the details and get back to you using your preferred response method, where available.

If you need to add any information, you can contact us at:
Email: entropy.helpdesk@gmail.com
Instagram: @entropy.gen

Thank you for considering ENTROPY as your creative partner.

Best regards,
ENTROPY
Brand × Design × Technology
Vadodara, Gujarat, India — 390007`;

  const bodyHtml = `
    <h2 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px 0; letter-spacing: -0.5px;">
      We've received your enquiry
    </h2>
    <p style="margin: 0 0 16px 0;">
      Hi <strong>${escapeHtml(vars.client_name)}</strong>,
    </p>
    <p style="margin: 0 0 20px 0;">
      Thank you for reaching out to ENTROPY. We've received your project brief and appreciate you taking the time to share your ideas with us.
    </p>

    <div style="background-color: #141722; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #8E8E93; font-family: monospace;">Enquiry Reference</td>
          <td style="padding-bottom: 8px; font-size: 13px; font-family: monospace; color: #38BDF8; font-weight: 600; text-align: right;">${escapeHtml(vars.enquiry_reference)}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #8E8E93; font-family: monospace;">Project Type</td>
          <td style="padding-bottom: 8px; font-size: 13px; color: #FFFFFF; text-align: right;">${escapeHtml(vars.project_type || 'Custom Design & Technology')}</td>
        </tr>
        <tr>
          <td style="font-size: 11px; text-transform: uppercase; color: #8E8E93; font-family: monospace;">Budget Range</td>
          <td style="font-size: 13px; color: #38BDF8; font-weight: 600; text-align: right;">${escapeHtml(vars.budget_range)}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 20px 0;">
      Our team will review the details and get back to you using your preferred response method, where available.
    </p>

    <p style="margin: 0 0 24px 0; color: #A1A1AA; font-size: 13px;">
      If you need to add any information or portfolio assets, reply directly to this transmission or contact us at 
      <a href="mailto:entropy.helpdesk@gmail.com" style="color: #38BDF8; text-decoration: none;">entropy.helpdesk@gmail.com</a>.
    </p>

    <p style="margin: 0; color: #71717A; font-size: 12px;">
      Thank you for considering ENTROPY as your creative technology partner.
    </p>
  `;

  return {
    subject,
    text: plainText,
    html: renderEmailLayout(subject, bodyHtml),
  };
}
