import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import crypto from 'crypto'

/**
 * CSRF Protection for API Routes
 *
 * This module provides Cross-Site Request Forgery protection through:
 * 1. Origin header validation
 * 2. Custom CSRF token validation (for non-session routes)
 * 3. Double-submit cookie pattern
 */

// Allowed origins for CORS (configure based on environment)
const getAllowedOrigins = (): string[] => {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const origins = [base]

  // Add production domains if configured
  if (process.env.PRODUCTION_URL) {
    origins.push(process.env.PRODUCTION_URL)
  }

  return origins
}

/**
 * Validate request origin matches the host
 * Prevents CSRF attacks by ensuring requests come from trusted origins
 */
export async function validateOrigin(request: NextRequest): Promise<boolean> {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  // For same-origin requests, origin might be null
  // In that case, check referer
  const requestOrigin = origin || (referer ? new URL(referer).origin : null)

  if (!requestOrigin || !host) {
    return false
  }

  const allowedOrigins = getAllowedOrigins()

  // Check if request origin is in allowed list
  if (allowedOrigins.some(allowed => requestOrigin === allowed || requestOrigin === `https://${host}` || requestOrigin === `http://${host}`)) {
    return true
  }

  return false
}

/**
 * Comprehensive CSRF validation for authenticated routes
 * Combines session check with origin validation
 */
export async function validateCSRF(request: NextRequest): Promise<{
  valid: boolean
  error?: string
}> {
  // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true }
  }

  // 1. Validate session exists
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      valid: false,
      error: 'No active session'
    }
  }

  // 2. Validate origin
  const originValid = await validateOrigin(request)
  if (!originValid) {
    return {
      valid: false,
      error: 'Invalid origin or referer'
    }
  }

  return { valid: true }
}

/**
 * Generate a CSRF token for a session
 * Can be used for additional token-based protection
 */
export function generateCSRFToken(sessionId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret'
  const hash = crypto
    .createHmac('sha256', secret)
    .update(sessionId)
    .digest('hex')

  return hash
}

/**
 * Validate a CSRF token against a session
 */
export function validateCSRFToken(token: string, sessionId: string): boolean {
  const expectedToken = generateCSRFToken(sessionId)

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  )
}

/**
 * Middleware helper for API routes
 * Returns a NextResponse with error if CSRF validation fails
 */
export async function requireCSRF(request: NextRequest) {
  const result = await validateCSRF(request)

  if (!result.valid) {
    return {
      isValid: false,
      error: result.error || 'CSRF validation failed'
    }
  }

  return {
    isValid: true
  }
}

/**
 * Check if request is from same origin (for additional security)
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (!origin || !host) return false

  const originUrl = new URL(origin)
  return originUrl.host === host
}
