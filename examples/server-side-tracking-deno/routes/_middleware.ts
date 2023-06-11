import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { trackPageview } from "https://esm.sh/@statsy/analytics";

export function handler(req: Request, ctx: MiddlewareHandlerContext) {
  trackPageview(req);

  return ctx.next();
}
