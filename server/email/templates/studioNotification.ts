import { escapeHtml, renderEmailLayout } from './common';
import type { EmailTemplateRenderResult } from '../types';

export interface StudioNotificationVars {
  client_name: string;
  client_email: string;
  client_phone?: string | null;
  country: string;
  project_type?: string | null;
  page_count?: string | null;
  budget_range: string;
  response_method: string;
  submitted_at: string;
  enquiry_reference: string;
  project_description?: string | null;
  admin_url: string;
}

export function renderStudioNotification(vars: StudioNotificationVars): EmailTemplateRenderResult {
  const subject = `New project enquiry: ${vars.client_name} — ${vars.project_type || 'General Brief'}`;

  const plainText = `A new project enquiry has been submitted through the ENTROPY website.

Client: ${vars.client_name}
Email: ${vars.client_email}
Phone: ${vars.client_phone || 'Not provided'}
Country: ${vars.country}
Project type: ${vars.project_type || 'Not specified'}
Number of pages: ${vars.page_count || 'Not specified'}
Budget range: ${vars.budget_range}
Preferred response method: ${vars.response_method}
Submitted: ${vars.submitted_at}
Reference: ${vars.enquiry_reference}

Project brief:
${vars.project_description || 'No description entered.'}

Next step: Review the enquiry in the ENTROPY admin dashboard.
Admin URL: ${vars.admin_url}
(Requires administrator authentication)`;

  const bodyHtml = `
    <div style="display: inline-block; padding: 4px 10px; background-color: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 6px; font-size: 11px; font-family: monospace; color: #38BDF8; margin-bottom: 16px;">
      NEW PIPELINE ENQUIRY
    </div>
    
    <h2 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px 0; letter-spacing: -0.5px;">
      Incoming Brief: ${escapeHtml(vars.client_name)}
    </h2>
    <p style="margin: 0 0 20px 0; color: #8E8E93; font-size: 13px;">
      A new project brief was submitted via the public contact terminal.
    </p>

    <!-- Details Table -->
    <div style="background-color: #141722; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93; width: 140px;">Client</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #FFFFFF;">${escapeHtml(vars.client_name)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Email Address</td>
          <td style="padding: 6px 0; font-size: 13px; color: #38BDF8;"><a href="mailto:${escapeHtml(vars.client_email)}" style="color: #38BDF8; text-decoration: none;">${escapeHtml(vars.client_email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Phone / Mobile</td>
          <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF;">${escapeHtml(vars.client_phone || 'None provided')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Country</td>
          <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF;">${escapeHtml(vars.country)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Discipline</td>
          <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF;">${escapeHtml(vars.project_type || 'General')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Scope / Pages</td>
          <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF;">${escapeHtml(vars.page_count || 'Not specified')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Allocated Budget</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #38BDF8;">${escapeHtml(vars.budget_range)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Preferred Channel</td>
          <td style="padding: 6px 0; font-size: 13px; color: #FFFFFF;">${escapeHtml(vars.response_method)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 12px; color: #8E8E93;">Reference ID</td>
          <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #A1A1AA;">${escapeHtml(vars.enquiry_reference)}</td>
        </tr>
      </table>
    </div>

    <!-- Brief Description -->
    <div style="margin: 24px 0;">
      <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8E8E93; margin: 0 0 10px 0; font-family: monospace;">
        Submitted Project Description
      </h3>
      <div style="background-color: #090B10; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.6; color: #D1D1D6; white-space: pre-wrap;">
        ${escapeHtml(vars.project_description || 'No description provided by client.')}
      </div>
    </div>

    <!-- Action Link -->
    <div style="margin-top: 32px; text-align: center;">
      <a href="${escapeHtml(vars.admin_url)}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
        Open Enquiry in Admin Dashboard →
      </a>
      <p style="margin: 12px 0 0 0; font-size: 11px; color: #71717A;">
        Destination requires verified Studio Administrator credentials.
      </p>
    </div>
  `;

  return {
    subject,
    text: plainText,
    html: renderEmailLayout(subject, bodyHtml),
  };
}
