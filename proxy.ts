import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminSession";

function generateNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

function buildCsp(nonce: string, isDev: boolean) {
  const connectSrc = isDev
    ? `'self' ws: http://localhost:* ${TURNSTILE_ORIGIN}`
    : `'self' ${TURNSTILE_ORIGIN}`;
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' ${TURNSTILE_ORIGIN}`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' ${TURNSTILE_ORIGIN}`;

  return [
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    `frame-src 'self' ${TURNSTILE_ORIGIN}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

async function guardAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return null;
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = await verifySessionToken(token);
  if (authenticated) {
    return null;
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const blocked = await guardAdmin(request);
    if (blocked) return blocked;
  }

  const nonce = generateNonce();
  const csp = buildCsp(nonce, isDev);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
