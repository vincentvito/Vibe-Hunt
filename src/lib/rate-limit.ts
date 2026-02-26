import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// Cache rate limiter instances to avoid recreating on every call
const limiters = new Map<string, Ratelimit>();

function getLimiter(maxRequests: number, windowMs: number): Ratelimit {
  const key = `${maxRequests}:${windowMs}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      prefix: "vibehunt:rl",
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

export async function rateLimit(
  identifier: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getLimiter(maxRequests, windowMs);
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
  };
}
