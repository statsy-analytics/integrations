import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { trackPageview } from "https://esm.sh/@statsy/analytics";

export async function handler(request: Request, ctx: MiddlewareHandlerContext) {
  // Track the pageview
  await trackPageview({ request });

  return ctx.next();
}
