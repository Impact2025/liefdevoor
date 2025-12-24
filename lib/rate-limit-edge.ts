/**
 * Edge-Compatible Rate Limiting for Middleware
 *
 * Uses @upstash/ratelimit which works on Edge runtime (REST API, no Node.js deps)
 * For middleware only - API routes can use the regular redis-rate-limit.ts
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Rate limit result type
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetIn: number
}

// Create Upstash Redis client (Edge-compatible REST API)
function getUpstashRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  return new Redis({ url, token })
}

// In-memory fallback for development (no Redis)
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const entry = inMemoryStore.get(key)

  if (!entry || now > entry.resetTime) {
    inMemoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, limit, remaining: limit - 1, resetIn: windowMs }
  }

  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  entry.count++
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetIn: entry.resetTime - now,
  }
}

// Create rate limiters using Upstash (or in-memory fallback)
const redis = getUpstashRedis()

// Different rate limiters for different purposes
const createLimiter = (requests: number, window: string) => {
  if (!redis) {
    // Return in-memory rate limiter function
    const windowMs =
      window === '1m'
        ? 60 * 1000
        : window === '10s'
        ? 10 * 1000
        : window === '1h'
        ? 60 * 60 * 1000
        : 60 * 1000

    return {
      limit: async (key: string): Promise<RateLimitResult> => {
        return inMemoryRateLimit(key, requests, windowMs)
      },
    }
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: 'ratelimit:edge',
  })
}

// Pre-configured rate limiters
const apiLimiter = createLimiter(100, '1m') // 100 req/min for general API
const authLimiter = createLimiter(5, '1m') // 5 req/min for auth
const aiLimiter = createLimiter(10, '1m') // 10 req/min for AI endpoints
const sensitiveLimiter = createLimiter(30, '1m') // 30 req/min for swipes etc
const reportLimiter = createLimiter(3, '1h') // 3 reports/hour

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')

  const ip = cfIp || realIp || forwarded?.split(',')[0]?.trim() || 'anonymous'
  return ip
}

// Main rate limit function
async function rateLimit(
  request: NextRequest,
  limiter: typeof apiLimiter
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request)

  try {
    const result = await limiter.limit(identifier)

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetIn: result.reset - Date.now(),
    }
  } catch (error) {
    console.error('[EdgeRateLimit] Error:', error)
    // Allow request on error (fail open)
    return { success: true, limit: 100, remaining: 99, resetIn: 60000 }
  }
}

// Exported rate limiters for middleware
export const rateLimiters = {
  api: (req: NextRequest) => rateLimit(req, apiLimiter),
  auth: (req: NextRequest) => rateLimit(req, authLimiter),
  ai: (req: NextRequest) => rateLimit(req, aiLimiter),
  sensitive: (req: NextRequest) => rateLimit(req, sensitiveLimiter),
  report: (req: NextRequest) => rateLimit(req, reportLimiter),
}

// Response for rate limit exceeded
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: 'Je hebt te veel verzoeken gedaan. Probeer het later opnieuw.',
      retryAfter: Math.ceil(result.resetIn / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(result.resetIn / 1000)),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': new Date(Date.now() + result.resetIn).toISOString(),
      },
    }
  )
}
