// @ts-check
import type { GatsbyNode } from "gatsby";
/**
 * @type {import('gatsby').GatsbyNode["pluginOptionsSchema"]}
 */
const pluginOptionsSchema: GatsbyNode["pluginOptionsSchema"] = ({ Joi }) =>
  Joi.object({
    siteId: Joi.string().description(`Your Statsy site ID`).required(),
    trackingEndpointDomain: Joi.string()
      .description(
        `Your optional self hosted Statsy domain. If you are using the self hosted version of Statsy, you can set this to your domain.`
      )
      .default("statsy.observer"),
    autoTrackPageviews: Joi.boolean()
      .description(
        `Whether to automatically track page views. Defaults to true.`
      )
      .default(true),
    exclude: Joi.array()
      .items(Joi.string())
      .description(
        `If you need to exclude any path from the tracking system, you can add it (one or more) to this optional array as glob expressions.`
      )
      .default([]),
    removeQueryParams: Joi.array()
      .items(Joi.string())
      .description(
        `If you need to remove any query param from the tracking system, you can add it (one or more) to this optional array.`
      )
      .default([]),
  });

exports.pluginOptionsSchema = pluginOptionsSchema;
