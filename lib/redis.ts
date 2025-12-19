/**
 * Redis Client - Caching & Pub/Sub
 *
 * Provides Redis functionality for:
 * - Caching (user profiles, matches, messages)
 * - Pub/Sub (real-time notifications, typing indicators)
 * - Session storage
 */

import Redis from 'ioredis'

// Singleton Redis clients
let redis: Redis | null = null
let subscriber: Redis | null = null
let publisher: Redis | null = null

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  USER_PROFILE: 300,      // 5 minutes
  USER_PREFERENCES: 600,  // 10 minutes
  MATCHES: 60,            // 1 minute
  DISCOVER: 30,           // 30 seconds
  SUBSCRIPTION: 300,      // 5 minutes
  PRESENCE: 30,           // 30 seconds
} as const

/**
 * Get Redis client instance
 */
export function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env.REDIS_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Redis] REDIS_URL not set - caching disabled')
    }
    return null
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    })

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message)
    })

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully')
    })

    return redis
  } catch (error) {
    console.error('[Redis] Failed to create client:', error)
    return null
  }
}

/**
 * Get Redis Pub/Sub clients
 */
export function getPubSub(): { publisher: Redis | null; subscriber: Redis | null } {
  const url = process.env.REDIS_URL
  if (!url) return { publisher: null, subscriber: null }

  if (!publisher) {
    publisher = new Redis(url)
    publisher.on('error', (err) => console.error('[Redis Pub] Error:', err.message))
  }

  if (!subscriber) {
    subscriber = new Redis(url)
    subscriber.on('error', (err) => console.error('[Redis Sub] Error:', err.message))
  }

  return { publisher, subscriber }
}

// ============================================
// CACHING HELPERS
// ============================================

/**
 * Get cached value
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null

  try {
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('[Redis] Cache get error:', error)
    return null
  }
}

/**
 * Set cached value
 */
export async function cacheSet(key: string, value: any, ttl?: number): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  try {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await client.setex(key, ttl, serialized)
    } else {
      await client.set(key, serialized)
    }
    return true
  } catch (error) {
    console.error('[Redis] Cache set error:', error)
    return false
  }
}

/**
 * Delete cached value
 */
export async function cacheDel(key: string): Promise<boolean> {
  const client = getRedis()
  if (!client) return false

  try {
    await client.del(key)
    return true
  } catch (error) {
    console.error('[Redis] Cache del error:', error)
    return false
  }
}

/**
 * Delete multiple keys by pattern
 */
export async function cacheDelPattern(pattern: string): Promise<number> {
  const client = getRedis()
  if (!client) return 0

  try {
    const keys = await client.keys(pattern)
    if (keys.length === 0) return 0
    return await client.del(...keys)
  } catch (error) {
    console.error('[Redis] Cache del pattern error:', error)
    return 0
  }
}

// ============================================
// CACHE KEY GENERATORS
// ============================================

export const cacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPreferences: (userId: string) => `user:prefs:${userId}`,
  userSubscription: (userId: string) => `user:sub:${userId}`,
  userMatches: (userId: string) => `user:matches:${userId}`,
  userPresence: (userId: string) => `user:presence:${userId}`,
  discover: (userId: string, page: number) => `discover:${userId}:${page}`,
  match: (matchId: string) => `match:${matchId}`,
  messages: (matchId: string, page: number) => `messages:${matchId}:${page}`,
}

// ============================================
// PUB/SUB CHANNELS
// ============================================

export const channels = {
  userNotification: (userId: string) => `notify:${userId}`,
  chatRoom: (matchId: string) => `chat:${matchId}`,
  typing: (matchId: string) => `typing:${matchId}`,
  presence: () => 'presence:global',
  matches: () => 'matches:new',
}

// ============================================
// REAL-TIME MESSAGING
// ============================================

type MessageHandler = (message: any) => void

const subscriptions = new Map<string, Set<MessageHandler>>()

/**
 * Subscribe to a channel
 */
export async function subscribe(channel: string, handler: MessageHandler): Promise<() => void> {
  const { subscriber } = getPubSub()
  if (!subscriber) {
    console.warn('[Redis] Pub/Sub not available')
    return () => {}
  }

  // Add handler to local subscriptions
  if (!subscriptions.has(channel)) {
    subscriptions.set(channel, new Set())

    // Subscribe to Redis channel
    await subscriber.subscribe(channel)
  }

  subscriptions.get(channel)!.add(handler)

  // Set up message handler if not already done
  if (subscriber.listenerCount('message') === 0) {
    subscriber.on('message', (ch: string, message: string) => {
      const handlers = subscriptions.get(ch)
      if (handlers) {
        try {
          const parsed = JSON.parse(message)
          handlers.forEach((h) => h(parsed))
        } catch (error) {
          console.error('[Redis] Failed to parse message:', error)
        }
      }
    })
  }

  // Return unsubscribe function
  return () => {
    const handlers = subscriptions.get(channel)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        subscriptions.delete(channel)
        subscriber.unsubscribe(channel)
      }
    }
  }
}

/**
 * Publish to a channel
 */
export async function publish(channel: string, message: any): Promise<boolean> {
  const { publisher } = getPubSub()
  if (!publisher) return false

  try {
    await publisher.publish(channel, JSON.stringify(message))
    return true
  } catch (error) {
    console.error('[Redis] Publish error:', error)
    return false
  }
}

// ============================================
// PRESENCE TRACKING
// ============================================

/**
 * Set user as online
 */
export async function setUserOnline(userId: string): Promise<void> {
  const client = getRedis()
  if (!client) return

  const key = cacheKeys.userPresence(userId)
  await client.setex(key, CACHE_TTL.PRESENCE, JSON.stringify({
    online: true,
    lastSeen: new Date().toISOString(),
  }))

  // Publish presence update
  await publish(channels.presence(), { userId, online: true })
}

/**
 * Set user as offline
 */
export async function setUserOffline(userId: string): Promise<void> {
  const client = getRedis()
  if (!client) return

  const key = cacheKeys.userPresence(userId)
  await client.setex(key, CACHE_TTL.PRESENCE * 10, JSON.stringify({
    online: false,
    lastSeen: new Date().toISOString(),
  }))

  // Publish presence update
  await publish(channels.presence(), { userId, online: false })
}

/**
 * Check if user is online
 */
export async function isUserOnline(userId: string): Promise<boolean> {
  const presence = await cacheGet<{ online: boolean }>(cacheKeys.userPresence(userId))
  return presence?.online ?? false
}

/**
 * Get multiple users' online status
 */
export async function getUsersOnlineStatus(userIds: string[]): Promise<Map<string, boolean>> {
  const client = getRedis()
  const result = new Map<string, boolean>()

  if (!client || userIds.length === 0) {
    userIds.forEach((id) => result.set(id, false))
    return result
  }

  try {
    const keys = userIds.map((id) => cacheKeys.userPresence(id))
    const values = await client.mget(...keys)

    userIds.forEach((id, index) => {
      const data = values[index]
      if (data) {
        try {
          const parsed = JSON.parse(data)
          result.set(id, parsed.online ?? false)
        } catch {
          result.set(id, false)
        }
      } else {
        result.set(id, false)
      }
    })
  } catch (error) {
    console.error('[Redis] Get users online status error:', error)
    userIds.forEach((id) => result.set(id, false))
  }

  return result
}
