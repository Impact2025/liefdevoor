/**
 * Rate Limiting with Upstash Redis (Serverless-friendly)
 *
 * Uses HTTP-based Upstash Redis for rate limiting.
 * No connection limits - perfect for Vercel serverless!
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUpstash, cacheKeys, CACHE_TTL } from './upstash'

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
 * Rate limit using Upstash Redis (with in-memory fallback for dev)
 */
export async function rateLimit(
  request: NextRequest,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = config
  const clientIP = getClientIdentifier(request)
  const key = `${keyPrefix}:${identifier}:${clientIP}`
  const windowSeconds = Math.ceil(windowMs / 1000)
  const now = Date.now()

  const redis = getUpstash()

  if (redis) {
    return rateLimitWithUpstash(redis, key, windowSeconds, maxRequests)
  } else {
    // Fallback to memory store in development
    if (process.env.NODE_ENV === 'production') {
      console.warn('[RateLimit] Upstash not available in production!')
    }
    return rateLimitWithMemory(key, windowMs, maxRequests, now)
  }
}

/**
 * Upstash-based rate limiting using simple counter
 */
async function rateLimitWithUpstash(
  redis: ReturnType<typeof getUpstash>,
  key: string,
  windowSeconds: number,
  maxRequests: number
): Promise<RateLimitResult> {
  if (!redis) {
    return { success: true, remaining: maxRequests, resetIn: windowSeconds * 1000 }
  }

  try {
    // Increment counter
    const count = await redis.incr(key)

    // Set expiry on first request
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }

    // Get TTL for reset time
    const ttl = await redis.ttl(key)
    const resetIn = ttl > 0 ? ttl * 1000 : windowSeconds * 1000

    if (count > maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetIn,
        retryAfter: Math.ceil(resetIn / 1000)
      }
    }

    return {
      success: true,
      remaining: Math.max(0, maxRequests - count),
      resetIn
    }
  } catch (error) {
    console.error('[RateLimit] Upstash error:', error)
    // Allow request on error to prevent blocking legitimate users
    return { success: true, remaining: maxRequests, resetIn: windowSeconds * 1000 }
  }
}

/**
 * In-memory rate limiting (fallback for development)
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

  // Email Verification: 10 attempts per hour
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
