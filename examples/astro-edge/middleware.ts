import { next } from "@vercel/edge";

export async function middleware(request: Request) {
  console.log({ url: request.url });

  await fetch(`https://api.statsy.com/v1/beep`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": request.headers.get("x-forwarded-for") || "",
      "User-Agent": request.headers.get("user-agent") || "",
      Authorization: `Bearer ${process.env.STATSY_API_KEY}`,
    },
    body: JSON.stringify({
      eventName: "pageview",
      url: request.url,
      domain: "statsy-astro-edge.vercel.app",
      referrer: request.headers.get("referer"),
    }),
  });

  return next({
    headers: { "x-from-middleware": "true" },
  });
}
