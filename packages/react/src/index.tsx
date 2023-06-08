import React from "react";
import { inject, AnalyticsProps, track } from "@statsy/analytics";

/**
 * Analytics Component for Statsy
 *
 * This component injects the Statsy Analytics script into the page head and starts tracking page views.
 *
 * @component
 * @param {AnalyticsProps} props - Props for the Analytics component.
 * @param {string} props.siteId - Your Statsy site ID. (This is a required parameter)
 * @param {string} [props.trackingEndpointDomain] - The domain to use for the analytics script. Defaults to `statsy.observer`.
 * @param {Function} [props.eventMiddleware] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 * @example
 * ```jsx
 * import { Analytics } from '@statsy/react';
 *
 * function MyApp() {
 *   return (
 *     <Analytics siteId="YOUR_SITE_ID" />
 *   )
 * }
 * ```
 * @returns {null}
 */
function Analytics({
  siteId,
  trackingEndpointDomain,
  eventMiddleware,
}: AnalyticsProps): null {
  React.useEffect(() => {
    inject({
      siteId,
      trackingEndpointDomain,
      eventMiddleware,
    });
  }, []);

  return null;
}

/**
 * Hook for using Statsy Analytics.
 * 
 * This hook provides access to the `pageview` and `track` functions.
 *
 * @function
 * @returns {Object} - The Statsy analytics methods.
 * @returns {Function} .pageview - Call this function to track a pageview event. Takes no parameters.
 * @returns {Function} .track - Call this function to track a custom event. Takes the event name and an optional payload as parameters.
 *
 * @example
 * ```javascript
 * import { useStatsy } from './yourFilePath';
 * 
 * function SomeComponent() {
 *   const { track } = useStatsy();
 *   
 *   // Track a custom event
 *   return (
 *      <button onClick={() => track('Button Click', { label: 'Contact Us' })}>
 *        Contact Us
 *      </button>
 *    )
 * }
 * ```
 */
export function useStatsy(): {
  pageview: () => void;
  track: (eventName: string, payload?: any) => void;
} {
  return {
    pageview: () => {
      track("pageview");
    },
    track,
  };
}

export { Analytics, inject, track };
