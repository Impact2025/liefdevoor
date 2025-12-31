import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/admin/kennisbank/articles - List all articles (including drafts)
export async function GET(request: NextRequest) {
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
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const published = searchParams.get('published')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // Build where clause
    const where: any = {}

    if (category) {
      where.category = { slug: category }
    }

    if (type) {
      where.articleType = type
    }

    if (published === 'true') {
      where.isPublished = true
    } else if (published === 'false') {
      where.isPublished = false
    }

    if (search) {
      where.OR = [
        { titleNl: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeBaseArticle.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              nameNl: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.knowledgeBaseArticle.count({ where }),
    ])

    const formattedArticles = articles.map((article) => ({
      id: article.id,
      titleNl: article.titleNl,
      slug: article.slug,
      articleType: article.articleType,
      isPublished: article.isPublished,
      isFeatured: article.isFeatured,
      isPillarPage: article.isPillarPage,
      hasEasyRead: article.hasEasyRead,
      viewCount: article.viewCount,
      helpfulCount: article.helpfulCount,
      category: {
        nameNl: article.category.nameNl,
        slug: article.category.slug,
      },
      author: article.author?.name || 'Onbekend',
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        articles: formattedArticles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching admin articles:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van artikelen' },
      { status: 500 }
    )
  }
}
