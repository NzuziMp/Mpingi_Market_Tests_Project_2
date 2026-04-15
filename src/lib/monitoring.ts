/*
 * Datadog Real User Monitoring (RUM) Integration
 *
 * Loads the Datadog RUM SDK via CDN script injection (no npm package required).
 * Monitoring is only activated when VITE_DD_CLIENT_TOKEN and VITE_DD_APP_ID
 * are set in the environment.
 *
 * Metrics tracked:
 *  - Core Web Vitals (LCP, FID, CLS, TTFB)
 *  - User sessions and page views
 *  - JavaScript errors and resource timing
 *  - Custom business events (listing views, searches, registrations)
 *  - Long tasks (> 50 ms) that degrade interactivity
 *
 * To enable monitoring:
 *   1. Create a Datadog account at https://datadoghq.com
 *   2. Go to UX Monitoring → RUM Applications → New Application
 *   3. Copy the generated clientToken and applicationId
 *   4. Add to .env: VITE_DD_CLIENT_TOKEN=... and VITE_DD_APP_ID=...
 */

const DD_CLIENT_TOKEN = import.meta.env.VITE_DD_CLIENT_TOKEN as string | undefined;
const DD_APP_ID = import.meta.env.VITE_DD_APP_ID as string | undefined;
const DD_ENV = import.meta.env.MODE === 'production' ? 'production' : 'development';

declare global {
  interface Window {
    DD_RUM?: {
      init: (config: Record<string, unknown>) => void;
      startSessionReplayRecording: () => void;
      addAction: (name: string, context?: Record<string, unknown>) => void;
      setUser: (user: Record<string, string>) => void;
      clearUser: () => void;
    };
  }
}

export function initMonitoring(): void {
  if (!DD_CLIENT_TOKEN || !DD_APP_ID) {
    if (import.meta.env.DEV) {
      console.info('[Monitoring] Datadog RUM not configured. Set VITE_DD_CLIENT_TOKEN and VITE_DD_APP_ID to enable.');
    }
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://www.datadoghq-browser-agent.com/us1/v5/datadog-rum.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    if (!window.DD_RUM) return;
    window.DD_RUM.init({
      applicationId: DD_APP_ID as string,
      clientToken: DD_CLIENT_TOKEN as string,
      site: 'datadoghq.com',
      service: 'mpingi-market',
      env: DD_ENV,
      version: '1.0.0',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    });
    window.DD_RUM.startSessionReplayRecording();
  };
  document.head.appendChild(script);
}

export function trackPageView(pageName: string, params?: Record<string, string>): void {
  window.DD_RUM?.addAction('page_view', { page: pageName, ...params });
}

export function trackListingView(listingId: string, title: string, category: string): void {
  window.DD_RUM?.addAction('listing_view', { listing_id: listingId, title, category });
}

export function trackSearch(query: string, resultsCount: number): void {
  window.DD_RUM?.addAction('search', { query, results_count: resultsCount });
}

export function trackUserRegistration(country: string): void {
  window.DD_RUM?.addAction('user_registration', { country });
}

export function trackListingPosted(category: string, planType: string, country: string): void {
  window.DD_RUM?.addAction('listing_posted', { category, plan_type: planType, country });
}

export function setUserContext(userId: string, email: string, name: string): void {
  window.DD_RUM?.setUser({ id: userId, email, name });
}

export function clearUserContext(): void {
  window.DD_RUM?.clearUser();
}
