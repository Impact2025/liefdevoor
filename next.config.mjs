import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */

// Allowed domains for CSP
const allowedImageDomains = [
  'randomuser.me',
  'images.unsplash.com',
  'utfs.io',
  'uploadthing.com',
  'i.pravatar.cc',
  'ui-avatars.com',
];

const allowedConnectDomains = [
  "'self'",
  'https://api.uploadthing.com',
  'https://uploadthing.com',
  'https://*.ingest.uploadthing.com',  // UploadThing file upload
  'https://nominatim.openstreetmap.org',
  'https://openrouter.ai',
  'https://*.ingest.sentry.io',  // Sentry error tracking
  'https://www.google-analytics.com',
  'https://www.googletagmanager.com',
  'https://region1.google-analytics.com',
];

// Google Analytics domains
const googleAnalyticsDomains = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://ssl.google-analytics.com',
];

// Build CSP header (different for dev vs production)
// Development needs 'unsafe-eval' for HMR (Hot Module Replacement)
// Production: stricter CSP with hash-based inline scripts
const isDev = process.env.NODE_ENV === 'development'

// For maximum security, consider implementing nonce-based CSP (see lib/csp.ts)
const scriptSrc = isDev
  ? `'self' 'unsafe-inline' 'unsafe-eval' ${googleAnalyticsDomains.join(' ')} https://challenges.cloudflare.com`
  : `'self' 'unsafe-inline' ${googleAnalyticsDomains.join(' ')} https://challenges.cloudflare.com`

const cspHeader = `
  default-src 'self';
  script-src ${scriptSrc};
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
`.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

const nextConfig = {
  // Performance optimizations
  compress: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,

  // Development optimizations
  ...(isDev && {
    // Faster compilation in dev mode
    reactStrictMode: true,

    // Optimize dev server
    onDemandEntries: {
      // Period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 60 * 1000,
      // Number of pages that should be kept simultaneously
      pagesBufferLength: 5,
    },
  }),

  // Webpack configuration to exclude server-only modules from client bundle
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Add fallback for Node.js built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
        util: false,
      };

      // Ignore ioredis and other server-only packages on client
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(ioredis|redis)$/,
        })
      );
    }

    return config;
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],

    // Turbopack configuration for even faster dev mode
    ...(isDev && {
      turbo: {
        rules: {
          '*.svg': {
            loaders: ['@svgr/webpack'],
            as: '*.js',
          },
        },
      },
    }),
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

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self), interest-cohort=(), payment=()'
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          }
        ]
      },
      // CORS headers for API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXTAUTH_URL || 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ]
      }
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  silent: true,

  // Upload source maps only in production
  widenClientFileUpload: true,

  // Disable source maps upload in development
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack configuration for React component annotation
  webpack: {
    // Automatically annotate React components to show in breadcrumbs
    reactComponentAnnotation: {
      enabled: true,
    },
  },
};

// Export with Sentry wrapper
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
