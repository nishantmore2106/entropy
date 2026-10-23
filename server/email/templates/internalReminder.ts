import { escapeHtml, renderEmailLayout } from './common';
import type { EmailTemplateRenderResult } from '../types';

export interface InternalReminderVars {
  reminder_title: string;
  enquiry_reference?: string;
  client_name?: string;
  due_date?: string;
  notes?: string;
  admin_url: string;
}

export function renderInternalReminder(vars: InternalReminderVars): EmailTemplateRenderResult {
  const subject = `[Action Required] ENTROPY Pipeline Reminder: ${vars.reminder_title}`;

  const plainText = `[ENTROPY INTERNAL REMINDER]
Action: ${vars.reminder_title}
Client: ${vars.client_name || 'N/A'}
Reference: ${vars.enquiry_reference || 'N/A'}
Due: ${vars.due_date || 'Immediate'}

Notes:
${vars.notes || 'No extra notes.'}

Admin URL: ${vars.admin_url}`;

  const bodyHtml = `
    <div style="display: inline-block; padding: 4px 10px; background-color: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.3); border-radius: 6px; font-size: 11px; font-family: monospace; color: #FACC15; margin-bottom: 16px;">
      STUDIO INTERNAL REMINDER
    </div>
    
    <h2 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0 0 16px 0;">
      ${escapeHtml(vars.reminder_title)}
    </h2>

    <div style="background-color: #141722; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Client:</strong> ${escapeHtml(vars.client_name || 'General')}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Reference:</strong> <span style="font-family: monospace; color: #38BDF8;">${escapeHtml(vars.enquiry_reference || 'N/A')}</span></p>
      <p style="margin: 0; font-size: 13px;"><strong>Due Date:</strong> ${escapeHtml(vars.due_date || 'Today')}</p>
    </div>

    ${vars.notes ? `<div style="padding: 14px; background-color: #0B0D13; border-radius: 8px; font-size: 13px; color: #A1A1AA; margin-bottom: 24px;">${escapeHtml(vars.notes)}</div>` : ''}

    <div style="text-align: center; margin-top: 24px;">
      <a href="${escapeHtml(vars.admin_url)}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
        Open Admin Portal →
      </a>
    </div>
  `;

  return {
    subject,
    text: plainText,
    html: renderEmailLayout(subject, bodyHtml),
  };
}
