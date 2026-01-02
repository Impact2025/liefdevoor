/**
 * Robots.txt - Next.js 14 App Router
 *
 * Automatically generates robots.txt for search engine crawlers
 * URL: https://www.liefdevooriedereen.nl/robots.txt
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.liefdevooriedereen.nl'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',           // API endpoints
          '/admin/*',         // Admin panel
          '/discover/*',      // Authenticated discovery
          '/matches/*',       // User matches
          '/chat/*',          // Private chats
          '/profile/*',       // User profiles
          '/onboarding/*',    // Onboarding flow
          '/settings/*',      // User settings
          '/_next/*',         // Next.js internals
          '/vercel.svg',      // Assets
          '/next.svg',
        ],
      },
      // Specific rules for good bots
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/discover/*',
          '/matches/*',
          '/chat/*',
        ],
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
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
