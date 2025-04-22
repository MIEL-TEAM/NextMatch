import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || "",
  token: process.env.UPSTASH_REDIS_TOKEN || "",
});

export async function setWithExpiry<T>(
  key: string,
  value: T,
  expirySeconds: number
): Promise<void> {
  await redis.set(
    key,
    typeof value === "string" ? value : JSON.stringify(value),
    {
      ex: expirySeconds,
    }
  );
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  const data = await redis.get<string | T>(key);

  if (data === null || data === undefined) {
    return null;
  }

  if (typeof data !== "string" || typeof data === "object") {
    return data as T;
  }

  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.log(e);

    return data as unknown as T;
  }
}

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 60 * 15
): Promise<T> {
  try {
    const cachedData = await getFromCache<T>(key);

    if (cachedData !== null) {
      return cachedData;
    }

    const data = await queryFn();

    await setWithExpiry(key, data, ttl);

    return data;
  } catch (error) {
    console.error("Redis cache error:", error);
    return queryFn();
  }
}

export async function deleteKeysByPattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error("Error deleting keys by pattern:", error);
    return 0;
  }
}

export const cacheKeys = {
  member: (userId: string) => `member:${userId}`,
  memberPhotos: (userId: string) => `memberPhotos:${userId}`,
  smartMatches: (userId: string, page: string, pageSize: string) =>
    `smartMatches:${userId}:${page}:${pageSize}`,
  membersList: (params: Record<string, string>) =>
    `membersList:${Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join(":")}`,
};
