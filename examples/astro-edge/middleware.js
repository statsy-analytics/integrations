import { next } from "@vercel/edge";

export async function middleware(request) {
  return next({
    headers: { "x-from-middleware": "true" },
  });
}
