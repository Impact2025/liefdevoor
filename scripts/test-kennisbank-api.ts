/**
 * Test Kennisbank API endpoints
 *
 * This simulates what the browser does when calling the API
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testStatsAPI() {
  console.log('🧪 Testing Kennisbank Stats API Logic...\n')

  try {
    // Simulate what the API does
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

    const stats = {
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
    }

    console.log('✅ Stats API would return:')
    console.log(JSON.stringify(stats, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testStatsAPI()
  .finally(() => prisma.$disconnect())
