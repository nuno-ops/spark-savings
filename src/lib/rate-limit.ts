import { NextResponse } from "next/server";

// In-memory rate limiter using sliding window.
// For production at scale, swap for Redis-backed (e.g. @upstash/ratelimit).
// This works well for single-instance deployments (Vercel serverless has per-instance state,
// but even partial limiting is better than none).

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

// Preset configs for common use cases
export const RATE_LIMITS = {
  /** Auth endpoints: 5 attempts per 15 minutes */
  auth: { limit: 5, windowSeconds: 15 * 60 },
  /** Signup: 3 per hour per IP */
  signup: { limit: 3, windowSeconds: 60 * 60 },
  /** Password reset: 3 per 15 minutes */
  passwordReset: { limit: 3, windowSeconds: 15 * 60 },
  /** Mutations (create/update): 20 per minute */
  mutation: { limit: 20, windowSeconds: 60 },
  /** Reads: 60 per minute */
  read: { limit: 60, windowSeconds: 60 },
  /** API key endpoints: 10 per minute */
  apiKey: { limit: 10, windowSeconds: 60 },
} as const;

/**
 * Check rate limit for a given key.
 * Returns null if allowed, or a NextResponse 429 if rate limited.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig
): NextResponse | null {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return null;
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(entry.resetAt / 1000).toString(),
        },
      }
    );
  }

  entry.count++;
  return null;
}

/**
 * Extract IP from request for rate limiting.
 * Uses x-forwarded-for (set by Vercel/proxies) or falls back to a default.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
