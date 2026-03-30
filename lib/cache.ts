interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private ttl: number;

  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  generateKey(params: object): string {
    return JSON.stringify(params);
  }

  get(params: object): T | null {
    const key = this.generateKey(params);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(params: object, data: T): void {
    const key = this.generateKey(params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const searchCache = new SimpleCache(5 * 60 * 1000);
export const youtubeCache = new SimpleCache(5 * 60 * 1000);

if (typeof globalThis.window !== "undefined") {
  setInterval(() => {
    searchCache.cleanup();
    youtubeCache.cleanup();
  }, 60 * 1000);
}
