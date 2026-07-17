type CacheValue<T> = { value: T; expiresAt: number };
const memoryCache = new Map<string, CacheValue<unknown>>();

export const aiCacheLayer = {
  async get<T = unknown>(key?: string): Promise<T | undefined> {
    if (!key) return undefined;
    const item = memoryCache.get(key);
    if (!item) return undefined;
    if (item.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return undefined;
    }
    return item.value as T;
  },
  async set<T = unknown>(key: string | undefined, value: T, ttlSeconds = 300): Promise<void> {
    if (!key) return;
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },
  async del(key: string): Promise<void> {
    memoryCache.delete(key);
  },
};