import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/kennisbank/articles - List articles with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = await getServerSession(authOptions)

    // Query params
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const audience = searchParams.get('audience')
    const easyRead = searchParams.get('easyRead') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const pillar = searchParams.get('pillar') === 'true'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // Build where clause
    const where: any = {
      isPublished: true,
    }

    // Category filter
    if (category) {
      where.category = { slug: category }
    }

    // Article type filter
    if (type) {
      where.articleType = type
    }

    // Target audience filter
    if (audience) {
      where.targetAudience = { has: audience }
    }

    // Easy Read filter
    if (easyRead) {
      where.hasEasyRead = true
    }

    // Featured filter
    if (featured) {
      where.isFeatured = true
    }

    // Pillar pages filter
    if (pillar) {
      where.isPillarPage = true
    }

    // Search filter
    if (search) {
      where.OR = [
        { titleNl: { contains: search, mode: 'insensitive' } },
        { excerptNl: { contains: search, mode: 'insensitive' } },
        { keywords: { has: search.toLowerCase() } },
      ]
    }

    // Check if user has access to professional content
    let canAccessProfessional = false
    if (session?.user?.id) {
      const professional = await prisma.professionalAccount.findUnique({
        where: { userId: session.user.id },
      })
      canAccessProfessional = professional?.isVerified || false
    }

    // Exclude professional-only categories for non-professionals
    if (!canAccessProfessional) {
      where.category = {
        ...where.category,
        isProfessionalOnly: false,
      }
    }

    // Get articles with pagination
    const [articles, total] = await Promise.all([
      prisma.knowledgeBaseArticle.findMany({
        where,
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
          _count: {
            select: {
              feedback: true,
            },
          },
        },
        orderBy: [
          { isPillarPage: 'desc' },
          { isFeatured: 'desc' },
          { publishedAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.knowledgeBaseArticle.count({ where }),
    ])

    // Format response
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      title: article.titleNl,
      slug: article.slug,
      excerpt: article.excerptNl,
      featuredImage: article.featuredImage,
      articleType: article.articleType,
      hasEasyRead: article.hasEasyRead,
      readingLevel: article.readingLevel,
      isPillarPage: article.isPillarPage,
      isFeatured: article.isFeatured,
      targetAudience: article.targetAudience,
      keywords: article.keywords,
      viewCount: article.viewCount,
      helpfulCount: article.helpfulCount,
      publishedAt: article.publishedAt,
      category: {
        name: article.category.nameNl,
        slug: article.category.slug,
        icon: article.category.icon,
        color: article.category.color,
      },
      author: article.author?.name || 'Redactie',
      feedbackCount: article._count.feedback,
      // Calculate estimated read time (200 words per minute)
      readTime: Math.ceil(article.contentNl.split(/\s+/).length / 200),
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
          hasMore: page * limit < total,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van artikelen' },
      { status: 500 }
    )
  }
}

// POST /api/kennisbank/articles - Create new article (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Check permission
    const canCreate = await hasPermission(session.user.id, 'CREATE_KB_ARTICLES')
    if (!canCreate) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om artikelen te maken' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      title,
      titleNl,
      slug,
      content,
      contentNl,
      contentEasyRead,
      excerpt,
      excerptNl,
      featuredImage,
      featuredVideo,
      audioVersion,
      categoryId,
      articleType = 'STANDARD',
      keywords = [],
      metaTitle,
      metaDescription,
      isPillarPage = false,
      pillarPageId,
      targetAudience = ['GENERAL'],
      readingLevel = 'STANDARD',
      isPublished = false,
      isFeatured = false,
    } = body

    // Validation
    if (!titleNl || !slug || !contentNl || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Verplichte velden ontbreken' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingArticle = await prisma.knowledgeBaseArticle.findUnique({
      where: { slug },
    })

    if (existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Deze slug bestaat al' },
        { status: 400 }
      )
    }

    // Create article
    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title: title || titleNl,
        titleNl,
        slug,
        content: content || contentNl,
        contentNl,
        contentEasyRead,
        hasEasyRead: !!contentEasyRead,
        excerpt,
        excerptNl,
        featuredImage,
        featuredVideo,
        audioVersion,
        categoryId,
        articleType,
        keywords,
        metaTitle,
        metaDescription,
        isPillarPage,
        pillarPageId,
        targetAudience,
        readingLevel,
        isPublished,
        isFeatured,
        publishedAt: isPublished ? new Date() : null,
        authorId: session.user.id,
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
    console.error('Error creating article:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het maken van het artikel' },
      { status: 500 }
    )
  }
}
