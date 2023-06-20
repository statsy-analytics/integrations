import type { MetaFunction, LoaderArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { trackPageview } from "@statsy/analytics";

export const config = { runtime: "edge" };

export let loader = async ({ request }: LoaderArgs) => {
  // Track the pageview
  // await trackPageview({ request });
  console.log("url: ", request.url);

  return json({});
};

export default function Edge() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h2>About Page</h2>
    </div>
  );
}
