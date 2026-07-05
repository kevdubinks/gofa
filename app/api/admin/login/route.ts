import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken, safeCompare } from "@/lib/adminSession";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import { isSameOrigin } from "@/lib/originCheck";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine invalide" }, { status: 403 });
  }

  const clientKey = getClientKey(request);
  const { allowed } = await checkRateLimit("admin-login", clientKey, 5, 15);

  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessaie dans quelques minutes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const [userOk, passOk] = await Promise.all([
    safeCompare(username, process.env.ADMIN_USER ?? ""),
    safeCompare(password, process.env.ADMIN_PASSWORD ?? ""),
  ]);

  if (!userOk || !passOk) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
