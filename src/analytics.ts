type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  parameters: Record<string, AnalyticsValue> = {}
): void {
  window.gtag?.("event", name, parameters);
}
