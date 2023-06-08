import React from "react";
import type { GatsbySSR } from "gatsby";
import { Analytics } from "@statsy/react";
import { Script } from "gatsby";
import { Minimatch } from "minimatch";
import type { MMRegExp } from "minimatch";
import { minify } from "terser";

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

  const code = `
  window.statsy=function(...t){(window.statsyq=window.statsyq||[]).push(t)},window.statsy.call(window,"eventMiddleware",(function(t){const n=new
    URL(t.href),e=[${excludeStatsyPaths.join(
      ","
    )}];if("pageview"===t.name)for(const t of e)if(t.test(n.pathname))return null;const o=["${removeQueryParams.join(
    '","'
  )}"];for(const t of o)n.searchParams.delete(t);return
    t.href=n.toString(),console.log({event:t}),t}));
  `;

  // const eventMiddleware = `
  // window.statsy=function(...t){(window.statsyq=window.statsyq||[]).push(t)},window.statsy.call(window,"eventMiddleware",(function(t){const n=new
  //   URL(t.href)${
  //     excludeStatsyPaths.length > 0 &&
  //     `,e=[${excludeStatsyPaths.join(
  //       ","
  //     )}];if("pageview"===t.name)for(const t of e)if(t.test(n.pathname))return null;`
  //   }const o=["${removeQueryParams.join('","')}"];${
  //   removeQueryParams.length > 0 &&
  //   `for(const t of o)n.searchParams.delete(t);return
  //   t.href=n.toString()`
  // },console.log({event:t}),t}));
  // `;

  setHeadComponents([
    <link rel="preconnect" key="preconnect-statsy" href={origin} />,
    <link rel="dns-prefetch" key="dns-prefetch-statsy" href={origin} />,
    <script
      key="script-statsy"
      src={`${origin}/${pluginOptions.siteId}.js`}
      defer={true}
    />,
  ]);

  if (pluginOptions.exclude || pluginOptions.removeQueryParams) {
    // const { code } = await minify(eventMiddleware);

    // console.log({ code });

    setHeadComponents([
      <script
        key="gatsby-plugin-statsy-middleware"
        dangerouslySetInnerHTML={{
          __html: `${eventMiddleware}`,
        }}
      />,
    ]);
  }
};

exports.onRenderBody = onRenderBody;
