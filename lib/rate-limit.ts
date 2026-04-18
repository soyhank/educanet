/**
 * Simple in-memory rate limiter for MVP (<50 users).
 * For production with more users, migrate to Upstash Redis.
 *
 * Stores hit counts in a Map with TTL-based cleanup.
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

type RateLimitConfig = {
  /** Unique identifier (e.g., "login", "register") */
  prefix: string;
  /** Maximum number of requests in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check rate limit for a given key (typically IP or email).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const storeKey = `${config.prefix}:${key}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return { success: true, remaining: config.limit - 1, resetAt: now + config.windowSeconds * 1000 };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.limit - entry.count, resetAt: entry.resetAt };
}

// Pre-configured limiters
export const loginLimiter: RateLimitConfig = {
  prefix: "login",
  limit: 5,
  windowSeconds: 60,
};

export const registerLimiter: RateLimitConfig = {
  prefix: "register",
  limit: 3,
  windowSeconds: 60,
};

export const resetPasswordLimiter: RateLimitConfig = {
  prefix: "reset-password",
  limit: 3,
  windowSeconds: 3600,
};

/**
 * Get client IP from request headers.
 */
export function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}
