/**
 * Sentry Client Configuration
 *
 * Captures errors in the browser
 */

import * as Sentry from '@sentry/nextjs'
import { trackError } from '@/lib/gtag'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay for debugging
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // Network errors that are expected
    'NetworkError',
    'Failed to fetch',
    // User cancellations
    'AbortError',
  ],

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from error
    if (event.request?.headers) {
      delete event.request.headers['cookie']
      delete event.request.headers['authorization']
    }

    // Remove passwords from form data
    if (event.request?.data) {
      const data = event.request.data as any
      if (data.password) data.password = '[Filtered]'
      if (data.email) data.email = data.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    }

    // Track error in Google Analytics (if consent given)
    if (event.exception?.values?.[0]) {
      const error = event.exception.values[0]
      const errorMessage = error.value || error.type || 'Unknown error'
      const errorLevel = event.level || 'error'

      trackError(
        errorMessage,
        errorLevel as 'warning' | 'error' | 'fatal'
      )
    }

    return event
  },

  // Tag all events with release version
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
})
