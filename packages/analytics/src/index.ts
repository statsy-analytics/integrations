interface PageViewEvent {
  name: "pageview";
  href: string;
}

interface CustomEvent {
  name: string; // consider limiting the names
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

interface UrlWithHeaders {
  url: string;
  headers: Headers;
}

export interface TrackEventOptions {
  request?: UrlWithHeaders;
  name: string;
  props?: Record<string, AllowedPropertyValues>;
}

interface FetchEventOptions {
  request: UrlWithHeaders;
  eventName: string;
  name?: string;
  props?: Record<string, AllowedPropertyValues>;
}

function getToken() {
  let statsyApiKey;

  if (typeof process !== "undefined" && process.env) {
    // This is a Node.js environment
    statsyApiKey = process.env.STATSY_API_KEY;
    // @ts-ignore
  } else if (typeof Deno !== "undefined") {
    // This is a Deno environment
    // @ts-ignore
    statsyApiKey = Deno.env.get("STATSY_API_KEY");
  } else {
    throw new Error(
      "Unknown environment. This code runs in either Node.js or Deno environments."
    );
  }

  if (!statsyApiKey) {
    throw new Error(
      "You must set the STATSY_API_KEY environment variable to use the Statsy Edge application."
    );
  }

  return statsyApiKey;
}

/**
 * A helper function to send a request to Statsy API.
 *
 * @async
 * @function
 * @param {Object} options - The options for the Statsy API call.
 * @param {string} options.eventName - The name of the event.
 * @param {UrlWithHeaders} options.request - The request object containing the url and headers.
 * @param {Record<string, AllowedPropertyValues>} options.props - Additional properties to send with the event.
 * @throws {Error} Throws an error if request object or STATS_API_KEY environment variable are not provided.
 */
async function sendToStatsyApi({
  request,
  eventName,
  props,
}: FetchEventOptions) {
  if (!request) {
    throw new Error(
      `You must pass the request object to ${eventName} when using server-side tracking.`
    );
  }

  const { hostname } = new URL(request.url);
  const statsyApiKey = getToken();

  // skip if it's not HTML
  if (request.headers.get("content-type"))
    if (!statsyApiKey) {
      throw new Error(
        "You must set the STATSY_API_KEY environment variable to use the Statsy Edge application."
      );
    }

  try {
    return await fetch(`https://api.statsy.com/v1/beep`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
        "User-Agent": request.headers.get("user-agent") || "",
        Authorization: `Bearer ${statsyApiKey}`,
      },
      body: JSON.stringify({
        eventName,
        href: request.url,
        domain: hostname,
        referrer: request.headers.get("referer") || "",
        props,
      }),
    });
  } catch (error) {
    console.error(`Failed to send ${eventName} event to Statsy API`, error);
    // Here, consider if you want to re-throw the error, depending on your error handling strategy
  }
}

/**
 * Track a pageview event in server context.
 *
 * @async
 * @function
 * @param {UrlWithHeaders} request - The request object containing the url and headers.
 */
async function trackServerPageview({ request }: { request: UrlWithHeaders }) {
  const acceptHeader = request.headers.get("accept");
  const contentTypeHeader = request.headers.get("content-type");

  if (
    (acceptHeader && acceptHeader.includes("text/html")) ||
    (contentTypeHeader && contentTypeHeader.includes("text/html"))
  ) {
    await sendToStatsyApi({ request: request!, eventName: "pageview" });
  } else {
    Promise.resolve();
  }
}

/**
 * Track a custom event in server context.
 *
 * @async
 * @function
 * @param {Object} options - The options for the event tracking.
 * @param {UrlWithHeaders} options.request - The request object containing the url and headers.
 * @param {string} options.name - The name of the custom event.
 * @param {Record<string, AllowedPropertyValues>} options.props - Additional properties to send with the event.
 */
async function trackServerEvent({ request, name, props }: TrackEventOptions) {
  await sendToStatsyApi({ request: request!, eventName: name, name, props });
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
function trackPageview({ request }: { request?: UrlWithHeaders } = {}) {
  if (isBrowser()) {
    if (window.statsy != null) {
      window.statsy.call(window, "pageview");
    }
  } else if (request) {
    return trackServerPageview({ request });
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
    return trackServerEvent({ request, name, props });
  }
}

export { inject, trackEvent, trackPageview };
