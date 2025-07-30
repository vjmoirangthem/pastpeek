// Smart caching service with multiple storage backends and TTL management
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
}

class SmartCacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      maxSize: 1000,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      ...config
    };

    this.startCleanup();
  }

  // Generate cache key from parameters
  private generateKey(baseKey: string, params: Record<string, any> = {}): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    return paramString ? `${baseKey}:${paramString}` : baseKey;
  }

  // Check if cache entry is valid
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Get from memory cache
  get<T>(key: string, params: Record<string, any> = {}): T | null {
    const fullKey = this.generateKey(key, params);
    const entry = this.memoryCache.get(fullKey);
    
    if (entry && this.isValid(entry)) {
      console.log(`Cache HIT for ${fullKey}`);
      return entry.data;
    }

    if (entry) {
      this.memoryCache.delete(fullKey);
      console.log(`Cache EXPIRED for ${fullKey}`);
    }

    return null;
  }

  // Get from localStorage as fallback
  getFromLocalStorage<T>(key: string, params: Record<string, any> = {}): T | null {
    try {
      const fullKey = this.generateKey(key, params);
      const item = localStorage.getItem(`cache_${fullKey}`);
      if (item) {
        const entry: CacheEntry<T> = JSON.parse(item);
        if (this.isValid(entry)) {
          console.log(`LocalStorage HIT for ${fullKey}`);
          return entry.data;
        } else {
          localStorage.removeItem(`cache_${fullKey}`);
          console.log(`LocalStorage EXPIRED for ${fullKey}`);
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return null;
  }

  // Set in both memory and localStorage
  set<T>(key: string, data: T, params: Record<string, any> = {}, customTTL?: number): void {
    const fullKey = this.generateKey(key, params);
    const ttl = customTTL || this.config.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key: fullKey
    };

    // Memory cache
    if (this.memoryCache.size >= this.config.maxSize) {
      this.cleanup();
    }
    this.memoryCache.set(fullKey, entry);

    // localStorage cache
    try {
      localStorage.setItem(`cache_${fullKey}`, JSON.stringify(entry));
      console.log(`Cache SET for ${fullKey}`);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  // Get with fallback to localStorage, then fetch function
  async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    params: Record<string, any> = {},
    customTTL?: number
  ): Promise<T> {
    // Try memory cache first
    let cached = this.get<T>(key, params);
    if (cached) return cached;

    // Try localStorage
    cached = this.getFromLocalStorage<T>(key, params);
    if (cached) {
      // Update memory cache
      this.set(key, cached, params, customTTL);
      return cached;
    }

    // Fetch fresh data
    console.log(`Cache MISS for ${this.generateKey(key, params)} - fetching fresh data`);
    try {
      const data = await fetchFn();
      this.set(key, data, params, customTTL);
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${key}:`, error);
      throw error;
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key);
        deletedCount++;
      }
    }

    // Clean localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const entry = JSON.parse(item);
              if (!this.isValid(entry)) {
                keysToRemove.push(key);
              }
            } catch (e) {
              keysToRemove.push(key);
            }
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      deletedCount += keysToRemove.length;
    } catch (error) {
      console.error('Error cleaning localStorage:', error);
    }

    if (deletedCount > 0) {
      console.log(`Cache cleanup: removed ${deletedCount} expired entries`);
    }
  }

  // Start automatic cleanup
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Stop automatic cleanup
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
    
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('Cache cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      memoryEntries: this.memoryCache.size,
      memorySize: this.memoryCache.size,
      config: this.config
    };
  }
}

// Create singleton instance
export const cacheService = new SmartCacheService({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for most data
  maxSize: 500,
  cleanupInterval: 10 * 60 * 1000 // 10 minutes cleanup
});

// Export specific cache configurations for different data types
export const CACHE_KEYS = {
  WIKIPEDIA_SUMMARY: 'wikipedia_summary',
  WIKIPEDIA_FULL: 'wikipedia_full',
  GEONAMES: 'geonames',
  WIKIDATA_EVENTS: 'wikidata_events',
  OPENVERSE_IMAGES: 'openverse_images',
  MET_ARTIFACTS: 'met_artifacts',
  WEATHER: 'weather',
  CITY_DATA: 'city_data'
} as const;

export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 6 * 60 * 60 * 1000,  // 6 hours
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
} as const;