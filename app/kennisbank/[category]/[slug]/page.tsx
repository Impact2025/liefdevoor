import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArticleClient from './ArticleClient'
import {
  generateArticleMetadata,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  calculateWordCount,
  renderStructuredData,
} from '@/lib/seo'

interface PageProps {
  params: {
    category: string
    slug: string
  }
}

// Fetch article data (server-side)
async function getArticle(slug: string) {
  const article = await prisma.knowledgeBaseArticle.findUnique({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      category: {
        select: {
          name: true,
          nameNl: true,
          slug: true,
          color: true,
        },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!article) {
    return null
  }

  // Increment view count (fire and forget)
  prisma.knowledgeBaseArticle
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch((err) => console.error('Failed to increment view count:', err))

  // Calculate read time
  const readTime = Math.ceil(calculateWordCount(article.contentNl) / 200)

  return {
    ...article,
    readTime,
    publishedAt: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }
}

// Fetch related articles: same category + keyword overlap
async function getRelatedArticles(articleId: string, categoryId: string, keywords: string[]) {
  const sameCategoryArticles = await prisma.knowledgeBaseArticle.findMany({
    where: {
      isPublished: true,
      id: { not: articleId },
      categoryId,
    },
    select: {
      id: true,
      titleNl: true,
      slug: true,
      excerptNl: true,
      articleType: true,
      isPillarPage: true,
      hasEasyRead: true,
      keywords: true,
      category: { select: { slug: true, nameNl: true, name: true } },
    },
    orderBy: [{ isPillarPage: 'desc' }, { viewCount: 'desc' }],
    take: 10,
  })

  // Score by keyword overlap, pillar articles first
  const scored = sameCategoryArticles
    .map((a) => {
      const articleKeywords = (a.keywords as string[]).map((k) => k.toLowerCase())
      const overlap = keywords.filter((k) => articleKeywords.includes(k.toLowerCase())).length
      return { article: a, score: overlap + (a.isPillarPage ? 5 : 0) }
    })
    .sort((a, b) => b.score - a.score)
    .map(({ article: a }) => a)

  // Fill up to 4 with cross-category articles if needed
  let result = scored.slice(0, 4)

  if (result.length < 4 && keywords.length > 0) {
    const crossCategory = await prisma.knowledgeBaseArticle.findMany({
      where: {
        isPublished: true,
        id: { notIn: [articleId, ...result.map((a) => a.id)] },
        keywords: { hasSome: keywords.slice(0, 3) },
      },
      select: {
        id: true,
        titleNl: true,
        slug: true,
        excerptNl: true,
        articleType: true,
        isPillarPage: true,
        hasEasyRead: true,
        keywords: true,
        category: { select: { slug: true, nameNl: true, name: true } },
      },
      orderBy: [{ isPillarPage: 'desc' }, { viewCount: 'desc' }],
      take: 4 - result.length,
    })
    result = [...result, ...crossCategory]
  }

  return result
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug)

  if (!article) {
    return {
      title: 'Artikel niet gevonden',
      description: 'Dit artikel bestaat niet of is verwijderd.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app'
  const canonicalUrl = article.canonicalUrl || `${baseUrl}/kennisbank/${params.category}/${params.slug}`

  return generateArticleMetadata({
    title: article.metaTitle || article.titleNl,
    description: article.metaDescription || article.excerptNl || article.titleNl,
    keywords: article.keywords,
    canonicalUrl,
    featuredImage: article.featuredImage || undefined,
    publishedTime: article.publishedAt ? new Date(article.publishedAt) : undefined,
    modifiedTime: new Date(article.updatedAt),
    author: article.author?.name || 'Liefde Voor Iedereen',
    section: article.category.nameNl || article.category.name,
    tags: article.keywords,
  })
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(
    article.id,
    article.categoryId,
    article.keywords as string[]
  )

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app'
  const articleUrl = `${baseUrl}/kennisbank/${params.category}/${params.slug}`

  // Generate Article structured data
  const articleSchema = generateArticleStructuredData({
    headline: article.titleNl,
    description: article.excerptNl || article.titleNl,
    image: article.featuredImage || undefined,
    datePublished: article.publishedAt ? new Date(article.publishedAt) : undefined,
    dateModified: new Date(article.updatedAt),
    author: article.author?.name || 'Liefde Voor Iedereen',
    keywords: article.keywords,
    articleSection: article.category.nameNl || article.category.name,
    wordCount: calculateWordCount(article.contentNl),
    url: articleUrl,
    isPillarPage: article.isPillarPage,
  })

  // Generate Breadcrumb structured data
  const breadcrumbSchema = generateBreadcrumbStructuredData([
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'Kennisbank',
      url: '/kennisbank',
    },
    {
      name: article.category.nameNl || article.category.name,
      url: `/kennisbank/${params.category}`,
    },
    {
      name: article.titleNl,
      url: articleUrl,
    },
  ])

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: renderStructuredData(breadcrumbSchema),
        }}
      />

      {/* Render client component */}
      <ArticleClient article={article} relatedArticles={relatedArticles} />
    </>
  )
}
