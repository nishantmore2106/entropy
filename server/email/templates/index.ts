import { renderClientConfirmation, type ClientConfirmationVars } from './clientConfirmation';
import { renderStudioNotification, type StudioNotificationVars } from './studioNotification';
import { renderClientStatusUpdate, type ClientStatusUpdateVars } from './clientStatusUpdate';
import { renderInternalReminder, type InternalReminderVars } from './internalReminder';
import type { EmailTemplateRenderResult } from '../types';

export {
  renderClientConfirmation,
  renderStudioNotification,
  renderClientStatusUpdate,
  renderInternalReminder,
};

export function renderEmailTemplate(
  templateType: string,
  payload: Record<string, any>
): EmailTemplateRenderResult {
  switch (templateType) {
    case 'CLIENT_CONFIRMATION':
      return renderClientConfirmation(payload as ClientConfirmationVars);
    case 'STUDIO_NOTIFICATION':
      return renderStudioNotification(payload as StudioNotificationVars);
    case 'CLIENT_STATUS_UPDATE':
      return renderClientStatusUpdate(payload as ClientStatusUpdateVars);
    case 'INTERNAL_REMINDER':
      return renderInternalReminder(payload as InternalReminderVars);
    case 'TEST_EMAIL':
      return {
        subject: `[Test] ENTROPY Mailer Diagnostic: ${payload.timestamp || new Date().toISOString()}`,
        text: `ENTROPY Mailer Transport Test\n\nThis is an automated diagnostic transmission confirming server-side email connectivity.\n\nTimestamp: ${payload.timestamp || new Date().toISOString()}\nOperator: ${payload.operator || 'Studio Principal'}\nStatus: System Operational`,
        html: `<h2 style="color: #38BDF8;">ENTROPY Mailer Diagnostic</h2><p>This is a test transmission initiated by an authorized administrator to verify outbound transport delivery.</p><p><strong>Timestamp:</strong> ${payload.timestamp || new Date().toISOString()}</p><p><strong>Operator:</strong> ${payload.operator || 'Studio Administrator'}</p><p style="color: #4ADE80; font-weight: bold;">✔ Transport connection verified successfully.</p>`,
      };
    default:
      throw new Error(`Unsupported email template type: ${templateType}`);
  }
}
