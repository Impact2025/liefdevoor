/**
 * Edge-Compatible Rate Limiting for Middleware
 *
 * Pure in-memory rate limiting that works on Edge runtime.
 * For production with distributed rate limiting, use API routes with redis-rate-limit.ts
 *
 * Note: In-memory rate limiting is per-instance, so it won't work perfectly
 * in a distributed environment. For critical rate limiting (auth, payments),
 * use API routes with Redis-based rate limiting instead.
 */

import { NextRequest, NextResponse } from 'next/server'

// Rate limit result type
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetIn: number
}

// In-memory store for rate limiting (per Edge function instance)
const store = new Map<string, { count: number; resetTime: number }>()

// Cleanup old entries periodically
function cleanup() {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key)
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 60 * 1000)
}

/**
 * Simple sliding window rate limiter
 */
function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = store.get(key)

  // New window or expired
  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetIn: windowMs,
    }
  }

  // Within window, check limit
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  // Increment count
  entry.count++
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    resetIn: entry.resetTime - now,
  }
}

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')

  const ip = cfIp || realIp || forwarded?.split(',')[0]?.trim() || 'anonymous'
  return ip
}

// Rate limit configurations (requests per minute unless specified)
const LIMITS = {
  api: { requests: 100, windowMs: 60 * 1000 },      // 100 req/min
  auth: { requests: 5, windowMs: 60 * 1000 },       // 5 req/min
  ai: { requests: 10, windowMs: 60 * 1000 },        // 10 req/min
  sensitive: { requests: 30, windowMs: 60 * 1000 }, // 30 req/min
  report: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 req/hour
}

// Exported rate limiters for middleware
export const rateLimiters = {
  api: (req: NextRequest) => {
    const id = `api:${getClientIdentifier(req)}`
    return Promise.resolve(rateLimit(id, LIMITS.api.requests, LIMITS.api.windowMs))
  },
  auth: (req: NextRequest) => {
    const id = `auth:${getClientIdentifier(req)}`
    return Promise.resolve(rateLimit(id, LIMITS.auth.requests, LIMITS.auth.windowMs))
  },
  ai: (req: NextRequest) => {
    const id = `ai:${getClientIdentifier(req)}`
    return Promise.resolve(rateLimit(id, LIMITS.ai.requests, LIMITS.ai.windowMs))
  },
  sensitive: (req: NextRequest) => {
    const id = `sensitive:${getClientIdentifier(req)}`
    return Promise.resolve(rateLimit(id, LIMITS.sensitive.requests, LIMITS.sensitive.windowMs))
  },
  report: (req: NextRequest) => {
    const id = `report:${getClientIdentifier(req)}`
    return Promise.resolve(rateLimit(id, LIMITS.report.requests, LIMITS.report.windowMs))
  },
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
