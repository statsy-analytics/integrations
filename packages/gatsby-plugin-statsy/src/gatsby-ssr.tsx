import React from "react";
import type { GatsbySSR } from "gatsby";
import { Script } from "gatsby";
import { Minimatch } from "minimatch";
import type { MMRegExp } from "minimatch";

const onRenderBody: GatsbySSR["onRenderBody"] = async (
  { setHeadComponents, setPostBodyComponents },
  pluginOptions
) => {
  if (process.env.NODE_ENV !== `production` && process.env.NODE_ENV !== `test`)
    return null;

  const origin = `https://${
    pluginOptions.trackingEndpointDomain || `statsy.observer`
  }`;

  const excludeStatsyPaths: MMRegExp[] = [];
  if (pluginOptions.exclude) {
    (pluginOptions.exclude as string[]).map((exclude: string) => {
      const mm = new Minimatch(exclude);
      const regex = mm.makeRe();
      if (regex instanceof RegExp) {
        excludeStatsyPaths.push(regex);
      }
    });
  }

  const removeQueryParams: string[] =
    pluginOptions.removeQueryParams as string[];

  const eventMiddleware = `
    (function() {
      window.statsy=function(...t){(window.statsyq=window.statsyq||[]).push(t)};
      function statsyEventMiddleware(event) {
        const url = new URL(event.href);
        ${
          excludeStatsyPaths.length > 0 &&
          `
            const excludeStatsyPaths = [${excludeStatsyPaths.join(",")}];
            if (event.name === 'pageview') {
              for (const regex of excludeStatsyPaths) {

                if (regex.test(url.pathname)) {
                  return null;
                }
              }
            }
          `
        }

        ${
          removeQueryParams.length > 0 &&
          `
            const removeQueryParams = ["${removeQueryParams.join('","')}"];

            for (const param of removeQueryParams) {
              url.searchParams.delete(param);
            }

            // Update event.url with the cleaned URL
            event.href = url.toString();
          `
        }

        console.log({event})
        return event;
      }
      window.statsy.call(window, "eventMiddleware", statsyEventMiddleware);
    })();
  `;

  if (typeof pluginOptions.autoTrackPageviews === `boolean`) {
    setPostBodyComponents([
      <script
        key="statsy-config"
        dangerouslySetInnerHTML={{
          __html: `window.statsyConfig = {
            autoTrackPageviews: ${pluginOptions.autoTrackPageviews},
          }`,
        }}
      />,
    ]);
  }

  setHeadComponents([
    <link rel="preconnect" key="preconnect-statsy" href={origin} />,
    <link rel="dns-prefetch" key="dns-prefetch-statsy" href={origin} />,
    <Script
      key="script-statsy"
      src={`${origin}/${pluginOptions.siteId}.js`}
      defer={true}
    />,
  ]);

  if (pluginOptions.exclude || pluginOptions.removeQueryParams) {
    setHeadComponents([
      <Script
        key="gatsby-plugin-statsy-middleware"
        dangerouslySetInnerHTML={{
          __html: `${eventMiddleware}`,
        }}
      />,
    ]);
  }
};

exports.onRenderBody = onRenderBody;
