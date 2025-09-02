/**
 * Cache service for restock recommendations
 * Improves performance by caching AI responses and avoiding redundant API calls
 */

const CACHE_PREFIX = 'restock_cache_';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export class CacheService {
  /**
   * Generate a cache key for a product
   */
  static getCacheKey(product) {
    return `${CACHE_PREFIX}${product.id}_${product.stock}_${product.name}`;
  }

  /**
   * Get cached recommendation for a product
   */
  static getCachedRecommendation(product) {
    try {
      const cacheKey = this.getCacheKey(product);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return data.recommendation;
    } catch (error) {
      console.warn('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Cache a recommendation for a product
   */
  static setCachedRecommendation(product, recommendation) {
    try {
      const cacheKey = this.getCacheKey(product);
      const data = {
        timestamp: Date.now(),
        recommendation
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Error writing to cache:', error);
    }
  }

  /**
   * Clear all cached recommendations
   */
  static clearCache() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const validCaches = [];
      const expiredCaches = [];
      const now = Date.now();
      
      cacheKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (now - data.timestamp > CACHE_DURATION) {
            expiredCaches.push(key);
          } else {
            validCaches.push(key);
          }
        } catch {
          expiredCaches.push(key);
        }
      });
      
      // Clean up expired caches
      expiredCaches.forEach(key => localStorage.removeItem(key));
      
      return {
        totalCached: validCaches.length,
        expired: expiredCaches.length
      };
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return { totalCached: 0, expired: 0 };
    }
  }
}

/**
 * Debounce utility to prevent excessive API calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Batch processor for API calls with concurrency control
 */
export class BatchProcessor {
  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Process items in batches with controlled concurrency
   */
  async processBatch(items, processor) {
    const results = [];
    
    for (let i = 0; i < items.length; i += this.maxConcurrency) {
      const batch = items.slice(i, i + this.maxConcurrency);
      const promises = batch.map(async (item, index) => {
        try {
          const result = await processor(item);
          return { success: true, data: result, originalIndex: i + index };
        } catch (error) {
          return { success: false, error, originalIndex: i + index };
        }
      });
      
      const batchResults = await Promise.allSettled(promises);
      results.push(...batchResults.map(r => r.value || r.reason));
    }
    
    return results;
  }
}

export default CacheService;
