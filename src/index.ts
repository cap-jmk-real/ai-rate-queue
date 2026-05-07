/**
 * Redis-backed RPM limiter for AI/LLM API calls (shared across workers).
 *
 * This is a simple fixed-window limiter: per-minute buckets stored in Redis.
 * When the bucket is full, callers wait until the next minute boundary.
 */

export interface RateLimitQueueConfig {
  /** Requests per minute (shared across workers). */
  requestsPerMinute: number;
  /** Redis client for distributed rate limiting. */
  redis: import("ioredis").Redis;
  /** Redis key prefix for rate-limit counters. Default "ai-rate-queue". */
  keyPrefix?: string;
  /**
   * Adds a small random delay when waiting for the next window to reduce herd effects.
   * Default 200ms.
   */
  jitterMs?: number;
}

const DEFAULT_PREFIX = "ai-rate-queue";
const WINDOW_MS = 60_000;
const DEFAULT_JITTER_MS = 200;
const EXPIRY_BUFFER_MS = 5_000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Create a rate-limit queue. Call `enqueue(fn)` to run `fn` when under the limit.
 */
export function createRateLimitQueue(config: RateLimitQueueConfig) {
  const {
    requestsPerMinute,
    redis,
    keyPrefix = DEFAULT_PREFIX,
    jitterMs = DEFAULT_JITTER_MS,
  } = config;

  if (!Number.isFinite(requestsPerMinute) || requestsPerMinute <= 0) {
    throw new Error("requestsPerMinute must be a positive number");
  }

  const bucketKey = () => `${keyPrefix}:rpm:${Math.floor(Date.now() / WINDOW_MS)}`;

  async function acquireSlot(): Promise<void> {
    const key = bucketKey();
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.pexpire(key, WINDOW_MS + EXPIRY_BUFFER_MS);
    }

    if (count > requestsPerMinute) {
      await redis.decr(key);

      const now = Date.now();
      const untilNextWindow = WINDOW_MS - (now % WINDOW_MS);
      const jitter = jitterMs > 0 ? Math.floor(Math.random() * jitterMs) : 0;
      const waitMs = clamp(untilNextWindow + jitter, 0, WINDOW_MS + jitterMs);

      await sleep(waitMs);
      return acquireSlot();
    }
  }

  return {
    /** Run `fn` when under the rate limit. Returns the result of `fn`. */
    async enqueue<T>(fn: () => Promise<T>): Promise<T> {
      await acquireSlot();
      return fn();
    },
  };
}

export type RateLimitQueue = ReturnType<typeof createRateLimitQueue>;

