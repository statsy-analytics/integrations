/**
 * Statsy plugin for Vue.js
 * @module @statsy/vue
 */

/**
 * Import dependencies
 */
import {
  inject,
  trackEvent,
  trackPageview,
  AnalyticsProps,
  TrackEventOptions,
} from "@statsy/analytics";

import { App } from "vue";

interface Statsy {
  trackPageview: () => void;
  trackEvent: ({ name, props, request }: TrackEventOptions) => void;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $statsy: Statsy;
  }
}

/**
 * Provides the analytics service as a Vue plugin
 * @param {Object} app - Vue application instance
 * @param {Object} options - Options for the Statsy service
 * @param {string} options.siteId - Your Statsy site ID
 * @param {string} [options.trackingEndpointDomain] - The domain to use for the analytics script. Defaults to `statsy.observer`
 * @param {Function} [options.eventMiddleware] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event
 * @param {boolean} [options.autoTrackPageviews] - Whether to automatically track page views. Defaults to `true`
 * @example
 * // Add the plugin to your Vue app:
 * app.use(VueStatsy, { siteId: 'YOUR_SITE_ID' })
 * @returns {undefined}
 */
export function VueStatsy(app: App, options: AnalyticsProps) {
  const {
    siteId,
    trackingEndpointDomain,
    eventMiddleware,
    autoTrackPageviews,
  } = options;

  if (!siteId) {
    throw new Error("The `siteId` is required for Statsy Analytics");
  }

  inject({
    siteId,
    trackingEndpointDomain,
    eventMiddleware,
    autoTrackPageviews,
  });

  app.config.globalProperties.$statsy = {
    trackPageview,
    trackEvent,
  };
}
