import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BlogPostClient from './BlogPostClient'
import {
  generateArticleMetadata,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  calculateWordCount,
  renderStructuredData,
} from '@/lib/seo'

interface PageProps {
  params: {
    slug: string
  }
}

// Fetch blog post data (server-side)
async function getBlogPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: {
      slug,
      published: true,
    },
    include: {
      author: {
        select: {
          name: true,
          profileImage: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!post) {
    return null
  }

  // Extract keywords from JSON field
  const keywords = Array.isArray(post.keywords)
    ? (post.keywords as string[])
    : []

  return {
    ...post,
    keywords,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Artikel niet gevonden',
      description: 'Het artikel dat je zoekt bestaat niet of is verwijderd.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app'
  const canonicalUrl = `${baseUrl}/blog/${params.slug}`

  const keywords = Array.isArray(post.keywords)
    ? (post.keywords as string[])
    : []

  return generateArticleMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.title,
    keywords,
    canonicalUrl,
    featuredImage: post.featuredImage || undefined,
    publishedTime: new Date(post.createdAt),
    modifiedTime: new Date(post.updatedAt),
    author: post.author?.name || 'Liefde Voor Iedereen',
    section: post.category?.name,
    tags: keywords,
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://liefdevoor.vercel.app'
  const postUrl = `${baseUrl}/blog/${params.slug}`

  // Generate Article structured data
  const keywords = Array.isArray(post.keywords)
    ? (post.keywords as string[])
    : []

  const articleSchema = generateArticleStructuredData({
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featuredImage || undefined,
    datePublished: new Date(post.createdAt),
    dateModified: new Date(post.updatedAt),
    author: post.author?.name || 'Liefde Voor Iedereen',
    keywords,
    articleSection: post.category?.name,
    wordCount: calculateWordCount(post.content),
    url: postUrl,
    isPillarPage: false,
  })

  // Generate Breadcrumb structured data
  const breadcrumbSchema = generateBreadcrumbStructuredData([
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'Blog',
      url: '/blog',
    },
    {
      name: post.title,
      url: postUrl,
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
      <BlogPostClient post={post} />
    </>
  )
}
