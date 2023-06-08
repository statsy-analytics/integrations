interface PageViewEvent {
  name: "pageview";
  href: string;
}

interface CustomEvent {
  name: string;
  href: string;
}

interface WebVitalEvent {
  name: "FID" | "LCP" | "CLS" | "FCP" | "TTFB" | "INP";
  href: string;
}

interface RequestEvent {
  name: "resource" | "navigation";
  href: string;
}

export declare type StatsyEvent =
  | PageViewEvent
  | CustomEvent
  | WebVitalEvent
  | RequestEvent;
declare type AllowedPropertyValues = string | number | boolean | null;
declare type EventMiddleware = (event: StatsyEvent) => StatsyEvent | null;

export interface AnalyticsProps {
  siteId: string;
  eventMiddleware?: EventMiddleware;
  trackingEndpointDomain?: string;
}

declare global {
  interface Window {
    statsy?: (event: "eventMiddleware" | string, properties?: unknown) => void;
    statsyq?: [string, unknown?][];
  }
}

export const initQueue = () => {
  if (window.statsy) return;
  window.statsy = function queue(...params) {
    (window.statsyq = window.statsyq || []).push(params);
  };
};

function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

/**
 * Injects the Statsy Analytics script into the page head and starts tracking page views. Read more in our [documentation](https://statsy.com/docs/integrations/package).
 * @param [props] - Analytics options.
 * @param [props.siteId] - Your Statsy site ID.
 * @param [props.trackingEndpointDomain] - The domain to use for the analytics script. Defaults to `statsy.observer`.
 * @param [props.eventMiddleware] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 */
function inject({
  siteId,
  trackingEndpointDomain,
  eventMiddleware,
}: AnalyticsProps) {
  if (isDevelopment()) {
    console.log("Statsy Analytics: Disabled for development");
    return;
  }

  initQueue();

  if (eventMiddleware) {
    if (window.statsy != null) {
      window.statsy.call(window, "eventMiddleware", eventMiddleware);
    }
  }

  let _domain = trackingEndpointDomain || "statsy.observer";

  if (_domain.startsWith("http://") || _domain.startsWith("https://")) {
    _domain = _domain.replace("http://", "").replace("https://", "");
  }

  const src = `https://${_domain}/${siteId}.js`;

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.head.appendChild(script);
}

function track(name: string, props?: Record<string, AllowedPropertyValues>) {
  if (window.statsy != null) {
    window.statsy.call(window, name, props);
  }
}

export { inject, track };
