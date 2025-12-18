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
    'https://nominatim.openstreetmap.org',
    'https://openrouter.ai',
    'https://*.ingest.sentry.io',
  ]

  // Development: Allow unsafe-eval for HMR
  // Production: Use nonce and strict-dynamic for better security
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval'`
    : `'nonce-${nonce}' 'strict-dynamic' 'self'`

  // Style: unsafe-inline is acceptable for styles (less risky than scripts)
  // Alternative: Use nonces for styles too if you want maximum security
  const styleSrc = `'self' 'unsafe-inline'`

  const csp = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    img-src 'self' blob: data: ${allowedImageDomains.map(d => `https://${d}`).join(' ')};
    font-src 'self' data:;
    connect-src ${allowedConnectDomains.join(' ')};
    frame-ancestors 'self';
    frame-src 'self' https://challenges.cloudflare.com;
    form-action 'self';
    base-uri 'self';
    object-src 'none';
    media-src 'self';
    worker-src 'self' blob:;
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
      'camera=(), microphone=(self), geolocation=(self), interest-cohort=(), payment=()',

    // Cross-Origin policies for better isolation
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  }
}
