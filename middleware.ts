import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limit-edge'
import { getToken } from 'next-auth/jwt'

// Routes that require onboarding to be complete
const REQUIRES_ONBOARDING = [
  '/discover',
  '/chat',
  '/matches',
  '/profile',
  '/settings',
]

// Routes that are part of onboarding flow (allow access even if not onboarded)
const ONBOARDING_ROUTES = [
  '/onboarding',
]

// Public routes that don't require auth
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/',
]

/**
 * Enhanced Middleware with Rate Limiting + Auth + Onboarding Guard
 *
 * - Rate limiting for API routes
 * - Auth protection for protected routes
 * - Onboarding guard: redirect to /onboarding if not onboarded
 */
async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    let rateLimit

    // Choose rate limiter based on endpoint
    // Email verification should be more lenient (uses api rate limiter)
    if (pathname.includes('/auth/verify')) {
      rateLimit = await rateLimiters.api(request)  // 100/min instead of 5/min
    } else if (pathname.includes('/auth/') || pathname.includes('/register')) {
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

  // Get token for onboarding check
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // If user is logged in, check onboarding status
  if (token) {
    const isOnboarded = token.isOnboarded as boolean

    // Check if trying to access a route that requires onboarding
    const needsOnboarding = REQUIRES_ONBOARDING.some(route =>
      pathname.startsWith(route)
    )

    // If not onboarded and trying to access protected route -> redirect to onboarding
    if (!isOnboarded && needsOnboarding) {
      const onboardingUrl = new URL('/onboarding', request.url)
      return NextResponse.redirect(onboardingUrl)
    }

    // If onboarded and trying to access onboarding -> redirect to discover
    const isOnboardingRoute = ONBOARDING_ROUTES.some(route =>
      pathname.startsWith(route)
    )
    if (isOnboarded && isOnboardingRoute) {
      const discoverUrl = new URL('/discover', request.url)
      return NextResponse.redirect(discoverUrl)
    }
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

      // Check if this is a public route
      const isPublicRoute = PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
      )
      if (isPublicRoute) {
        return true
      }

      // Protected routes that require login
      const requiresAuth = REQUIRES_ONBOARDING.some(route =>
        pathname.startsWith(route)
      )

      if (requiresAuth) {
        // Not logged in? Redirect to login
        if (!token) {
          return false
        }
        // Logged in - allow access (onboarding redirect handled in middleware)
        return true
      }

      // Onboarding page - allow if logged in
      if (ONBOARDING_ROUTES.some(route => pathname.startsWith(route))) {
        return !!token
      }

      // API routes and other pages
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
    '/settings/:path*',
    '/onboarding/:path*',
    // All API routes for rate limiting
    '/api/:path*',
  ],
}
