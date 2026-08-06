/**
 * Robots.txt - Next.js 14 App Router
 *
 * Automatically generates robots.txt for search engine crawlers
 * URL: https://www.liefdevooriedereen.nl/robots.txt
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

/**
 * Privé- en accountroutes die geen enkele crawler hoort te indexeren.
 *
 * Eén gedeelde lijst, want in robots.txt geldt per bot uitsluitend de meest
 * specifieke user-agent groep. Er stond een aparte Googlebot-regel met een
 * kortere disallow-lijst, waardoor Googlebot juist méér mocht crawlen dan de
 * sterretjes-regel toestond: /settings, /likes, /subscription en /welkom waren
 * voor Google gewoon open.
 */
const PRIVE_PADEN = [
  '/api/*',           // API endpoints
  '/admin/*',         // Admin panel
  '/discover/*',      // Authenticated discovery
  '/matches/*',       // User matches
  '/chat/*',          // Private chats
  '/profile/*',       // User profiles
  '/onboarding/*',    // Onboarding flow
  '/settings/*',      // User settings
  '/search/*',        // Authenticated search
  '/likes/*',         // User likes
  '/notifications/*', // User notifications
  '/subscription/*',  // Billing/subscription flow
  '/verify-email/*',  // Email verification flow
  '/forgot-password/*',
  '/reset-password/*',
  '/welkom/*',        // Post-signup onboarding
  '/_next/*',         // Next.js internals
  '/vercel.svg',      // Assets
  '/next.svg',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVE_PADEN,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: PRIVE_PADEN,
      },
      // Block bad bots
      {
        userAgent: [
          'AhrefsBot',      // SEO crawler
          'SemrushBot',     // SEO crawler
          'DotBot',         // SEO crawler
          'MJ12bot',        // Majestic crawler
        ],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
