import Statsy from "./src/Statsy.astro";

export interface StatsyProps {
  siteId: string;
  trackingEndpointDomain: string;
  eventMiddleware?: (event: any) => any;
}

export interface StatsyEvent {
  name: string;
  href: string;
}

/**
 * `Statsy` component for Astro.
 *
 * This component injects the Statsy Analytics script into your Astro application and starts tracking page views.
 *
 * @component
 * @example
 * ```
 * <Statsy siteId="YOUR_SITE_ID" trackingEndpointDomain="YOUR_ENDPOINT_DOMAIN" eventMiddleware={YOUR_MIDDLEWARE_FUNCTION} />
 * ```
 *
 * @param {object} props - Component props
 * @param {string} props.siteId - Your Statsy site ID. This is a required parameter.
 * @param {string} [props.trackingEndpointDomain] - The domain to use for the analytics script. Defaults to `statsy.observer`.
 * @param {function} [props.eventMiddleware] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 */
export { Statsy };
