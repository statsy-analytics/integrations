import { next } from "@vercel/edge";

export async function middleware(request: Request) {
  return next({
    headers: { "x-from-middleware": "true" },
  });
}
