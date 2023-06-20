import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { trackPageview } from "https://esm.sh/@statsy/analytics@0.1.4";

export async function handler(request: Request, ctx: MiddlewareHandlerContext) {
  // Track the pageview
  await trackPageview({ request });

  return ctx.next();
}
