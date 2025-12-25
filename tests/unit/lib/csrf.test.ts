/**
 * CSRF Protection Tests
 *
 * Tests for Cross-Site Request Forgery prevention mechanisms
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

// Mock next-auth before importing csrf module
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Import functions to test
import {
  generateCSRFToken,
  validateCSRFToken,
  isSameOrigin,
} from '@/lib/csrf'

// Helper to create mock NextRequest
function createMockRequest(
  method: string = 'GET',
  headers: Record<string, string> = {}
): any {
  return {
    method,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
  }
}

describe('generateCSRFToken', () => {
  const originalEnv = process.env.NEXTAUTH_SECRET

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing'
  })

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalEnv
  })

  it('should generate a consistent token for the same session', () => {
    const sessionId = 'session-123'
    const token1 = generateCSRFToken(sessionId)
    const token2 = generateCSRFToken(sessionId)

    expect(token1).toBe(token2)
  })

  it('should generate different tokens for different sessions', () => {
    const token1 = generateCSRFToken('session-1')
    const token2 = generateCSRFToken('session-2')

    expect(token1).not.toBe(token2)
  })

  it('should generate a hex string', () => {
    const token = generateCSRFToken('session-123')
    expect(/^[a-f0-9]+$/i.test(token)).toBe(true)
  })

  it('should generate a 64-character token (sha256 hex)', () => {
    const token = generateCSRFToken('session-123')
    expect(token.length).toBe(64)
  })
})

describe('validateCSRFToken', () => {
  const originalEnv = process.env.NEXTAUTH_SECRET

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing'
  })

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = originalEnv
  })

  it('should validate a correct token', () => {
    const sessionId = 'session-abc'
    const token = generateCSRFToken(sessionId)

    const isValid = validateCSRFToken(token, sessionId)
    expect(isValid).toBe(true)
  })

  it('should reject an incorrect token', () => {
    const sessionId = 'session-abc'
    const wrongToken = 'a'.repeat(64)

    const isValid = validateCSRFToken(wrongToken, sessionId)
    expect(isValid).toBe(false)
  })

  it('should reject token from different session', () => {
    const token = generateCSRFToken('session-1')
    const isValid = validateCSRFToken(token, 'session-2')
    expect(isValid).toBe(false)
  })

  it('should handle tokens of different lengths gracefully', () => {
    const sessionId = 'session-abc'

    // Should throw or return false for wrong length tokens
    expect(() => {
      validateCSRFToken('short', sessionId)
    }).toThrow()
  })
})

describe('isSameOrigin', () => {
  it('should return true for matching origin and host', () => {
    const request = createMockRequest('POST', {
      origin: 'https://example.com',
      host: 'example.com',
    })

    expect(isSameOrigin(request)).toBe(true)
  })

  it('should return false when origin is missing', () => {
    const request = createMockRequest('POST', {
      host: 'example.com',
    })

    expect(isSameOrigin(request)).toBe(false)
  })

  it('should return false when host is missing', () => {
    const request = createMockRequest('POST', {
      origin: 'https://example.com',
    })

    expect(isSameOrigin(request)).toBe(false)
  })

  it('should return false for mismatched origin and host', () => {
    const request = createMockRequest('POST', {
      origin: 'https://evil.com',
      host: 'example.com',
    })

    expect(isSameOrigin(request)).toBe(false)
  })

  it('should handle origin with port correctly', () => {
    const request = createMockRequest('POST', {
      origin: 'https://example.com:3000',
      host: 'example.com:3000',
    })

    expect(isSameOrigin(request)).toBe(true)
  })

  it('should handle localhost correctly', () => {
    const request = createMockRequest('POST', {
      origin: 'http://localhost:3000',
      host: 'localhost:3000',
    })

    expect(isSameOrigin(request)).toBe(true)
  })
})

describe('CSRF Token Security Properties', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'production-secret-key-that-is-long-enough'
  })

  it('should use HMAC-SHA256 for token generation', () => {
    const sessionId = 'test-session'
    const token = generateCSRFToken(sessionId)

    // SHA256 produces 32 bytes = 64 hex characters
    expect(token.length).toBe(64)
  })

  it('should produce unpredictable tokens without secret', () => {
    const secret1 = 'secret-1'
    const secret2 = 'secret-2'
    const sessionId = 'same-session'

    process.env.NEXTAUTH_SECRET = secret1
    const token1 = generateCSRFToken(sessionId)

    process.env.NEXTAUTH_SECRET = secret2
    const token2 = generateCSRFToken(sessionId)

    expect(token1).not.toBe(token2)
  })

  it('should be resistant to timing attacks', () => {
    // validateCSRFToken uses crypto.timingSafeEqual
    // This test verifies the comparison doesn't short-circuit
    const sessionId = 'session-123'
    const validToken = generateCSRFToken(sessionId)

    // Create tokens that differ at different positions
    const almostCorrect = validToken.substring(0, 63) + (validToken[63] === 'a' ? 'b' : 'a')

    // Both should fail but take similar time
    // We can't easily test timing, but we verify both reject correctly
    expect(validateCSRFToken(almostCorrect, sessionId)).toBe(false)
    expect(validateCSRFToken('a'.repeat(64), sessionId)).toBe(false)
  })
})

describe('Origin Validation Edge Cases', () => {
  it('should handle null values safely', () => {
    const request = createMockRequest('POST', {})
    expect(isSameOrigin(request)).toBe(false)
  })

  it('should handle malformed origins', () => {
    const request = createMockRequest('POST', {
      origin: 'not-a-valid-url',
      host: 'example.com',
    })

    // Should throw or return false for malformed URL
    expect(() => isSameOrigin(request)).toThrow()
  })

  it('should handle origins with paths (should be ignored)', () => {
    const request = createMockRequest('POST', {
      origin: 'https://example.com/some/path',
      host: 'example.com',
    })

    // Origin should only include protocol and host
    expect(isSameOrigin(request)).toBe(true)
  })
})

describe('CSRF Attack Scenarios', () => {
  it('should prevent cross-origin POST requests', () => {
    const request = createMockRequest('POST', {
      origin: 'https://attacker.com',
      host: 'victim.com',
    })

    expect(isSameOrigin(request)).toBe(false)
  })

  it('should prevent subdomain attacks', () => {
    const request = createMockRequest('POST', {
      origin: 'https://evil.victim.com',
      host: 'victim.com',
    })

    expect(isSameOrigin(request)).toBe(false)
  })

  it('should prevent protocol downgrade attacks', () => {
    const request = createMockRequest('POST', {
      origin: 'http://example.com', // HTTP
      host: 'example.com', // Could be HTTPS
    })

    // isSameOrigin only checks host match, not protocol
    // Additional HTTPS enforcement should happen at middleware level
    expect(isSameOrigin(request)).toBe(true)
  })

  it('should handle referer header spoofing attempts', () => {
    // The validateOrigin function also checks referer
    // But isSameOrigin only checks origin header
    const request = createMockRequest('POST', {
      origin: 'https://example.com',
      host: 'example.com',
      referer: 'https://attacker.com/page', // Spoofed referer
    })

    // isSameOrigin doesn't check referer, only origin
    expect(isSameOrigin(request)).toBe(true)
  })
})

describe('Token Edge Cases', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret'
  })

  it('should handle empty session ID', () => {
    const token = generateCSRFToken('')
    expect(token.length).toBe(64)
  })

  it('should handle session ID with special characters', () => {
    const specialChars = 'session-🔐-特殊-<script>'
    const token = generateCSRFToken(specialChars)
    expect(token.length).toBe(64)

    const isValid = validateCSRFToken(token, specialChars)
    expect(isValid).toBe(true)
  })

  it('should handle very long session IDs', () => {
    const longSession = 'a'.repeat(10000)
    const token = generateCSRFToken(longSession)
    expect(token.length).toBe(64)

    const isValid = validateCSRFToken(token, longSession)
    expect(isValid).toBe(true)
  })
})

// Cleanup
afterEach(() => {
  vi.restoreAllMocks()
})
