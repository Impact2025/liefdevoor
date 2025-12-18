/**
 * Sentry Server Configuration
 *
 * Captures errors on the server (API routes, server components)
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from error
    if (event.request?.headers) {
      delete event.request.headers['cookie']
      delete event.request.headers['authorization']
    }

    // Remove sensitive data from context
    if (event.contexts?.runtime) {
      delete event.contexts.runtime
    }

    // Sanitize database errors
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((exception) => {
        if (exception.value) {
          // Remove connection strings from error messages
          exception.value = exception.value.replace(
            /postgresql:\/\/[^@]+@[^/]+/g,
            'postgresql://***:***@***/***'
          )
        }
        return exception
      })
    }

    return event
  },

  // Tag all events with release version
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Ignore certain errors
  ignoreErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
})
