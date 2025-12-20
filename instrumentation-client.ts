/**
 * Instrumentation Client - World-Class Edition
 *
 * Client-side Sentry initialization for Next.js 14+
 * This file replaces the deprecated sentry.client.config.ts
 */

import * as Sentry from '@sentry/nextjs'
import { trackError } from '@/lib/gtag'

// Only initialize Sentry in production or if DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV,

    // Performance Monitoring - sample 10% in production, 100% in dev
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay for debugging user sessions
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Always capture replay on error

    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',

    // Ignore common/expected errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      'ChunkLoadError',
      // User cancellations
      'AbortError',
      'cancelled',
      // Third party scripts
      'Script error.',
      'ResizeObserver loop',
    ],

    // URLs to ignore
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Firefox extensions
      /^moz-extension:\/\//i,
      // Safari extensions
      /^safari-extension:\/\//i,
    ],

    // Filter out sensitive data before sending
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['cookie']
        delete event.request.headers['authorization']
        delete event.request.headers['x-api-key']
      }

      // Mask sensitive form data
      if (event.request?.data && typeof event.request.data === 'object') {
        const data = event.request.data as Record<string, any>
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard']

        sensitiveFields.forEach(field => {
          if (data[field]) {
            data[field] = '[FILTERED]'
          }
        })

        // Partially mask email addresses
        if (data.email && typeof data.email === 'string') {
          data.email = data.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        }
      }

      // Track error in Google Analytics (if consent given)
      if (event.exception?.values?.[0]) {
        const error = event.exception.values[0]
        const errorMessage = error.value || error.type || 'Unknown error'
        const errorLevel = event.level || 'error'

        try {
          trackError(
            errorMessage,
            errorLevel as 'warning' | 'error' | 'fatal'
          )
        } catch {
          // Ignore analytics tracking errors
        }
      }

      return event
    },

    // Tag all events with release version
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        // Mask all text and block all media by default for privacy
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  })
}

// Export router transition hook for navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
