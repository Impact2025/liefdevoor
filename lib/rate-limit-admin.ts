/**
 * Admin Rate Limiting System
 *
 * Redis-based rate limiting voor admin endpoints
 * Voorkomt abuse en beschermt tegen admin account compromise
 */

import { getRedis } from './redis'

/**
 * Rate limit config per action type
 */
export const ADMIN_RATE_LIMITS = {
  // User management
  user_action: { max: 100, windowSeconds: 3600 }, // 100 user actions per hour
  bulk_user_action: { max: 10, windowSeconds: 3600 }, // 10 bulk actions per hour

  // Content moderation
  report_action: { max: 200, windowSeconds: 3600 }, // 200 report actions per hour
  verification_action: { max: 150, windowSeconds: 3600 }, // 150 verification actions per hour

  // Data operations
  export: { max: 5, windowSeconds: 3600 }, // 5 exports per hour (expensive)
  bulk_export: { max: 2, windowSeconds: 3600 }, // 2 bulk exports per hour

  // Email operations
  email_test: { max: 20, windowSeconds: 3600 }, // 20 test emails per hour
  email_broadcast: { max: 5, windowSeconds: 86400 }, // 5 broadcasts per day

  // Blog & content
  blog_create: { max: 20, windowSeconds: 3600 }, // 20 posts per hour
  blog_update: { max: 50, windowSeconds: 3600 }, // 50 updates per hour
  blog_delete: { max: 10, windowSeconds: 3600 }, // 10 deletions per hour

  // Coupon management
  coupon_create: { max: 30, windowSeconds: 3600 }, // 30 coupons per hour
  coupon_update: { max: 100, windowSeconds: 3600 }, // 100 updates per hour

  // General API calls
  api_call: { max: 1000, windowSeconds: 3600 }, // 1000 general calls per hour
} as const

export type AdminRateLimitAction = keyof typeof ADMIN_RATE_LIMITS

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number // Seconds until reset
  limit: number
}

/**
 * In-memory fallback voor development (Redis niet altijd beschikbaar)
 */
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

function cleanupInMemory() {
  const now = Date.now()
  for (const [key, value] of inMemoryStore.entries()) {
    if (now > value.resetTime) {
      inMemoryStore.delete(key)
    }
  }
}

// Cleanup every 5 minutes
if (process.env.NODE_ENV === 'development') {
  setInterval(cleanupInMemory, 5 * 60 * 1000)
}

/**
 * Check admin rate limit
 *
 * @param adminId - Admin user ID
 * @param action - Action type being performed
 * @param customMax - Optional custom max (overrides default)
 * @param customWindowSeconds - Optional custom window (overrides default)
 * @returns Rate limit result
 */
export async function checkAdminRateLimit(
  adminId: string,
  action: AdminRateLimitAction | string,
  customMax?: number,
  customWindowSeconds?: number
): Promise<RateLimitResult> {
  const config = ADMIN_RATE_LIMITS[action as AdminRateLimitAction]
  const maxAttempts = customMax ?? config?.max ?? 100
  const windowSeconds = customWindowSeconds ?? config?.windowSeconds ?? 3600

  const key = `admin:ratelimit:${adminId}:${action}`

  try {
    const redis = getRedis()

    if (redis && process.env.NODE_ENV === 'production') {
      // Use Redis in production
      const current = await redis.incr(key)

      if (current === 1) {
        // First request - set expiration
        await redis.expire(key, windowSeconds)
      }

      const ttl = await redis.ttl(key)
      const remaining = Math.max(0, maxAttempts - current)

      return {
        allowed: current <= maxAttempts,
        remaining,
        resetIn: ttl > 0 ? ttl : windowSeconds,
        limit: maxAttempts
      }
    } else {
      // Fallback to in-memory (development only)
      const now = Date.now()
      const resetTime = now + (windowSeconds * 1000)
      const existing = inMemoryStore.get(key)

      if (!existing || now > existing.resetTime) {
        // New or expired entry
        inMemoryStore.set(key, { count: 1, resetTime })
        return {
          allowed: true,
          remaining: maxAttempts - 1,
          resetIn: windowSeconds,
          limit: maxAttempts
        }
      }

      existing.count++
      const remaining = Math.max(0, maxAttempts - existing.count)
      const resetIn = Math.floor((existing.resetTime - now) / 1000)

      return {
        allowed: existing.count <= maxAttempts,
        remaining,
        resetIn,
        limit: maxAttempts
      }
    }
  } catch (error) {
    console.error('[RateLimit] Error checking admin rate limit:', error)

    // Fail open (allow request) bij errors om admin niet te blokkeren
    // maar log het voor monitoring
    console.warn('[RateLimit] Allowing request due to error (fail-open)')

    return {
      allowed: true,
      remaining: maxAttempts,
      resetIn: windowSeconds,
      limit: maxAttempts
    }
  }
}

