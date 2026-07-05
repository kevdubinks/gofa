export const ADMIN_COOKIE_NAME = "bofa_admin";

async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return toHex(digest);
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Compares two secrets without leaking their length or content through
 * timing — both sides are hashed to a fixed-length digest first (so the
 * length check never depends on the real values), then compared byte by
 * byte without short-circuiting.
 */
export async function safeCompare(a: string, b: string) {
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  return constantTimeEqual(ha, hb);
}

async function getKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(process.env.ADMIN_PASSWORD ?? ""),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken() {
  const key = await getKey();
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode("bofa-admin-session"));
  return toHex(signature);
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const expected = await createSessionToken();
  return constantTimeEqual(token, expected);
}
