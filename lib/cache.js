/**
 * Simple in-memory cache with TTL (Time To Live)
 * Used for caching search results to reduce API calls
 */

class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Generate cache key from query parameters
   * @param {Object} params - Query parameters to generate key from
   * @returns {string} JSON stringified cache key
   */
  generateKey(params) {
    return JSON.stringify(params);
  }

  /**
   * Get cached value if it exists and hasn't expired
   * @param {Object} params - Query parameters to lookup
   * @returns {*|null} Cached data or null if not found/expired
   */
  get(params) {
    const key = this.generateKey(params);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      // Expired, remove from cache
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache value with current timestamp
   * @param {Object} params - Query parameters to use as cache key
   * @param {*} data - Data to cache
   * @returns {void}
   */
  set(params, data) {
    const key = this.generateKey(params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached data
   * @returns {void}
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} Number of entries in cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Clean expired entries from cache
   * Called automatically every minute to prevent memory leaks
   * @returns {void}
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instances for search and YouTube
export const searchCache = new SimpleCache(5 * 60 * 1000); // 5 minutes
export const youtubeCache = new SimpleCache(5 * 60 * 1000); // 5 minutes

// Cleanup expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    searchCache.cleanup();
    youtubeCache.cleanup();
  }, 60 * 1000);
}
