import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/kennisbank/stats - Get kennisbank statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    // Get article stats
    const [
      totalArticles,
      publishedArticles,
      pillarArticles,
      totalCategories,
      totalTools,
      totalFeedback,
      helpfulFeedback,
      totalViews,
      recentArticles,
    ] = await Promise.all([
      prisma.knowledgeBaseArticle.count(),
      prisma.knowledgeBaseArticle.count({ where: { isPublished: true } }),
      prisma.knowledgeBaseArticle.count({ where: { isPillarPage: true } }),
      prisma.knowledgeBaseCategory.count(),
      prisma.knowledgeBaseTool.count(),
      prisma.knowledgeBaseFeedback.count(),
      prisma.knowledgeBaseFeedback.count({ where: { isHelpful: true } }),
      prisma.knowledgeBaseArticle.aggregate({
        _sum: { viewCount: true },
      }),
      prisma.knowledgeBaseArticle.findMany({
        select: {
          id: true,
          titleNl: true,
          slug: true,
          viewCount: true,
          isPublished: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          draft: totalArticles - publishedArticles,
          pillar: pillarArticles,
        },
        categories: totalCategories,
        tools: totalTools,
        feedback: {
          total: totalFeedback,
          helpful: helpfulFeedback,
          notHelpful: totalFeedback - helpfulFeedback,
        },
        views: totalViews._sum.viewCount || 0,
        recentArticles,
      },
    })
  } catch (error) {
    console.error('Error fetching kennisbank stats:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van statistieken' },
      { status: 500 }
    )
  }
}
