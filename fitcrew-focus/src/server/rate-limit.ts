import { LRUCache } from "lru-cache";
import { env } from "@/env";
import { getRedisClient } from "@/server/redis";

type RateLimitConfig = {
  identifier: string;
  limit: number;
  windowMs: number;
  prefix?: string;
  now?: number;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  hitCount: number;
};

const DEFAULT_PREFIX = "fitcrew:rl";

const memoryStore = new LRUCache<string, { count: number; expiresAt: number }>({
  max: 5_000,
});

function computeWindowKey(config: RateLimitConfig, windowId: number) {
  return `${config.prefix ?? DEFAULT_PREFIX}:${config.identifier}:${windowId}`;
}

async function consumeRedisLimit(config: RateLimitConfig, ttlMs: number, windowKey: string, now: number) {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const results = await client
      .multi()
      .incr(windowKey)
      .pexpire(windowKey, ttlMs, "NX")
      .exec();

    const incrResult = results?.[0]?.[1];
    const count = typeof incrResult === "number" ? incrResult : Number(incrResult ?? 0);

    return {
      ok: count <= config.limit,
      limit: config.limit,
      remaining: Math.max(config.limit - count, 0),
      resetAt: now + ttlMs,
      hitCount: count,
    } satisfies RateLimitResult;
  } catch {
    return null;
  }
}

function consumeMemoryLimit(config: RateLimitConfig, ttlMs: number, windowKey: string, now: number): RateLimitResult {
  const existing = memoryStore.get(windowKey);
  let count = 1;

  if (!existing || existing.expiresAt <= now) {
    memoryStore.set(windowKey, { count: 1, expiresAt: now + ttlMs }, { ttl: ttlMs });
  } else {
    count = existing.count + 1;
    existing.count = count;
    existing.expiresAt = now + ttlMs;
    memoryStore.set(windowKey, existing, { ttl: ttlMs });
  }

  return {
    ok: count <= config.limit,
    limit: config.limit,
    remaining: Math.max(config.limit - count, 0),
    resetAt: now + ttlMs,
    hitCount: count,
  };
}

export async function consumeRateLimit(config: RateLimitConfig): Promise<RateLimitResult | null> {
  if (!Number.isFinite(config.limit) || config.limit <= 0) {
    return null;
  }

  const now = config.now ?? Date.now();
  const windowId = Math.floor(now / config.windowMs);
  const windowKey = computeWindowKey(config, windowId);
  const ttlMs = config.windowMs - (now % config.windowMs);

  const redisResult = await consumeRedisLimit(config, ttlMs, windowKey, now);
  if (redisResult) {
    return redisResult;
  }

  return consumeMemoryLimit(config, ttlMs, windowKey, now);
}

export function buildRateLimitHeaders(result: RateLimitResult | null) {
  if (!result) {
    return undefined;
  }

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, Math.floor(result.remaining)).toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
  };

  if (!result.ok) {
    const retryAfterSeconds = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));
    headers["Retry-After"] = retryAfterSeconds.toString();
  }

  return headers;
}

export const RATE_LIMIT_DEFAULTS = {
  postsPerMinute: 10,
  commentsPerMinute: 20,
  spinsPerDay: 3,
};

export function getPostsPerMinuteLimit() {
  return env.RATELIMIT_POSTS_PER_MIN ?? RATE_LIMIT_DEFAULTS.postsPerMinute;
}

export function getCommentsPerMinuteLimit() {
  return env.RATELIMIT_COMMENTS_PER_MIN ?? RATE_LIMIT_DEFAULTS.commentsPerMinute;
}

export function getSpinsPerDayLimit() {
  return env.RATELIMIT_SPINS_PER_DAY ?? RATE_LIMIT_DEFAULTS.spinsPerDay;
}
