import { Redis } from "@upstash/redis";

const enabled =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = enabled
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export function isRedisEnabled() {
  return Boolean(redis);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const value = await redis.get<T>(key);
  return value ?? null;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  if (!redis) return;
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function cacheDel(key: string) {
  if (!redis) return;
  await redis.del(key);
}

export async function cacheAside<T>(params: {
  key: string;
  ttlSeconds: number;
  label: string;
  fetcher: () => Promise<T>;
}): Promise<T> {
  const { key, ttlSeconds, fetcher, label } = params;

  if (!redis) {
    console.info(`[cache:skip] ${label} redis-disabled key=${key}`);
    return fetcher();
  }

  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    console.info(`[cache:hit] ${label} key=${key}`);
    return cached;
  }

  console.info(`[cache:miss] ${label} key=${key}`);
  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}
