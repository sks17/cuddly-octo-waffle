/**
 * Background Generation Cache
 * 
 * Provides intelligent caching for generated backgrounds to avoid redundant computation.
 * Cache keys are deterministic and human-readable, derived from meaningful generation parameters.
 */

import type { BackgroundConfig } from './backgroundState';

const CACHE_STORAGE_KEY = 'background-generation-cache';
const CACHE_VERSION = '1.0';
const MAX_CACHE_ENTRIES = 50; // Prevent unlimited growth

export interface CacheEntry {
  key: string;
  config: BackgroundConfig;
  backgroundUrl: string;
  timestamp: number;
  version: string;
}

export interface BackgroundCache {
  version: string;
  entries: Record<string, CacheEntry>;
  lastCleanup: number;
}

/**
 * Generate a deterministic, human-readable cache key from configuration
 */
export function generateCacheKey(config: BackgroundConfig): string {
  // Normalize numeric values to avoid floating point precision issues
  const normalizeNumber = (num: number, precision = 3) => 
    Number(num.toFixed(precision));

  const parts = [
    `hue-${config.hue}`,
    `pattern-${config.pattern}`,
    `det-${config.use_determinant ? 'on' : 'off'}`,
    `max-${config.use_max ? 'on' : 'off'}`,
    `feather-${config.feathered ? 'on' : 'off'}`,
    `cells-${config.cell_size}x${config.matrix_size}`,
    `norm-${normalizeNumber(config.normalizer)}`,
    `bright-${normalizeNumber(config.brightness_low)}-${normalizeNumber(config.brightness_high)}`,
    `blur-${normalizeNumber(config.blur_sigma)}`,
    `vignette-${normalizeNumber(config.vignette_strength)}`,
    `gap-${config.gap_cells}`
  ];

  return parts.join('_');
}

/**
 * Generate human-readable description from cache key
 */
export function describeCacheKey(key: string): string {
  const parts = key.split('_');
  const descriptions: string[] = [];

  parts.forEach(part => {
    const [type, value] = part.split('-');
    switch (type) {
      case 'hue':
        descriptions.push(`${value} theme`);
        break;
      case 'pattern':
        descriptions.push(`${value} pattern`);
        break;
      case 'cells':
        descriptions.push(`${value} cells`);
        break;
      case 'blur':
        if (parseFloat(value) > 0) descriptions.push(`blur ${value}`);
        break;
      case 'vignette':
        if (parseFloat(value) > 0) descriptions.push(`vignette ${value}`);
        break;
    }
  });

  return descriptions.join(', ') || 'custom background';
}

/**
 * Load cache from localStorage
 */
function loadCache(): BackgroundCache {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (stored) {
      const cache = JSON.parse(stored) as BackgroundCache;
      
      // Validate cache version
      if (cache.version === CACHE_VERSION) {
        return cache;
      } else {
        console.log('🗄️ Background cache: Version mismatch, clearing old cache');
      }
    }
  } catch (error) {
    console.warn('🗄️ Background cache: Failed to load from storage:', error);
  }

  // Return empty cache
  return {
    version: CACHE_VERSION,
    entries: {},
    lastCleanup: Date.now()
  };
}

/**
 * Save cache to localStorage
 */
function saveCache(cache: BackgroundCache): void {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('🗄️ Background cache: Failed to save to storage:', error);
  }
}

/**
 * Clean up old cache entries and invalid URLs
 */
function cleanupCache(cache: BackgroundCache): BackgroundCache {
  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  
  // Only cleanup once per day
  if (now - cache.lastCleanup < 24 * 60 * 60 * 1000) {
    return cache;
  }

  console.log('🗄️ Background cache: Running cleanup...');
  
  const entries = { ...cache.entries };
  let removedCount = 0;
  
  // Remove entries older than 1 week OR with invalid development/blob URLs
  Object.keys(entries).forEach(key => {
    const entry = entries[key];
    const isExpired = now - entry.timestamp > ONE_WEEK;
    const hasDevUrl = entry.backgroundUrl.includes('localhost:5000') || entry.backgroundUrl.includes('127.0.0.1:5000');
    const isBlobUrl = entry.backgroundUrl.startsWith('blob:');
    
    if (isExpired || hasDevUrl || isBlobUrl) {
      delete entries[key];
      removedCount++;
      if (hasDevUrl) {
        console.log(`🗄️ Background cache: Removed development URL entry "${key}"`);
      } else if (isBlobUrl) {
        console.log(`🗄️ Background cache: Removed invalid blob URL entry "${key}"`);
      }
    }
  });
  
  // If still over limit, remove oldest entries
  const sortedEntries = Object.entries(entries)
    .sort(([,a], [,b]) => b.timestamp - a.timestamp);
  
  if (sortedEntries.length > MAX_CACHE_ENTRIES) {
    const toKeep = sortedEntries.slice(0, MAX_CACHE_ENTRIES);
    const newEntries: Record<string, CacheEntry> = {};
    toKeep.forEach(([key, entry]) => {
      newEntries[key] = entry;
    });
    removedCount += sortedEntries.length - MAX_CACHE_ENTRIES;
    Object.assign(entries, newEntries);
  }

  if (removedCount > 0) {
    console.log(`🗄️ Background cache: Removed ${removedCount} old entries`);
  }

  return {
    ...cache,
    entries,
    lastCleanup: now
  };
}

