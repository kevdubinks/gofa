import { NextRequest } from "next/server";
import { sql } from "@/lib/db";

export function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Sliding-window rate limit backed by Postgres — avoids needing a separate
 * Redis/Upstash service for a low-traffic single-shop app. Records the
 * attempt regardless of outcome so brute-force retries count against the
 * window even before credentials are checked.
 */
export async function checkRateLimit(
  bucket: string,
  clientKey: string,
  limit: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const [{ count }] = (await sql`
    SELECT count(*)::int AS count
    FROM rate_limit_events
    WHERE bucket = ${bucket}
      AND client_key = ${clientKey}
      AND created_at > ${windowStart}
  `) as unknown as { count: number }[];

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await sql`
    INSERT INTO rate_limit_events (bucket, client_key)
    VALUES (${bucket}, ${clientKey})
  `;

  // Scoped, best-effort cleanup of this client's own old rows — keeps the
  // table small without a broad/unscoped delete.
  await sql`
    DELETE FROM rate_limit_events
    WHERE bucket = ${bucket}
      AND client_key = ${clientKey}
      AND created_at <= ${windowStart}
  `;

  return { allowed: true, remaining: limit - count - 1 };
}
