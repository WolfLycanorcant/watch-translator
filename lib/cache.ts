import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_CONFIG } from './constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  expiry?: number;
  compress?: boolean;
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly maxMemoryItems = 50;

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Check persistent storage
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const parsed: CacheItem<T> = JSON.parse(stored);
      if (!this.isValid(parsed)) {
        await this.remove(key);
        return null;
      }

      // Update memory cache
      this.setMemoryCache(key, parsed);
      return parsed.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const { expiry = API_CONFIG.CACHE_EXPIRY } = options;
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry,
    };

    try {
      // Set in memory cache
      this.setMemoryCache(key, item);

      // Set in persistent storage
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Cache remove error:', error);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEYS.CACHE) || 
        key.startsWith(STORAGE_KEYS.HISTORY)
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE));
      
      for (const key of cacheKeys) {
        const item = await this.get(key);
        if (!item) {
          await this.remove(key);
        }
      }

      // Clean memory cache
      for (const [key, item] of this.memoryCache.entries()) {
        if (!this.isValid(item)) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }

  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() < item.expiry;
  }

  private setMemoryCache<T>(key: string, item: CacheItem<T>): void {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, item);
  }

  getStats() {
    return {
      memoryItems: this.memoryCache.size,
      maxMemoryItems: this.maxMemoryItems,
    };
  }
}

// Singleton instance
export const cache = new CacheManager();

// Utility functions for common cache operations
export const cacheTranslation = (original: string, translation: string) => {
  const key = `${STORAGE_KEYS.CACHE}/translation/${original.toLowerCase()}`;
  return cache.set(key, translation, { expiry: API_CONFIG.CACHE_EXPIRY });
};

export const getCachedTranslation = (original: string): Promise<string | null> => {
  const key = `${STORAGE_KEYS.CACHE}/translation/${original.toLowerCase()}`;
  return cache.get<string>(key);
};

export const cacheAudioData = (text: string, audioData: string) => {
  const key = `${STORAGE_KEYS.CACHE}/audio/${text.toLowerCase()}`;
  return cache.set(key, audioData, { expiry: API_CONFIG.CACHE_EXPIRY });
};

export const getCachedAudioData = (text: string): Promise<string | null> => {
  const key = `${STORAGE_KEYS.CACHE}/audio/${text.toLowerCase()}`;
  return cache.get<string>(key);
};

// Initialize cache cleanup on app start
export const initializeCache = async () => {
  try {
    await cache.cleanup();
    console.log('Cache initialized and cleaned up');
  } catch (error) {
    console.warn('Cache initialization error:', error);
  }
};
