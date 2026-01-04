import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/kennisbank/articles/[id] - Get single article by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const easyRead = searchParams.get('easyRead') === 'true'
    const idOrSlug = params.id

    // Find by ID or slug
    const article = await prisma.knowledgeBaseArticle.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
        isPublished: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameNl: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tools: {
          include: {
            tool: {
              select: {
                id: true,
                name: true,
                nameNl: true,
                slug: true,
                toolType: true,
                externalUrl: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        relatedFrom: {
          include: {
            targetArticle: {
              select: {
                id: true,
                titleNl: true,
                slug: true,
                excerptNl: true,
                featuredImage: true,
              },
            },
          },
          orderBy: { order: 'asc' },
          take: 5,
        },
        clusterArticles: {
          where: { isPublished: true },
          select: {
            id: true,
            titleNl: true,
            slug: true,
            excerptNl: true,
          },
          take: 10,
        },
        pillarPage: {
          select: {
            id: true,
            titleNl: true,
            slug: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artikel niet gevonden' },
        { status: 404 }
      )
    }

    // Increment view count (fire and forget)
    prisma.knowledgeBaseArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {}) // Ignore errors

    // Calculate read time
    const wordCount = article.contentNl.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    // Format response
    const response = {
      id: article.id,
      title: article.title,
      titleNl: article.titleNl,
      slug: article.slug,
      // Return all content fields for frontend to handle
      content: article.content,
      contentNl: article.contentNl,
      contentEasyRead: article.contentEasyRead,
      hasEasyRead: article.hasEasyRead,
      excerpt: article.excerpt,
      excerptNl: article.excerptNl,
      featuredImage: article.featuredImage,
      featuredVideo: article.featuredVideo,
      audioVersion: article.audioVersion,
      articleType: article.articleType,
      readingLevel: article.readingLevel,
      isPillarPage: article.isPillarPage,
      isFeatured: article.isFeatured,
      targetAudience: article.targetAudience,
      keywords: article.keywords,
      metaTitle: article.metaTitle || article.titleNl,
      metaDescription: article.metaDescription || article.excerptNl,
      canonicalUrl: article.canonicalUrl,
      viewCount: article.viewCount,
      helpfulCount: article.helpfulCount,
      notHelpfulCount: article.notHelpfulCount,
      readTime,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      category: {
        name: article.category.name,
        nameNl: article.category.nameNl,
        slug: article.category.slug,
        icon: article.category.icon,
        color: article.category.color,
      },
      author: {
        name: article.author?.name || 'Redactie',
      },
      tools: article.tools.map((t) => ({
        name: t.tool.nameNl,
        slug: t.tool.slug,
        type: t.tool.toolType,
        externalUrl: t.tool.externalUrl,
      })),
      relatedArticles: article.relatedFrom.map((r) => ({
        title: r.targetArticle.titleNl,
        slug: r.targetArticle.slug,
        excerpt: r.targetArticle.excerptNl,
        featuredImage: r.targetArticle.featuredImage,
      })),
      clusterArticles: article.clusterArticles.map((c) => ({
        title: c.titleNl,
        slug: c.slug,
        excerpt: c.excerptNl,
      })),
      pillarPage: article.pillarPage ? {
        title: article.pillarPage.titleNl,
        slug: article.pillarPage.slug,
      } : null,
    }

    return NextResponse.json({
      success: true,
      data: { article: response },
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van het artikel' },
      { status: 500 }
    )
  }
}

// PATCH /api/kennisbank/articles/[id] - Update article (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Check permission
    const canEdit = await hasPermission(session.user.id, 'EDIT_KB_ARTICLES')
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om artikelen te bewerken' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const articleId = params.id

    // Check if article exists
    const existingArticle = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: articleId },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Artikel niet gevonden' },
        { status: 404 }
      )
    }

    // Check if slug is unique (if changed)
    if (body.slug && body.slug !== existingArticle.slug) {
      const slugExists = await prisma.knowledgeBaseArticle.findUnique({
        where: { slug: body.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Deze slug bestaat al' },
          { status: 400 }
        )
      }
    }

    // Handle publishing
    const wasPublished = existingArticle.isPublished
    const willBePublished = body.isPublished ?? wasPublished

    // Check publish permission
    if (!wasPublished && willBePublished) {
      const canPublish = await hasPermission(session.user.id, 'PUBLISH_KB_ARTICLES')
      if (!canPublish) {
        return NextResponse.json(
          { success: false, error: 'Geen toegang om artikelen te publiceren' },
          { status: 403 }
        )
      }
    }

    // Update article
    const article = await prisma.knowledgeBaseArticle.update({
      where: { id: articleId },
      data: {
        ...body,
        hasEasyRead: body.contentEasyRead ? true : existingArticle.hasEasyRead,
        publishedAt: !wasPublished && willBePublished ? new Date() : existingArticle.publishedAt,
        reviewedById: session.user.id,
        lastReviewedAt: new Date(),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: { article },
    })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het bijwerken van het artikel' },
      { status: 500 }
    )
  }
}

// DELETE /api/kennisbank/articles/[id] - Delete article (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Check permission
    const canDelete = await hasPermission(session.user.id, 'DELETE_KB_ARTICLES')
    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om artikelen te verwijderen' },
        { status: 403 }
      )
    }

    const articleId = params.id

    // Check if article exists
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artikel niet gevonden' },
        { status: 404 }
      )
    }

    // Delete article (cascade deletes feedback and relations)
    await prisma.knowledgeBaseArticle.delete({
      where: { id: articleId },
    })

    return NextResponse.json({
      success: true,
      message: 'Artikel verwijderd',
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het verwijderen van het artikel' },
      { status: 500 }
    )
  }
}
