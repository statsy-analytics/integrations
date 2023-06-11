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
  autoTrackPageviews?: boolean;
}

interface StatsyConfig {
  autoTrackPageviews: boolean;
}

declare global {
  interface Window {
    statsy?: (event: "eventMiddleware" | string, properties?: unknown) => void;
    statsyq?: [string, unknown?][];
    statsyConfig?: StatsyConfig;
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

function isBrowser() {
  return typeof window !== "undefined";
}

interface UrlWithHeaders {
  url: string;
  headers: Headers;
}

/**
 * Track a pageview event.
 *
 * @async
 * @function
 * @param {Request} request - The request object containing the url and headers.
 * @returns {Promise<Response>} The response from the Statsy API.
 * @throws {Error} Throws an error if it fails to send the request.
 */
async function trackServerPageview(request?: UrlWithHeaders) {
  if (!request) {
    throw new Error(
      "You must pass the request object to trackPageview when using server-side tracking."
    );
  }

  const { hostname } = new URL(request.url);

  if (!process.env.STATSY_API_KEY) {
    throw new Error(
      "You must set the STATSY_API_KEY environment variable to use the Statsy Edge application."
    );
  }

  const acceptHeader = request.headers.get("accept");
  const contentTypeHeader = request.headers.get("content-type");

  if (
    (acceptHeader && acceptHeader.includes("text/html")) ||
    (contentTypeHeader && contentTypeHeader.includes("text/html"))
  ) {
    return await fetch(`https://api.statsy.com/v1/beep`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
        "User-Agent": request.headers.get("user-agent") || "",
        Authorization: `Bearer ${process.env.STATSY_API_KEY}`,
      },
      body: JSON.stringify({
        eventName: "pageview",
        href: request.url,
        domain: hostname,
        referrer: request.headers.get("referer") || "",
      }),
    });
  }

  return Promise.resolve();
}

interface TrackEventOptions {
  request?: UrlWithHeaders;
  name: string;
  props?: Record<string, AllowedPropertyValues>;
}

/**
 * Track a custom event.
 *
 * @async
 * @function
 * @param {Request} request - The request object containing the url and headers.
 * @param {string} name - The name of the event.
 * @param {any} props - Additional properties to send with the event.
 * @returns {Promise<Response>} The response from the Statsy API.
 * @throws {Error} Throws an error if it fails to send the request.
 */
async function trackServerEvent({ request, name, props }: TrackEventOptions) {
  if (!request) {
    throw new Error(
      "You must pass the request object to trackPageview when using server-side tracking."
    );
  }

  const { hostname } = new URL(request.url);

  if (!process.env.STATSY_API_KEY) {
    throw new Error(
      "You must set the STATSY_API_KEY environment variable to use the Statsy Edge application."
    );
  }

  return await fetch(`https://api.statsy.com/v1/beep`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
      "User-Agent": request.headers.get("user-agent") || "",
      Authorization: `Bearer ${process.env.STATSY_API_KEY}`,
    },
    body: JSON.stringify({
      eventName: name,
      href: request.url,
      domain: hostname,
      referrer: request.headers.get("referer") || "",
      props,
    }),
  });
}

/**
 * Injects the Statsy Analytics script into the page head and starts tracking page views. Read more in our [documentation](https://statsy.com/docs/integrations/package).
 * @param [props] - Analytics options.
 * @param [props.siteId] - Your Statsy site ID.
 * @param [props.trackingEndpointDomain] - The domain to use for the analytics script. Defaults to `statsy.observer`.
 * @param [props.eventMiddleware] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 * @param [props.autoTrackPageviews] - Whether to automatically track page views. Defaults to `true`.
 */
function inject({
  siteId,
  trackingEndpointDomain,
  eventMiddleware,
  autoTrackPageviews = true,
}: AnalyticsProps) {
  if (!isBrowser()) {
    console.log("Statsy Analytics: inject() disabled for SSR");
    return;
  }

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

  window.statsyConfig = {
    autoTrackPageviews,
  };

  const src = `https://${_domain}/${siteId}.js`;

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.head.appendChild(script);
}

/**
 * Tracks a pageview event. This function can be run in either a browser or a server context.
 *
 * @param {Request} [request] - The request object containing the url and headers. This parameter is optional and only used in a server context.
 */
function trackPageview(request?: Request) {
  if (isBrowser()) {
    if (window.statsy != null) {
      window.statsy.call(window, "pageview");
    }
  } else {
    trackServerPageview(request);
  }
}

/**
 * Tracks a custom event. This function can be run in either a browser or a server context.
 *
 * @param {Object} params - The parameters for the event tracking.
 * @param {string} params.name - The name of the event.
 * @param {Record<string, AllowedPropertyValues>} [params.props] - Additional properties to send with the event. This parameter is optional.
 * @param {Request} [params.request] - The request object containing the url and headers. This parameter is optional and only used in a server context.
 */
function trackEvent({ name, props, request }: TrackEventOptions) {
  if (isBrowser()) {
    if (window.statsy != null) {
      window.statsy.call(window, name, props);
    }
  } else {
    trackServerEvent({ request, name, props });
  }
}

export { inject, trackEvent, trackPageview };
