import { NextRequest } from "next/server";

/**
 * Defense-in-depth against CSRF on top of SameSite=Lax cookies: rejects
 * cross-site POST/PUT requests whose Origin (or Referer, as a fallback)
 * doesn't match the host the request came in on.
 */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origin) return true; // no Origin/Referer at all: not a browser cross-site request

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}
