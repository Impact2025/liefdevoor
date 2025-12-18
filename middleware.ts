import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limit'

/**
 * Enhanced Middleware with Rate Limiting + Auth
 *
 * Applies rate limiting to all API routes and authentication to protected routes
 */
async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    let rateLimit

    // Choose rate limiter based on endpoint
    if (pathname.includes('/auth/') || pathname.includes('/register')) {
      rateLimit = await rateLimiters.auth(request)
    } else if (pathname.includes('/ai/')) {
      rateLimit = await rateLimiters.ai(request)
    } else if (pathname.includes('/report')) {
      rateLimit = await rateLimiters.report(request)
    } else if (
      pathname.includes('/swipe') ||
      pathname.includes('/match') ||
      pathname.includes('/block')
    ) {
      rateLimit = await rateLimiters.sensitive(request)
    } else {
      rateLimit = await rateLimiters.api(request)
    }

    // Block if rate limit exceeded
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit)
    }

    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
    response.headers.set(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimit.resetIn).toISOString()
    )

    return response
  }

  // Continue with next middleware (admin auth check)
  return NextResponse.next()
}

// Wrap middleware with NextAuth for protected routes
export default withAuth(middleware, {
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl

      // Admin routes require ADMIN role
      if (pathname.startsWith('/admin')) {
        return token?.role === 'ADMIN'
      }

      // API routes and public pages
      return true
    },
  },
})

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    // All API routes for rate limiting
    '/api/:path*',
  ],
}