/**
 * Get cached background URL if available and valid
 * Filters out blob URLs and development URLs that become invalid
 */
export function getCachedBackground(config: BackgroundConfig): string | null {
  const cache = loadCache();
  const key = generateCacheKey(config);
  const entry = cache.entries[key];
  
  if (entry) {
    // Invalidate cache entries with development URLs or blob URLs (both become invalid)
    const hasDevUrl = entry.backgroundUrl.includes('localhost:5000') || entry.backgroundUrl.includes('127.0.0.1:5000');
    const isBlobUrl = entry.backgroundUrl.startsWith('blob:');
    
    if (hasDevUrl || isBlobUrl) {
      const reason = hasDevUrl ? 'old development URL' : 'blob URL (invalid across sessions)';
      console.log(`🗄️ Background cache: Removing ${reason} entry "${describeCacheKey(key)}"`);
      delete cache.entries[key];
      saveCache(cache);
      return null;
    }
    
    console.log(`🗄️ Background cache: Hit for "${describeCacheKey(key)}"`);
    return entry.backgroundUrl;
  }
  
  return null;
}

/**
 * Store generated background in cache with validation
 * Blob URLs are not cached as they become invalid on page reload
 */
export function setCachedBackground(config: BackgroundConfig, backgroundUrl: string): void {
  // Don't cache blob URLs - they become invalid on page reload/session change
  if (backgroundUrl.startsWith('blob:')) {
    console.log('🚫 Background cache: Skipping blob URL (invalid across sessions)');
    return;
  }
  
  let cache = loadCache();
  cache = cleanupCache(cache);
  
  const key = generateCacheKey(config);
  const entry: CacheEntry = {
    key,
    config,
    backgroundUrl,
    timestamp: Date.now(),
    version: CACHE_VERSION
  };
  
  cache.entries[key] = entry;
  saveCache(cache);
  
  console.log(`🗄️ Background cache: Stored "${describeCacheKey(key)}"`);
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  totalEntries: number;
  oldestEntry: number | null;
  newestEntry: number | null;
  cacheSize: string;
} {
  const cache = loadCache();
  const entries = Object.values(cache.entries);
  
  const timestamps = entries.map(e => e.timestamp);
  const cacheSize = JSON.stringify(cache).length;
  
  return {
    totalEntries: entries.length,
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    cacheSize: `${(cacheSize / 1024).toFixed(2)} KB`
  };
}

/**
 * Clear stale blob URLs from cache (called on page load)
 * Blob URLs become invalid when the page reloads, so clean them up immediately
 */
export function clearStaleBlobUrls(): void {
  const cache = loadCache();
  let removedCount = 0;
  
  Object.keys(cache.entries).forEach(key => {
    const entry = cache.entries[key];
    if (entry.backgroundUrl.startsWith('blob:')) {
      delete cache.entries[key];
      removedCount++;
      console.log(`🗄️ Background cache: Removed stale blob URL entry "${key}"`);
    }
  });
  
  if (removedCount > 0) {
    saveCache(cache);
    console.log(`🗄️ Background cache: Cleaned up ${removedCount} stale blob URLs`);
  }
}

/**
 * Clear entire cache (for debugging)
 */
export function clearCache(): void {
  localStorage.removeItem(CACHE_STORAGE_KEY);
  console.log('🗄️ Background cache: Cleared all entries');
}

/**
 * List all cached backgrounds with their descriptions
 */
export function listCachedBackgrounds(): Array<{
  key: string;
  description: string;
  config: BackgroundConfig;
  timestamp: number;
  url: string;
}> {
  const cache = loadCache();
  
  return Object.values(cache.entries)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(entry => ({
      key: entry.key,
      description: describeCacheKey(entry.key),
      config: entry.config,
      timestamp: entry.timestamp,
      url: entry.backgroundUrl
    }));
}