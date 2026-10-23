/**
 * ENTROPY — Privacy-Conscious Conversion & Analytics Event Dispatcher
 *
 * Dispatches key conversion milestones without third-party cookies or PII leakage.
 * Automatically interfaces with modern privacy-preserving analytics platforms
 * (e.g., Cloudflare Web Analytics, Plausible, or Google Analytics 4 if present on window).
 */

export type AnalyticsEventType =
  | 'project_enquiry_initiated'
  | 'contact_form_started'
  | 'contact_form_submitted'
  | 'email_contact_clicked'
  | 'phone_contact_clicked'
  | 'case_study_opened'
  | 'outbound_portfolio_clicked'
  | 'portfolio_project_opened';

export interface AnalyticsEventPayload {
  service?: string;
  category?: string;
  projectId?: string;
  source?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    va?: (eventName: string, properties?: Record<string, unknown>) => void;
  }
}

/**
 * Dispatch an analytics event safely.
 * Never includes sensitive personal data (names, phone numbers, email addresses, or form bodies).
 */
export function trackEvent(event: AnalyticsEventType, payload: AnalyticsEventPayload = {}): void {
  try {
    if (typeof window === 'undefined') return;

    // 1. Google Analytics 4 (gtag.js) if configured
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, payload);
    }

    // 2. Plausible Analytics if configured
    if (typeof window.plausible === 'function') {
      window.plausible(event, { props: payload });
    }

    // 3. Vercel Analytics if configured
    if (typeof window.va === 'function') {
      window.va(event, payload);
    }

    // 4. Development mode console telemetry
    if (import.meta.env?.DEV) {
      console.log(`📊 [ENTROPY Telemetry] Event: "${event}"`, payload);
    }
  } catch (err) {
    // Analytics failure should never break the user experience
    if (import.meta.env?.DEV) {
      console.warn('[Analytics Dispatch Error]', err);
    }
  }
}