/**
 * Reset rate limit voor een specifieke admin + action
 * Gebruik voor testing of als admin onterecht gelimiteerd is
 */
export async function resetAdminRateLimit(
  adminId: string,
  action: AdminRateLimitAction | string
): Promise<void> {
  const key = `admin:ratelimit:${adminId}:${action}`

  try {
    const redis = getRedis()

    if (redis) {
      await redis.del(key)
    } else {
      inMemoryStore.delete(key)
    }

    console.log(`[RateLimit] Reset limit for ${adminId}:${action}`)
  } catch (error) {
    console.error('[RateLimit] Error resetting rate limit:', error)
  }
}

/**
 * Get current rate limit status (zonder te incrementen)
 */
export async function getAdminRateLimitStatus(
  adminId: string,
  action: AdminRateLimitAction | string
): Promise<RateLimitResult | null> {
  const config = ADMIN_RATE_LIMITS[action as AdminRateLimitAction]
  const maxAttempts = config?.max ?? 100
  const windowSeconds = config?.windowSeconds ?? 3600

  const key = `admin:ratelimit:${adminId}:${action}`

  try {
    const redis = getRedis()

    if (redis && process.env.NODE_ENV === 'production') {
      const current = await redis.get(key)
      const count = current ? parseInt(current, 10) : 0
      const ttl = await redis.ttl(key)

      return {
        allowed: count < maxAttempts,
        remaining: Math.max(0, maxAttempts - count),
        resetIn: ttl > 0 ? ttl : windowSeconds,
        limit: maxAttempts
      }
    } else {
      const existing = inMemoryStore.get(key)

      if (!existing) {
        return {
          allowed: true,
          remaining: maxAttempts,
          resetIn: windowSeconds,
          limit: maxAttempts
        }
      }

      const now = Date.now()
      const resetIn = Math.floor((existing.resetTime - now) / 1000)

      return {
        allowed: existing.count < maxAttempts,
        remaining: Math.max(0, maxAttempts - existing.count),
        resetIn,
        limit: maxAttempts
      }
    }
  } catch (error) {
    console.error('[RateLimit] Error getting rate limit status:', error)
    return null
  }
}

/**
 * Middleware helper voor API routes
 * Throws error als rate limit exceeded
 */
export async function requireAdminRateLimit(
  adminId: string,
  action: AdminRateLimitAction | string
): Promise<void> {
  const result = await checkAdminRateLimit(adminId, action)

  if (!result.allowed) {
    const error = new Error(
      `Rate limit exceeded for ${action}. Try again in ${result.resetIn} seconds.`
    )
    ;(error as any).statusCode = 429
    ;(error as any).resetIn = result.resetIn
    ;(error as any).limit = result.limit
    throw error
  }
}

/**
 * Helper voor NextResponse rate limit error
 */
export function rateLimitErrorResponse(result: RateLimitResult) {
  return {
    error: 'RATE_LIMIT_EXCEEDED',
    message: `Too many requests. Try again in ${result.resetIn} seconds.`,
    resetIn: result.resetIn,
    limit: result.limit,
    remaining: result.remaining
  }
}
