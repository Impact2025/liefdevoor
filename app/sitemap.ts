/**
 * Sitemap - Next.js 14 App Router
 *
 * Automatically generates sitemap.xml for search engines
 * Updates: https://liefdevooriederen.nl/sitemap.xml
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://liefdevooriederen.nl'

  // Fetch kennisbank categories
  let kennisbankCategories: any[] = []
  let kennisbankArticles: any[] = []

  try {
    kennisbankCategories = await prisma.knowledgeBaseCategory.findMany({
      where: { isVisible: true, isProfessionalOnly: false },
      select: { slug: true, updatedAt: true },
    })

    kennisbankArticles = await prisma.knowledgeBaseArticle.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        isPillarPage: true,
        category: { select: { slug: true, isProfessionalOnly: true } },
      },
    })
    // Filter out professional-only articles
    kennisbankArticles = kennisbankArticles.filter(a => !a.category.isProfessionalOnly)
  } catch (error) {
    console.error('Error fetching kennisbank for sitemap:', error)
  }

  // Build kennisbank category URLs
  const categoryUrls = kennisbankCategories.map((cat) => ({
    url: `${baseUrl}/kennisbank/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Build kennisbank article URLs
  const articleUrls = kennisbankArticles.map((article) => ({
    url: `${baseUrl}/kennisbank/${article.category.slug}/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: article.isPillarPage ? 0.9 : 0.7,
  }))

  return [
    // Homepage - Highest Priority
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },

    // Public Pages - High Priority
    {
      url: `${baseUrl}/over-ons`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/prijzen`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },

    // Authentication Pages
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // Legal Pages
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/safety`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Kennisbank Main Page
    {
      url: `${baseUrl}/kennisbank`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kennisbank/begrippen`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kennisbank/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kennisbank/zoeken`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },

    // Professionals Portal
    {
      url: `${baseUrl}/professionals`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // Dynamic Kennisbank Categories
    ...categoryUrls,

    // Dynamic Kennisbank Articles
    ...articleUrls,

    // Note: Authenticated pages (discover, matches, chat, etc.) are excluded
    // as they require login and shouldn't be indexed
  ]
}
