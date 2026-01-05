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
      <ArticleClient article={article} />
    </>
  )
}
