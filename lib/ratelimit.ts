/**
 * Fixed-window rate limiter, in memory.
 *
 * IMPORTANT LIMITATION: this is PER SERVERLESS INSTANCE, not global. Vercel runs
 * many concurrent instances, so the effective ceiling is roughly
 * (limit x instance count), not `limit`. That is acceptable here — the goal is to
 * stop one broken client or a naive script from flooding the table, not to enforce
 * an exact quota. If exact global limiting is ever needed, this is the seam to
 * swap for Redis/Upstash; the call signature would not change.
 *
 * Keys are IPs and are held only for the length of one window. They are never
 * written to the database.
 */

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 60;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 10_000) sweep(now);
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Drop expired buckets so a long-lived warm instance can't grow unbounded. */
function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}
