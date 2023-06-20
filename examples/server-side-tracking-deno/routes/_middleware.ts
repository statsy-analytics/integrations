import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { trackPageview } from "https://esm.sh/@statsy/analytics";

export async function handler(req: Request, ctx: MiddlewareHandlerContext) {
  await trackPageview({ request: req });

  return ctx.next();
}
