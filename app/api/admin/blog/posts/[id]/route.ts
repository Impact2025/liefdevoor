import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidateCache, CACHE_TAGS } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { name: true } },
        category: { select: { id: true, name: true, color: true } }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, categoryId, excerpt, featuredImage, bannerText, published, showOnMainBlog, publishedAt, applyAiOptimization = false } = await request.json()

    let slug = undefined
    if (title) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const existingPost = await prisma.post.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      })

      if (existingPost) {
        return NextResponse.json({ error: 'Slug already exists. Please choose a different title.' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (slug !== undefined) updateData.slug = slug
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (bannerText !== undefined) updateData.bannerText = bannerText
    if (published !== undefined) updateData.published = published
    if (showOnMainBlog !== undefined) updateData.showOnMainBlog = showOnMainBlog
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt ? new Date(publishedAt) : null

    if (applyAiOptimization && title && content && categoryId) {
      try {
        console.log('[Blog Optimizer] Starting content optimization for update...')
        const { optimizeBlogContent } = await import('@/lib/blog/optimizer')

        // Fetch internal pages for linking
        const [publishedPosts, kennisbankArticles] = await Promise.all([
          prisma.post.findMany({
            where: { published: true, id: { not: id } },
            select: { title: true, slug: true, excerpt: true },
            orderBy: { createdAt: 'desc' },
            take: 40,
          }),
          prisma.knowledgeBaseArticle.findMany({
            where: { isPublished: true },
            select: { titleNl: true, slug: true, excerptNl: true, category: { select: { slug: true } } },
            take: 20,
          }).catch(() => [] as any[]),
        ])

        const internalPages = [
          { url: '/register', title: 'Registreer gratis – Liefde Voor Iedereen', desc: 'Gratis account aanmaken' },
          { url: '/features', title: 'Premium functies', desc: 'Overzicht van premium abonnement' },
          { url: '/veilig-daten', title: 'Veilig daten tips', desc: 'Veiligheid bij online daten' },
          { url: '/over-ons', title: 'Over Liefde Voor Iedereen', desc: 'Over het platform' },
          ...(publishedPosts as any[]).map((p: any) => ({
            url: `/blog/${p.slug}`,
            title: p.title,
            desc: p.excerpt || 'Blog artikel'
          })),
          ...(kennisbankArticles as any[]).map((a: any) => ({
            url: `/kennisbank/${a.category?.slug}/${a.slug}`,
            title: a.titleNl,
            desc: a.excerptNl || 'Kennisbank artikel'
          })),
        ]

        const optimized = await optimizeBlogContent({
          title,
          content,
          categoryId,
          excerpt,
          internalPages,
        })

        // Programmatically guarantee ≥10 internal links regardless of AI output
        const { injectInternalLinks } = await import('@/lib/blog/link-injector')
        const contentWithLinks = injectInternalLinks(optimized.optimizedContent, internalPages, 10)

        updateData.content = contentWithLinks
        updateData.excerpt = optimized.excerpt
        updateData.seoTitle = optimized.seoTitle
        updateData.seoDescription = optimized.seoDescription
        updateData.keywords = optimized.keywords
        updateData.socialMedia = optimized.socialMedia
        updateData.imagePrompt = optimized.imagePrompt
        updateData.aiOptimized = true

        console.log('[Blog Optimizer] Content optimized with internal links')
      } catch (error) {
        console.error('[Blog Optimizer] Optimization failed during update:', error)
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, color: true } }
      }
    })

    // Invalidate cache (non-blocking)
    try {
      await revalidateCache(CACHE_TAGS.BLOG_POSTS)
      await revalidateCache(CACHE_TAGS.BLOG_POST)
      console.log('[Blog Posts] Cache invalidated after post update')
    } catch (cacheError) {
      console.warn('[Blog Posts] Cache invalidation failed:', cacheError)
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.post.delete({
      where: { id }
    })

    // Invalidate cache (non-blocking, don't fail delete if cache fails)
    try {
      await revalidateCache(CACHE_TAGS.BLOG_POSTS)
      await revalidateCache(CACHE_TAGS.BLOG_POST)
      console.log('[Blog Posts] Cache invalidated after post deletion')
    } catch (cacheError) {
      console.warn('[Blog Posts] Cache invalidation failed:', cacheError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}
