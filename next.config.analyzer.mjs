import { withSentryConfig } from '@sentry/nextjs'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */

// Allowed domains for CSP
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

const isDev = process.env.NODE_ENV === 'development'

const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self' 'unsafe-inline'"

const cspHeader = `
  default-src 'self';
  script-src ${scriptSrc} https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
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
`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()

const nextConfig = {
  compress: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(self), interest-cohort=(), payment=()' },
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL || 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ]
      }
    ]
  },
}

const sentryOptions = {
  silent: true,
  widenClientFileUpload: true,
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
  hideSourceMaps: true,
  reactComponentAnnotation: { enabled: true },
}

export default withBundleAnalyzer(withSentryConfig(nextConfig, sentryOptions))
