/**
 * Migration Campaign Cache Management
 * Redis caching for dashboard stats and metrics
 */

import { redis } from '@/lib/redis'

const CACHE_KEYS = {
  DASHBOARD_STATS: 'migration:dashboard:stats',
  EMAIL_METRICS: 'migration:email:metrics',
  SEGMENT_STATS: 'migration:segment:stats',
  FUNNEL: 'migration:funnel',
  AB_RESULTS: 'migration:ab:results'
} as const

const CACHE_TTL = {
  DASHBOARD_STATS: 60,    // 60 seconds
  EMAIL_METRICS: 120,     // 2 minutes
  SEGMENT_STATS: 60,      // 60 seconds
  FUNNEL: 60,             // 60 seconds
  AB_RESULTS: 300         // 5 minutes
} as const

/**
 * Get cached data or execute function and cache result
 */
export async function getCached<T>(
  key: keyof typeof CACHE_KEYS,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheKey = CACHE_KEYS[key]
  const ttl = CACHE_TTL[key]

  try {
    // Try to get from cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached) as T
    }

    // Cache miss - fetch data
    const data = await fetchFn()

    // Store in cache
    await redis.setex(cacheKey, ttl, JSON.stringify(data))

    return data
  } catch (error) {
    console.error('[Cache] Error:', error)
    // Fallback to direct fetch if Redis fails
    return fetchFn()
  }
}

/**
 * Invalidate specific cache keys
 */
export async function invalidateMigrationCache(keys?: (keyof typeof CACHE_KEYS)[]): Promise<void> {
  const keysToInvalidate = keys
    ? keys.map(k => CACHE_KEYS[k])
    : Object.values(CACHE_KEYS)

  try {
    await Promise.all(
      keysToInvalidate.map(key => redis.del(key))
    )
    console.log(`[Cache] Invalidated ${keysToInvalidate.length} keys`)
  } catch (error) {
    console.error('[Cache] Failed to invalidate:', error)
  }
}

/**
 * Invalidate cache after important events
 */
export async function onUserClaimed(): Promise<void> {
  await invalidateMigrationCache(['DASHBOARD_STATS', 'FUNNEL', 'SEGMENT_STATS'])
}

export async function onEmailSent(): Promise<void> {
  await invalidateMigrationCache(['EMAIL_METRICS', 'DASHBOARD_STATS'])
}

export async function onEmailOpened(): Promise<void> {
  await invalidateMigrationCache(['EMAIL_METRICS', 'FUNNEL'])
}
