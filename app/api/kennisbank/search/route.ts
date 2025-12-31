import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/kennisbank/search - Full-text search across kennisbank
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = await getServerSession(authOptions)

    const query = searchParams.get('q')?.trim()
    const type = searchParams.get('type') // article, glossary, tool
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Zoekterm moet minimaal 2 karakters zijn' },
        { status: 400 }
      )
    }

    // Check professional access
    let canAccessProfessional = false
    if (session?.user?.id) {
      const professional = await prisma.professionalAccount.findUnique({
        where: { userId: session.user.id },
      })
      canAccessProfessional = professional?.isVerified || false
    }

    // Build article search
    const articleWhere: any = {
      isPublished: true,
      OR: [
        { titleNl: { contains: query, mode: 'insensitive' } },
        { excerptNl: { contains: query, mode: 'insensitive' } },
        { contentNl: { contains: query, mode: 'insensitive' } },
        { keywords: { has: query.toLowerCase() } },
      ],
    }

    // Filter by type
    if (type === 'glossary') {
      articleWhere.articleType = 'GLOSSARY'
    } else if (type === 'article') {
      articleWhere.articleType = { not: 'GLOSSARY' }
    }

    // Filter by category
    if (category) {
      articleWhere.category = { slug: category }
    }

    // Exclude professional content for non-professionals
    if (!canAccessProfessional) {
      articleWhere.category = {
        ...articleWhere.category,
        isProfessionalOnly: false,
      }
    }

    // Search articles
    const [articles, articleCount] = await Promise.all([
      prisma.knowledgeBaseArticle.findMany({
        where: articleWhere,
        include: {
          category: {
            select: {
              id: true,
              nameNl: true,
              slug: true,
              icon: true,
              color: true,
            },
          },
        },
        orderBy: [
          { isPillarPage: 'desc' },
          { isFeatured: 'desc' },
          { viewCount: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.knowledgeBaseArticle.count({ where: articleWhere }),
    ])

    // Search tools (if not filtering by article type)
    let tools: any[] = []
    let toolCount = 0
    if (!type || type === 'tool') {
      const toolWhere = {
        isActive: true,
        OR: [
          { nameNl: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ],
      }

      ;[tools, toolCount] = await Promise.all([
        prisma.knowledgeBaseTool.findMany({
          where: toolWhere,
          orderBy: { usageCount: 'desc' },
          take: type === 'tool' ? limit : 5,
        }),
        prisma.knowledgeBaseTool.count({ where: toolWhere }),
      ])
    }

    // Format results
    const formattedArticles = articles.map((article) => ({
      id: article.id,
      type: article.articleType === 'GLOSSARY' ? 'glossary' : 'article',
      title: article.titleNl,
      slug: article.slug,
      excerpt: article.excerptNl,
      category: {
        name: article.category.nameNl,
        slug: article.category.slug,
        icon: article.category.icon,
        color: article.category.color,
      },
      isPillarPage: article.isPillarPage,
      isFeatured: article.isFeatured,
      viewCount: article.viewCount,
      readTime: Math.ceil(article.contentNl.split(/\s+/).length / 200),
    }))

    const formattedTools = tools.map((tool) => ({
      id: tool.id,
      type: 'tool',
      title: tool.nameNl,
      slug: tool.slug,
      excerpt: tool.description,
      toolType: tool.toolType,
      usageCount: tool.usageCount,
    }))

    // Combine results
    const allResults = [...formattedArticles, ...formattedTools]

    return NextResponse.json({
      success: true,
      data: {
        results: allResults,
        counts: {
          articles: articleCount,
          tools: toolCount,
          total: articleCount + toolCount,
        },
        pagination: {
          page,
          limit,
          total: type === 'tool' ? toolCount : articleCount,
          pages: Math.ceil((type === 'tool' ? toolCount : articleCount) / limit),
          hasMore: page * limit < (type === 'tool' ? toolCount : articleCount),
        },
        query,
      },
    })
  } catch (error) {
    console.error('Error searching kennisbank:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het zoeken' },
      { status: 500 }
    )
  }
}
