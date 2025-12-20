import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limit'

// Routes that require a complete profile to access
const PROFILE_REQUIRED_ROUTES = [
  '/discover',
  '/chat',
  '/matches',
  '/profile',
]

// Routes that should redirect to discover if profile IS complete
const ONBOARDING_ROUTES = [
  '/onboarding',
]

/**
 * Enhanced Middleware with Rate Limiting + Auth + Onboarding Guard
 *
 * - Rate limiting for API routes
 * - Auth protection for protected routes
 * - Onboarding guard: redirect to /onboarding if profile incomplete
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

  // Continue with next middleware (auth check)
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

      // Protected routes that require login
      const isProtectedRoute = PROFILE_REQUIRED_ROUTES.some(route =>
        pathname.startsWith(route)
      )

      if (isProtectedRoute) {
        // Not logged in? Redirect to login
        if (!token) {
          return false
        }

        // Logged in but profile not complete? The redirect is handled in the page
        // We allow access here so the page can redirect to /onboarding
        return true
      }

      // Onboarding page - allow if logged in
      if (ONBOARDING_ROUTES.some(route => pathname.startsWith(route))) {
        return !!token
      }

      // API routes and public pages
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    // Protected routes (require auth)
    '/admin/:path*',
    '/discover/:path*',
    '/chat/:path*',
    '/matches/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    // All API routes for rate limiting
    '/api/:path*',
  ],
}
