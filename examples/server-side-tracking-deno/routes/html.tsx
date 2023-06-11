import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
// import { trackPageview } from "https://esm.sh/@statsy/web";

export const handler: Handlers = {
  async GET(_req: Request, ctx: HandlerContext) {
    console.log({ _req });
    // await trackPageview(_req);
  },
};

export default function Page(props: PageProps) {
  return <div>You are on the page '{props.url.href}'.</div>;
}
