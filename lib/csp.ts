/**
 * Content Security Policy Configuration
 *
 * Secure CSP with nonce support for inline scripts
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Generate a cryptographic nonce for CSP
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

/**
 * Build CSP header with nonce
 */
export function buildCSP(nonce: string, isDev: boolean): string {
  const allowedImageDomains = [
    'randomuser.me',
    'images.unsplash.com',
    'utfs.io',
    'uploadthing.com',
    'i.pravatar.cc',
    'ui-avatars.com',
  ]

  const allowedConnectDomains = [
    "'self'",
    'https://api.uploadthing.com',
    'https://uploadthing.com',
    'https://utfs.io',
    'https://*.ingest.uploadthing.com',
    'https://nominatim.openstreetmap.org',
    'https://openrouter.ai',
    'https://*.ingest.sentry.io',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://region1.google-analytics.com',
    'https://challenges.cloudflare.com',
    'https://*.cloudflare.com',
    // Stripe
    'https://api.stripe.com',
    'https://errors.stripe.com',
    'https://js.stripe.com',
    'https://m.stripe.com',
    'https://m.stripe.network',
    'wss://*.stripe.com',
  ]

  // Google Analytics / Tag Manager domains
  const googleAnalyticsDomains = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://ssl.google-analytics.com',
  ]

  // CSP Configuration
  const scriptSrc = `'self' 'unsafe-inline' 'unsafe-eval' ${googleAnalyticsDomains.join(' ')} https://challenges.cloudflare.com https://js.stripe.com`

  const styleSrc = `'self' 'unsafe-inline'`

  const csp = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    img-src 'self' blob: data: ${allowedImageDomains.map(d => `https://${d}`).join(' ')} https://*.stripe.com;
    font-src 'self' data:;
    connect-src ${allowedConnectDomains.join(' ')};
    frame-ancestors 'self';
    frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com;
    form-action 'self';
    base-uri 'self';
    object-src 'none';
    media-src 'self' blob:;
    worker-src 'self' blob: https://js.stripe.com;
    manifest-src 'self';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return csp
}

/**
 * Add CSP header to response with nonce
 */
export function addCSPHeader(
  response: NextResponse,
  nonce: string,
  isDev: boolean
): NextResponse {
  const csp = buildCSP(nonce, isDev)
  response.headers.set('Content-Security-Policy', csp)
  return response
}

/**
 * Enhanced security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent DNS prefetching to enhance privacy
    'X-DNS-Prefetch-Control': 'on',

    // Enforce HTTPS
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'SAMEORIGIN',

    // XSS Protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy':
      'camera=(self), microphone=(self), geolocation=(self), interest-cohort=(), payment=(self "https://js.stripe.com" "https://hooks.stripe.com")',

    // Note: Cross-Origin policies (COEP/COOP/CORP) disabled to allow external resources
    // These headers can block Cloudflare Turnstile, Google Analytics, etc.
  }
}
