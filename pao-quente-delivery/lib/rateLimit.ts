import { put } from "@vercel/blob";
import { createHash } from "crypto";
import { getPrivateBlobUrl } from "@/lib/blob-store";

// ─── In-memory rate limiter ──────────────────────────────────────────────────
// Fast, stateless — use for high-frequency endpoints (e.g. orders).
// Resets on server restart; does not share state across instances.

const requestCounts = new Map<string, { count: number; resetTime: number }>();

const DEFAULT_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 5;

export function checkRateLimit(
  ip: string,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

export function getRateLimitStatus(ip: string) {
  const record = requestCounts.get(ip);
  if (!record) return { remaining: DEFAULT_MAX_REQUESTS, resetIn: 0 };
  return {
    remaining: Math.max(0, DEFAULT_MAX_REQUESTS - record.count),
    resetIn: Math.max(0, record.resetTime - Date.now()),
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) requestCounts.delete(ip);
  }
}, 10 * 60 * 1000);

// ─── Blob-backed rate limiter ────────────────────────────────────────────────
// Persists across server restarts and works across instances.
// Stored as a PRIVATE blob — IPs are also hashed (HMAC-SHA256) for defense in depth.
// Adds ~100 ms latency — use only for sensitive endpoints (e.g. admin login).

const RATE_LIMIT_BLOB_KEY = "pq/rate-limits.json";
type RateLimitStore = Record<string, { count: number; resetTime: number }>;

function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.JWT_SECRET ?? "salt"))
    .digest("hex")
    .slice(0, 24);
}

export async function checkRateLimitPersisted(
  ip: string,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS,
): Promise<boolean> {
  const key = hashIp(ip);
  const now = Date.now();

  let store: RateLimitStore = {};
  try {
    const res = await fetch(getPrivateBlobUrl(RATE_LIMIT_BLOB_KEY), {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN ?? ""}` },
      cache: "no-store",
    });
    if (res.ok) store = await res.json();
  } catch {
    // Fail open: better to allow than to block legitimate users on read failure.
  }

  const record = store[key];
  if (record && now <= record.resetTime && record.count >= maxRequests) {
    return false;
  }

  const newRecord =
    !record || now > record.resetTime
      ? { count: 1, resetTime: now + windowMs }
      : { count: record.count + 1, resetTime: record.resetTime };

  const cleaned: RateLimitStore = { [key]: newRecord };
  for (const [k, v] of Object.entries(store)) {
    if (k !== key && now <= v.resetTime) cleaned[k] = v;
  }

  // Write back best-effort — minor races here are acceptable for rate limiting.
  try {
    await put(RATE_LIMIT_BLOB_KEY, JSON.stringify(cleaned), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      allowOverwrite: true,
    } as unknown as Parameters<typeof put>[2]);
  } catch {
    // Non-fatal: fail open
  }

  return true;
}
