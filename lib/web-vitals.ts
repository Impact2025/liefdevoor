/**
 * Web Vitals Monitoring
 *
 * Tracks Core Web Vitals and sends to analytics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 *
 * @see https://web.dev/vitals/
 */

import type { Metric } from 'web-vitals'

/**
 * Send metric to Google Analytics
 */
function sendToGoogleAnalytics(metric: Metric) {
  if (typeof window === 'undefined') return

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

/**
 * Send metric to Sentry
 */
function sendToSentry(metric: Metric) {
  if (typeof window === 'undefined') return

  // Only send in production
  if (process.env.NODE_ENV !== 'production') return

  try {
    if (window.Sentry) {
      window.Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        level: metric.rating === 'good' ? 'info' : metric.rating === 'needs-improvement' ? 'warning' : 'error',
        tags: {
          web_vital: metric.name,
          rating: metric.rating,
        },
        extra: {
          value: metric.value,
          id: metric.id,
          navigationType: metric.navigationType,
        },
      })
    }
  } catch (error) {
    console.error('Failed to send metric to Sentry:', error)
  }
}

/**
 * Console log in development
 */
function logToConsole(metric: Metric) {
  if (process.env.NODE_ENV !== 'development') return

  const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
  console.log(`${emoji} ${metric.name}:`, {
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
  })
}

/**
 * Report Web Vitals
 * Call this in your app (usually in app/layout.tsx)
 */
export function reportWebVitals(metric: Metric) {
  // Send to multiple destinations
  sendToGoogleAnalytics(metric)
  sendToSentry(metric)
  logToConsole(metric)

  // Optional: Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        navigationType: metric.navigationType,
      }),
      keepalive: true, // Send even if page is unloading
    }).catch(console.error)
  }
}

/**
 * TypeScript declarations for global objects
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    Sentry?: {
      captureMessage: (message: string, context?: any) => void
    }
  }
}
