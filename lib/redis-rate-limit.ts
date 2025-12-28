/**
 * Redis-Compatible Rate Limiting
 *
 * This module provides rate limiting that works with Redis in production
 * and falls back to in-memory storage in development.
 *
 * To use Redis in production:
 * 1. npm install ioredis
 * 2. Set REDIS_URL in .env
 */

import { NextRequest, NextResponse } from 'next/server'

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
  keyPrefix?: string    // Redis key prefix
}

// Rate limit result
export interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number
  retryAfter?: number
}

// In-memory store (fallback when Redis is not available)
const memoryStore = new Map<string, { count: number; resetTime: number }>()

// Redis client (lazy loaded)
let redisClient: any = null
let redisAvailable: boolean | null = null

/**
 * Initialize Redis client if REDIS_URL is set
 * SECURITY: In production, Redis is REQUIRED - no fallback to memory store
 */
async function getRedisClient(): Promise<any> {
  if (redisAvailable === false) {
    // In production, throw error instead of silently falling back
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[RateLimit] Redis is required in production but not available')
    }
    return null
  }
  if (redisClient) return redisClient

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    // SECURITY: Production REQUIRES Redis - no silent fallback
    if (process.env.NODE_ENV === 'production') {
      redisAvailable = false
      throw new Error('[RateLimit] REDIS_URL must be set in production - in-memory rate limiting is NOT secure for distributed systems')
    }
    redisAvailable = false
    console.warn('[RateLimit] Development mode: using in-memory store (NOT for production)')
    return null
  }

  try {
    // Dynamic import to avoid issues if ioredis is not installed
    const Redis = (await import('ioredis')).default
    // @ts-ignore - ioredis accepts URL string as first argument
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          // After 3 retries, throw error in production
          if (process.env.NODE_ENV === 'production') {
            throw new Error('[RateLimit] Redis connection failed after 3 retries')
          }
          return null // Stop retrying in dev
        }
        return Math.min(times * 200, 2000) // Exponential backoff
      },
    })

    await redisClient.ping()
    redisAvailable = true
    console.log('[RateLimit] Connected to Redis successfully')
    return redisClient
  } catch (error) {
    redisAvailable = false
    // SECURITY: In production, fail hard - don't allow unprotected requests
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[RateLimit] Redis connection failed in production: ${(error as Error).message}`)
    }
    console.warn('[RateLimit] Development mode: Redis not available, using in-memory store:', (error as Error).message)
    return null
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip') // Cloudflare

  if (cfIP) return cfIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP

  return 'unknown'
}

/**
 * Rate limit using Redis (with in-memory fallback)
 */
export async function rateLimit(
  request: NextRequest,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = config
  const clientIP = getClientIdentifier(request)
  const key = `${keyPrefix}:${identifier}:${clientIP}`
  const now = Date.now()

  const redis = await getRedisClient()

  if (redis) {
    return rateLimitWithRedis(redis, key, windowMs, maxRequests, now)
  } else {
    return rateLimitWithMemory(key, windowMs, maxRequests, now)
  }
}

/**
 * Redis-based rate limiting using sliding window
 */
async function rateLimitWithRedis(
  redis: any,
  key: string,
  windowMs: number,
  maxRequests: number,
  now: number
): Promise<RateLimitResult> {
  const windowStart = now - windowMs

  // Use Redis transaction for atomic operations
  const multi = redis.multi()

  // Remove old entries outside the window
  multi.zremrangebyscore(key, 0, windowStart)

  // Count current requests in window
  multi.zcard(key)

  // Add current request
  multi.zadd(key, now, `${now}-${Math.random()}`)

  // Set expiry on the key
  multi.pexpire(key, windowMs)

  const results = await multi.exec()
  const currentCount = results[1][1] as number

  if (currentCount >= maxRequests) {
    // Get oldest entry to calculate retry time
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES')
    const oldestTime = oldest.length > 1 ? parseInt(oldest[1]) : now
    const resetIn = Math.max(0, oldestTime + windowMs - now)

    return {
      success: false,
      remaining: 0,
      resetIn,
      retryAfter: Math.ceil(resetIn / 1000)
    }
  }

  return {
    success: true,
    remaining: maxRequests - currentCount - 1,
    resetIn: windowMs
  }
}

/**
 * In-memory rate limiting (fallback)
 */
function rateLimitWithMemory(
  key: string,
  windowMs: number,
  maxRequests: number,
  now: number
): RateLimitResult {
  const entry = memoryStore.get(key)

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    cleanupMemoryStore(now)
  }

  if (!entry || now > entry.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return {
      success: true,
      remaining: maxRequests - 1,
      resetIn: windowMs
    }
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    }
  }

  entry.count++
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now
  }
}

/**
 * Cleanup expired entries from memory store
 */
function cleanupMemoryStore(now: number): void {
  const entries = Array.from(memoryStore.entries())
  entries.forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      memoryStore.delete(key)
    }
  })
}

// Pre-configured rate limiters
export const rateLimiters = {
  // Authentication: 5 requests per 15 minutes
  auth: (request: NextRequest) =>
    rateLimit(request, 'auth', { maxRequests: 5, windowMs: 15 * 60 * 1000 }),

  // Registration: 3 requests per 10 minutes
  register: (request: NextRequest) =>
    rateLimit(request, 'register', { maxRequests: 3, windowMs: 10 * 60 * 1000 }),

  // Email Verification: 10 attempts per hour (protect against brute force)
  emailVerify: (request: NextRequest) =>
    rateLimit(request, 'email-verify', { maxRequests: 10, windowMs: 60 * 60 * 1000 }),

  // API general: 100 requests per minute
  api: (request: NextRequest) =>
    rateLimit(request, 'api', { maxRequests: 100, windowMs: 60 * 1000 }),

  // Sensitive actions: 10 requests per minute
  sensitive: (request: NextRequest) =>
    rateLimit(request, 'sensitive', { maxRequests: 10, windowMs: 60 * 1000 }),

  // Reports: 5 reports per hour
  report: (request: NextRequest) =>
    rateLimit(request, 'report', { maxRequests: 5, windowMs: 60 * 60 * 1000 }),

  // AI/Icebreaker: 20 requests per hour
  ai: (request: NextRequest) =>
    rateLimit(request, 'ai', { maxRequests: 20, windowMs: 60 * 60 * 1000 }),
}

/**
 * Create rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Te veel verzoeken. Probeer het later opnieuw.',
      retryAfter: result.retryAfter
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': new Date(Date.now() + result.resetIn).toISOString()
      }
    }
  )
}
