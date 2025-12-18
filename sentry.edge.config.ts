/**
 * Sentry Edge Configuration
 *
 * Captures errors in Edge Runtime (middleware, edge functions)
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Performance Monitoring (lower rate for edge)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Tag all events with release version
  release: process.env.VERCEL_GIT_COMMIT_SHA,
})
