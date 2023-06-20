"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/gatsby-ssr.tsx
var import_react = __toESM(require("react"));
var import_gatsby = require("gatsby");
var import_minimatch = require("minimatch");
var onRenderBody = async ({ setHeadComponents, setPostBodyComponents }, pluginOptions) => {
  if (process.env.NODE_ENV !== `production` && process.env.NODE_ENV !== `test`)
    return null;
  const origin = `https://${pluginOptions.trackingEndpointDomain || `statsy.observer`}`;
  const excludeStatsyPaths = [];
  if (pluginOptions.exclude) {
    pluginOptions.exclude.map((exclude) => {
      const mm = new import_minimatch.Minimatch(exclude);
      const regex = mm.makeRe();
      if (regex instanceof RegExp) {
        excludeStatsyPaths.push(regex);
      }
    });
  }
  const removeQueryParams = pluginOptions.removeQueryParams;
  const eventMiddleware = `
    (function() {
      window.statsy=function(...t){(window.statsyq=window.statsyq||[]).push(t)};
      function statsyEventMiddleware(event) {
        const url = new URL(event.href);
        ${excludeStatsyPaths.length > 0 && `
            const excludeStatsyPaths = [${excludeStatsyPaths.join(",")}];
            if (event.name === 'pageview') {
              for (const regex of excludeStatsyPaths) {

                if (regex.test(url.pathname)) {
                  return null;
                }
              }
            }
          `}

        ${removeQueryParams.length > 0 && `
            const removeQueryParams = ["${removeQueryParams.join('","')}"];

            for (const param of removeQueryParams) {
              url.searchParams.delete(param);
            }

            // Update event.url with the cleaned URL
            event.href = url.toString();
          `}

        console.log({event})
        return event;
      }
      window.statsy.call(window, "eventMiddleware", statsyEventMiddleware);
    })();
  `;
  if (typeof pluginOptions.autoTrackPageviews === `boolean`) {
    setPostBodyComponents([
      /* @__PURE__ */ import_react.default.createElement(
        "script",
        {
          key: "statsy-config",
          dangerouslySetInnerHTML: {
            __html: `window.statsyConfig = {
            autoTrackPageviews: ${pluginOptions.autoTrackPageviews},
          }`
          }
        }
      )
    ]);
  }
  setHeadComponents([
    /* @__PURE__ */ import_react.default.createElement("link", { rel: "preconnect", key: "preconnect-statsy", href: origin }),
    /* @__PURE__ */ import_react.default.createElement("link", { rel: "dns-prefetch", key: "dns-prefetch-statsy", href: origin }),
    /* @__PURE__ */ import_react.default.createElement(
      import_gatsby.Script,
      {
        key: "script-statsy",
        src: `${origin}/${pluginOptions.siteId}.js`,
        defer: true
      }
    )
  ]);
  if (pluginOptions.exclude || pluginOptions.removeQueryParams) {
    setHeadComponents([
      /* @__PURE__ */ import_react.default.createElement(
        import_gatsby.Script,
        {
          key: "gatsby-plugin-statsy-middleware",
          dangerouslySetInnerHTML: {
            __html: `${eventMiddleware}`
          }
        }
      )
    ]);
  }
};
exports.onRenderBody = onRenderBody;
//# sourceMappingURL=gatsby-ssr.js.map