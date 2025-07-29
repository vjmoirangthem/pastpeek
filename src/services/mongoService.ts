// MongoDB Service for caching and data persistence
// Note: This is a safe implementation - no direct MongoDB connection strings exposed

export interface CachedCityData {
  _id?: string;
  city: string;
  data: any;
  lastUpdated: Date;
  expiresAt: Date;
}

export interface SavedSearch {
  _id?: string;
  userId?: string;
  city: string;
  yearRange: { start: number; end: number };
  savedAt: Date;
  name?: string;
}

// Safe MongoDB configuration
const MONGODB_CONFIG = {
  // In production, these would come from environment variables
  // For now, we'll use a connection service pattern
  enabled: false, // Set to true when MongoDB is properly configured
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
};

// Cache service (localStorage fallback when MongoDB not available)
export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, any>();

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get(key: string): Promise<any> {
    try {
      // Try localStorage first
      const stored = localStorage.getItem(`pastpeek_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (new Date(parsed.expiresAt) > new Date()) {
          return parsed.data;
        } else {
          localStorage.removeItem(`pastpeek_cache_${key}`);
        }
      }

      // Try memory cache
      return this.cache.get(key) || null;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttl: number = MONGODB_CONFIG.cacheDuration): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttl);
      const cacheData = { data, expiresAt };

      // Store in localStorage
      localStorage.setItem(`pastpeek_cache_${key}`, JSON.stringify(cacheData));

      // Store in memory cache
      this.cache.set(key, data);

      // Clean up expired items occasionally
      this.cleanupExpired();
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(`pastpeek_cache_${key}`);
      this.cache.delete(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  private cleanupExpired(): void {
    try {
      // Clean localStorage (10% chance on each set operation)
      if (Math.random() < 0.1) {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('pastpeek_cache_')) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                const parsed = JSON.parse(stored);
                if (new Date(parsed.expiresAt) <= new Date()) {
                  keysToRemove.push(key);
                }
              }
            } catch {
              keysToRemove.push(key);
            }
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }
}

// City data caching
export async function getCachedCityData(city: string, yearRange?: { start: number; end: number }): Promise<any> {
  const cache = CacheService.getInstance();
  const cacheKey = yearRange 
    ? `city_${city}_${yearRange.start}_${yearRange.end}`
    : `city_${city}`;
  
  return await cache.get(cacheKey);
}

export async function setCachedCityData(
  city: string, 
  data: any, 
  yearRange?: { start: number; end: number }
): Promise<void> {
  const cache = CacheService.getInstance();
  const cacheKey = yearRange 
    ? `city_${city}_${yearRange.start}_${yearRange.end}`
    : `city_${city}`;
  
  await cache.set(cacheKey, data);
}

// Saved searches (localStorage for now)
export async function saveSearch(search: Omit<SavedSearch, '_id' | 'savedAt'>): Promise<void> {
  try {
    const searches = await getSavedSearches();
    const newSearch: SavedSearch = {
      ...search,
      savedAt: new Date(),
      name: search.name || `${search.city} (${search.yearRange.start}-${search.yearRange.end})`
    };

    searches.push(newSearch);
    localStorage.setItem('pastpeek_saved_searches', JSON.stringify(searches));
  } catch (error) {
    console.error('Error saving search:', error);
  }
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  try {
    const stored = localStorage.getItem('pastpeek_saved_searches');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting saved searches:', error);
    return [];
  }
}

export async function deleteSavedSearch(index: number): Promise<void> {
  try {
    const searches = await getSavedSearches();
    searches.splice(index, 1);
    localStorage.setItem('pastpeek_saved_searches', JSON.stringify(searches));
  } catch (error) {
    console.error('Error deleting saved search:', error);
  }
}

// MongoDB connection helper (for future implementation)
export async function connectMongoDB(): Promise<boolean> {
  try {
    // This would be implemented when MongoDB is properly configured
    // For now, we return false to use localStorage fallback
    return false;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Analytics and usage tracking (localStorage for now)
export async function trackUsage(event: string, data?: any): Promise<void> {
  try {
    const usage = JSON.parse(localStorage.getItem('pastpeek_usage') || '[]');
    usage.push({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 events
    if (usage.length > 100) {
      usage.splice(0, usage.length - 100);
    }

    localStorage.setItem('pastpeek_usage', JSON.stringify(usage));
  } catch (error) {
    console.warn('Usage tracking error:', error);
  }
}
