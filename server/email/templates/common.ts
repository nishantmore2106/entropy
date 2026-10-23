/**
 * Sanitizes user input to prevent HTML/XSS injection in rendered email bodies.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Standard ENTROPY branded email layout.
 * Clean, minimal, typography-focused dark aesthetic with high contrast and inline CSS.
 */
export function renderEmailLayout(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07080B; color: #E5E5E7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07080B; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0E1017; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; border-bottom: 1px solid rgba(255,255,255,0.06); background: radial-gradient(ellipse at top center, rgba(56,189,248,0.08) 0%, transparent 70%);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">ENTROPY</span>
                    <span style="font-size: 11px; font-weight: 500; letter-spacing: 1px; color: #38BDF8; margin-left: 8px; text-transform: uppercase;">· Studio</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; color: #8E8E93; font-family: monospace;">STUDIO TRANSMISSION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 40px 36px; line-height: 1.6; font-size: 14px; color: #D1D1D6;">
              ${contentHtml}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #090B0F; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #71717A; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #A1A1AA;">ENTROPY — Creative Technology Studio</p>
              <p style="margin: 0 0 6px 0;">Brand × Design × Technology · Vadodara, Gujarat, India — 390007</p>
              <p style="margin: 0;">
                <a href="mailto:entropy.helpdesk@gmail.com" style="color: #38BDF8; text-decoration: none;">entropy.helpdesk@gmail.com</a> · 
                <a href="https://instagram.com/entropy.gen" style="color: #38BDF8; text-decoration: none;">@entropy.gen</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
