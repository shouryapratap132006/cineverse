// ============================================================
// In-memory cache with TTL — drop-in Redis replacement
// Set REDIS_URL env to upgrade (future)
// ============================================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic cleanup every 5 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }
}

// Global singleton
const cache = new MemoryCache();

export const aiCache = {
  get: <T>(key: string) => cache.get<T>(key),
  set: <T>(key: string, value: T, ttlSeconds = 3600) =>
    cache.set(key, value, ttlSeconds),
  del: (key: string) => cache.del(key),
  exists: (key: string) => cache.exists(key),

  /** Helper to build deterministic cache keys */
  key: (...parts: (string | number | undefined)[]) =>
    parts
      .filter(Boolean)
      .join(":")
      .toLowerCase()
      .replace(/\s+/g, "_"),
};

export default aiCache;
