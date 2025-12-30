/**
 * Upstash Redis Client - Serverless-friendly
 *
 * Uses HTTP-based REST API instead of TCP connections.
 * Perfect for Vercel serverless functions - no connection limits!
 */

import { Redis } from '@upstash/redis'

// Singleton Upstash client
let upstashClient: Redis | null = null

/**
 * Get Upstash Redis client instance
 */
export function getUpstash(): Redis | null {
  if (upstashClient) return upstashClient

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Upstash] Credentials not set')
    }
    return null
  }

  try {
    upstashClient = new Redis({
      url,
      token,
    })
    return upstashClient
  } catch (error) {
    console.error('[Upstash] Failed to create client:', error)
    return null
  }
}

// Export singleton instance
export const upstash = getUpstash()

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  USER_PROFILE: 300,      // 5 minutes
  USER_PREFERENCES: 600,  // 10 minutes
  MATCHES: 60,            // 1 minute
  DISCOVER: 30,           // 30 seconds
  SUBSCRIPTION: 300,      // 5 minutes
  PRESENCE: 30,           // 30 seconds
  RATE_LIMIT: 900,        // 15 minutes
} as const

/**
 * Cache get with automatic JSON parsing
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getUpstash()
  if (!client) return null

  try {
    const data = await client.get<T>(key)
    return data
  } catch (error) {
    console.error('[Upstash] Cache get error:', error)
    return null
  }
}

/**
 * Cache set with optional TTL
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
  const client = getUpstash()
  if (!client) return false

  try {
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, JSON.stringify(value))
    } else {
      await client.set(key, JSON.stringify(value))
    }
    return true
  } catch (error) {
    console.error('[Upstash] Cache set error:', error)
    return false
  }
}

/**
 * Cache delete
 */
export async function cacheDel(key: string): Promise<boolean> {
  const client = getUpstash()
  if (!client) return false

  try {
    await client.del(key)
    return true
  } catch (error) {
    console.error('[Upstash] Cache del error:', error)
    return false
  }
}

/**
 * Increment a counter (for rate limiting)
 */
export async function cacheIncr(key: string): Promise<number> {
  const client = getUpstash()
  if (!client) return 0

  try {
    return await client.incr(key)
  } catch (error) {
    console.error('[Upstash] Cache incr error:', error)
    return 0
  }
}

/**
 * Set expiry on a key
 */
export async function cacheExpire(key: string, ttlSeconds: number): Promise<boolean> {
  const client = getUpstash()
  if (!client) return false

  try {
    await client.expire(key, ttlSeconds)
    return true
  } catch (error) {
    console.error('[Upstash] Cache expire error:', error)
    return false
  }
}

/**
 * Get TTL of a key
 */
export async function cacheTTL(key: string): Promise<number> {
  const client = getUpstash()
  if (!client) return -1

  try {
    return await client.ttl(key)
  } catch (error) {
    console.error('[Upstash] Cache TTL error:', error)
    return -1
  }
}

// Cache key generators
export const cacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPreferences: (userId: string) => `user:prefs:${userId}`,
  userSubscription: (userId: string) => `user:sub:${userId}`,
  userMatches: (userId: string) => `user:matches:${userId}`,
  userPresence: (userId: string) => `user:presence:${userId}`,
  discover: (userId: string, page: number) => `discover:${userId}:${page}`,
  match: (matchId: string) => `match:${matchId}`,
  messages: (matchId: string, page: number) => `messages:${matchId}:${page}`,
  rateLimit: (prefix: string, identifier: string, ip: string) => `rl:${prefix}:${identifier}:${ip}`,
}
