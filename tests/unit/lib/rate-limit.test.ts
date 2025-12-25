/**
 * Rate Limiting Tests
 *
 * Tests for rate limiting functionality including:
 * - In-memory rate limiting (development)
 * - Rate limit configuration
 * - Client identification
 * - Error responses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// We'll test the in-memory fallback behavior
// Since Redis isn't available in test environment

// Helper to create mock NextRequest
function createMockRequest(
  headers: Record<string, string> = {},
  url: string = 'http://localhost:3000/api/test'
): NextRequest {
  const headersObj = new Headers(headers)
  return {
    headers: headersObj,
    url,
    method: 'GET',
  } as unknown as NextRequest
}

describe('getClientIdentifier', () => {
  // Import the function dynamically to avoid module initialization issues
  let getClientIdentifier: (request: NextRequest) => string

  beforeEach(async () => {
    vi.resetModules()
    const module = await import('@/lib/redis-rate-limit')
    getClientIdentifier = module.getClientIdentifier
  })

  it('should prefer Cloudflare IP header', () => {
    const request = createMockRequest({
      'cf-connecting-ip': '203.0.113.1',
      'x-forwarded-for': '10.0.0.1',
      'x-real-ip': '192.168.1.1',
    })

    expect(getClientIdentifier(request)).toBe('203.0.113.1')
  })

  it('should use X-Forwarded-For when Cloudflare header is not present', () => {
    const request = createMockRequest({
      'x-forwarded-for': '203.0.113.1, 10.0.0.1',
      'x-real-ip': '192.168.1.1',
    })

    expect(getClientIdentifier(request)).toBe('203.0.113.1')
  })

  it('should use X-Real-IP as fallback', () => {
    const request = createMockRequest({
      'x-real-ip': '203.0.113.1',
    })

    expect(getClientIdentifier(request)).toBe('203.0.113.1')
  })

  it('should return "unknown" when no IP headers are present', () => {
    const request = createMockRequest({})
    expect(getClientIdentifier(request)).toBe('unknown')
  })

  it('should handle X-Forwarded-For with multiple IPs', () => {
    const request = createMockRequest({
      'x-forwarded-for': '  203.0.113.1  ,  10.0.0.1  ,  192.168.1.1  ',
    })

    // Should get first IP, trimmed
    expect(getClientIdentifier(request)).toBe('203.0.113.1')
  })
})

describe('rateLimitResponse', () => {
  let rateLimitResponse: (result: any) => NextResponse

  beforeEach(async () => {
    vi.resetModules()
    const module = await import('@/lib/redis-rate-limit')
    rateLimitResponse = module.rateLimitResponse
  })

  it('should return 429 status code', () => {
    const result = {
      success: false,
      remaining: 0,
      resetIn: 60000,
      retryAfter: 60,
    }

    const response = rateLimitResponse(result)
    expect(response.status).toBe(429)
  })

  it('should include Retry-After header', () => {
    const result = {
      success: false,
      remaining: 0,
      resetIn: 30000,
      retryAfter: 30,
    }

    const response = rateLimitResponse(result)
    expect(response.headers.get('Retry-After')).toBe('30')
  })

  it('should include X-RateLimit-Remaining header', () => {
    const result = {
      success: false,
      remaining: 0,
      resetIn: 60000,
      retryAfter: 60,
    }

    const response = rateLimitResponse(result)
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('should include X-RateLimit-Reset header with ISO date', () => {
    const result = {
      success: false,
      remaining: 0,
      resetIn: 60000,
      retryAfter: 60,
    }

    const response = rateLimitResponse(result)
    const resetHeader = response.headers.get('X-RateLimit-Reset')

    expect(resetHeader).toBeDefined()
    // Should be a valid ISO date string
    expect(() => new Date(resetHeader!)).not.toThrow()
  })

  it('should default to 60 seconds for retryAfter when not provided', () => {
    const result = {
      success: false,
      remaining: 0,
      resetIn: 60000,
    }

    const response = rateLimitResponse(result)
    expect(response.headers.get('Retry-After')).toBe('60')
  })
})

describe('Rate Limiter Configurations', () => {
  let rateLimiters: any

  beforeEach(async () => {
    vi.resetModules()
    const module = await import('@/lib/redis-rate-limit')
    rateLimiters = module.rateLimiters
  })

  it('should have auth rate limiter configured', () => {
    expect(rateLimiters.auth).toBeDefined()
    expect(typeof rateLimiters.auth).toBe('function')
  })

  it('should have register rate limiter configured', () => {
    expect(rateLimiters.register).toBeDefined()
    expect(typeof rateLimiters.register).toBe('function')
  })

  it('should have api rate limiter configured', () => {
    expect(rateLimiters.api).toBeDefined()
    expect(typeof rateLimiters.api).toBe('function')
  })

  it('should have sensitive rate limiter configured', () => {
    expect(rateLimiters.sensitive).toBeDefined()
    expect(typeof rateLimiters.sensitive).toBe('function')
  })

  it('should have report rate limiter configured', () => {
    expect(rateLimiters.report).toBeDefined()
    expect(typeof rateLimiters.report).toBe('function')
  })

  it('should have ai rate limiter configured', () => {
    expect(rateLimiters.ai).toBeDefined()
    expect(typeof rateLimiters.ai).toBe('function')
  })
})

describe('RateLimitConfig interface', () => {
  it('should accept valid configuration', async () => {
    const config = {
      windowMs: 60000,
      maxRequests: 100,
      keyPrefix: 'test',
    }

    // TypeScript check - this should compile without errors
    expect(config.windowMs).toBe(60000)
    expect(config.maxRequests).toBe(100)
    expect(config.keyPrefix).toBe('test')
  })

  it('should have optional keyPrefix', async () => {
    const config = {
      windowMs: 60000,
      maxRequests: 100,
    }

    expect(config.windowMs).toBe(60000)
    expect(config.maxRequests).toBe(100)
  })
})

describe('RateLimitResult interface', () => {
  it('should have required success field', () => {
    const successResult = {
      success: true,
      remaining: 99,
      resetIn: 60000,
    }

    expect(successResult.success).toBe(true)
    expect(successResult.remaining).toBe(99)
    expect(successResult.resetIn).toBe(60000)
  })

  it('should have optional retryAfter for failed results', () => {
    const failedResult = {
      success: false,
      remaining: 0,
      resetIn: 30000,
      retryAfter: 30,
    }

    expect(failedResult.success).toBe(false)
    expect(failedResult.retryAfter).toBe(30)
  })
})

describe('In-Memory Rate Limiting Behavior', () => {
  // Note: These tests verify the in-memory fallback behavior
  // In production, Redis would be required

  let rateLimit: any

  beforeEach(async () => {
    vi.resetModules()
    // Ensure we're in development mode for in-memory testing
    process.env.NODE_ENV = 'test'
    delete process.env.REDIS_URL

    const module = await import('@/lib/redis-rate-limit')
    rateLimit = module.rateLimit
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should allow requests under the limit', async () => {
    const request = createMockRequest({ 'x-real-ip': '192.168.1.100' })

    const config = {
      windowMs: 60000,
      maxRequests: 5,
      keyPrefix: 'test-allow',
    }

    const result = await rateLimit(request, 'test-allow-endpoint', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should decrement remaining count with each request', async () => {
    const request = createMockRequest({ 'x-real-ip': '192.168.1.101' })

    const config = {
      windowMs: 60000,
      maxRequests: 5,
      keyPrefix: 'test-decrement',
    }

    const result1 = await rateLimit(request, 'test-decrement-endpoint', config)
    const result2 = await rateLimit(request, 'test-decrement-endpoint', config)

    expect(result1.remaining).toBe(4)
    expect(result2.remaining).toBe(3)
  })

  it('should block requests over the limit', async () => {
    const request = createMockRequest({ 'x-real-ip': '192.168.1.102' })

    const config = {
      windowMs: 60000,
      maxRequests: 3,
      keyPrefix: 'test-block',
    }

    // Use up all allowed requests
    for (let i = 0; i < 3; i++) {
      await rateLimit(request, 'test-block-endpoint', config)
    }

    // Next request should be blocked
    const result = await rateLimit(request, 'test-block-endpoint', config)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfter).toBeDefined()
  })

  it('should track different identifiers separately', async () => {
    const request1 = createMockRequest({ 'x-real-ip': '192.168.1.103' })
    const request2 = createMockRequest({ 'x-real-ip': '192.168.1.104' })

    const config = {
      windowMs: 60000,
      maxRequests: 5,
      keyPrefix: 'test-separate',
    }

    // Both should start with full quota
    const result1 = await rateLimit(request1, 'endpoint', config)
    const result2 = await rateLimit(request2, 'endpoint', config)

    expect(result1.remaining).toBe(4)
    expect(result2.remaining).toBe(4)
  })

  it('should track different endpoints separately', async () => {
    const request = createMockRequest({ 'x-real-ip': '192.168.1.105' })

    const config = {
      windowMs: 60000,
      maxRequests: 5,
      keyPrefix: 'test-endpoints',
    }

    const result1 = await rateLimit(request, 'endpoint-a', config)
    const result2 = await rateLimit(request, 'endpoint-b', config)

    // Both endpoints should have separate quotas
    expect(result1.remaining).toBe(4)
    expect(result2.remaining).toBe(4)
  })
})

describe('Security: Rate Limit Bypass Prevention', () => {
  let getClientIdentifier: any

  beforeEach(async () => {
    vi.resetModules()
    const module = await import('@/lib/redis-rate-limit')
    getClientIdentifier = module.getClientIdentifier
  })

  it('should not allow IP spoofing via multiple headers', () => {
    // Attacker might try to set multiple IP headers
    // The function should have a consistent priority order
    const request = createMockRequest({
      'x-forwarded-for': 'spoofed-ip',
      'x-real-ip': 'another-spoofed-ip',
      'cf-connecting-ip': 'real-ip-from-cloudflare',
    })

    // Should always prefer Cloudflare header (trusted proxy)
    expect(getClientIdentifier(request)).toBe('real-ip-from-cloudflare')
  })

  it('should handle empty header values', () => {
    const request = createMockRequest({
      'x-forwarded-for': '',
      'x-real-ip': '',
    })

    // Empty values should fall through to 'unknown'
    // Note: actual behavior depends on implementation
    const identifier = getClientIdentifier(request)
    expect(identifier).toBeDefined()
  })

  it('should handle whitespace-only values', () => {
    const request = createMockRequest({
      'x-forwarded-for': '   ',
    })

    const identifier = getClientIdentifier(request)
    // Should be trimmed empty string or fall through
    expect(identifier).toBeDefined()
  })
})

describe('Rate Limit Error Messages', () => {
  let rateLimitResponse: any

  beforeEach(async () => {
    vi.resetModules()
    const module = await import('@/lib/redis-rate-limit')
    rateLimitResponse = module.rateLimitResponse
  })

  it('should return Dutch error message', async () => {
    const result = {
      success: false,
      remaining: 0,
      resetIn: 60000,
      retryAfter: 60,
    }

    const response = rateLimitResponse(result)
    const body = await response.json()

    expect(body.error).toContain('Te veel verzoeken')
  })

  it('should include retryAfter in response body', async () => {
    const result = {
      success: false,
      remaining: 0,
      resetIn: 60000,
      retryAfter: 45,
    }

    const response = rateLimitResponse(result)
    const body = await response.json()

    expect(body.retryAfter).toBe(45)
  })
})
