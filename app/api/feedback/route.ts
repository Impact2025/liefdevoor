/**
 * Feedback Survey API (World-Class Version)
 *
 * POST: Save survey response with analytics tracking
 * GET: Get survey stats and responses (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      satisfaction,
      easeOfUse,
      designRating,
      missingFeatures,
      otherMissing,
      bestFeature,
      improvements,
      wouldRecommend,
      additionalComments,
      completionTime,
      questionTimes
    } = body

    // Get user's migration segment if logged in
    let segment = null
    if (session?.user?.id) {
      const migrationUser = await prisma.$queryRaw<any[]>`
        SELECT segment FROM "MigrationUser"
        WHERE "newUserId" = ${session.user.id}
        LIMIT 1
      `
      segment = migrationUser[0]?.segment || null
    }

    // Save to database - use Prisma.raw for JSONB casting
    const missingFeaturesJson = JSON.stringify(missingFeatures || [])
    const questionTimesJson = JSON.stringify(questionTimes || {})

    await prisma.$executeRawUnsafe(`
      INSERT INTO "FeedbackSurvey" (
        id,
        "userId",
        satisfaction,
        "easeOfUse",
        "designRating",
        "missingFeatures",
        "otherMissing",
        "bestFeature",
        improvements,
        "wouldRecommend",
        "additionalComments",
        "completionTime",
        "questionTimes",
        segment,
        "createdAt"
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5::jsonb,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12::jsonb,
        $13,
        NOW()
      )
    `,
      session?.user?.id || null,
      satisfaction,
      easeOfUse,
      designRating,
      missingFeaturesJson,
      otherMissing || null,
      bestFeature || null,
      improvements || null,
      wouldRecommend,
      additionalComments || null,
      completionTime || null,
      questionTimesJson,
      segment
    )

    // Award 5 SuperMessages if user is logged in
    if (session?.user?.id) {
      try {
        await prisma.$executeRaw`
          UPDATE "User"
          SET "superMessagesBalance" = COALESCE("superMessagesBalance", 0) + 5
          WHERE id = ${session.user.id}
        `
      } catch (e) {
        // Ignore if update fails
      }
    }

    // Check if detractor and schedule follow-up
    if (wouldRecommend <= 6 && session?.user?.id) {
      // Could trigger a follow-up email here
      console.log(`[Feedback] Detractor alert: User ${session.user.id} gave NPS ${wouldRecommend}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback opgeslagen!',
      reward: {
        type: 'superMessages',
        amount: 5
      }
    })
  } catch (error) {
    console.error('[Feedback API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Kon feedback niet opslaan' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all responses
    const responses = await prisma.$queryRaw<any[]>`
      SELECT
        fs.*,
        mu.segment as "migrationSegment"
      FROM "FeedbackSurvey" fs
      LEFT JOIN "MigrationUser" mu ON mu."newUserId" = fs."userId"
      ORDER BY fs."createdAt" DESC
    `

    // Get overall stats
    const stats = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int as total,
        AVG(satisfaction)::numeric(3,2) as avg_satisfaction,
        AVG("easeOfUse")::numeric(3,2) as avg_ease,
        AVG("designRating")::numeric(3,2) as avg_design,
        AVG("wouldRecommend")::numeric(3,2) as avg_nps,
        AVG("completionTime")::int as avg_completion_time
      FROM "FeedbackSurvey"
    `

    // Calculate NPS
    const npsData = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(CASE WHEN "wouldRecommend" >= 9 THEN 1 END)::int as promoters,
        COUNT(CASE WHEN "wouldRecommend" >= 7 AND "wouldRecommend" <= 8 THEN 1 END)::int as passives,
        COUNT(CASE WHEN "wouldRecommend" <= 6 THEN 1 END)::int as detractors,
        COUNT(*)::int as total
      FROM "FeedbackSurvey"
    `

    const nps = npsData[0]
    const npsScore = nps.total > 0
      ? Math.round(((nps.promoters - nps.detractors) / nps.total) * 100)
      : 0

    // Get stats by segment
    const segmentStats = await prisma.$queryRaw<any[]>`
      SELECT
        COALESCE(mu.segment, 'UNKNOWN') as segment,
        COUNT(*)::int as total,
        AVG(fs."wouldRecommend")::numeric(3,2) as avg_nps,
        COUNT(CASE WHEN fs."wouldRecommend" >= 9 THEN 1 END)::int as promoters,
        COUNT(CASE WHEN fs."wouldRecommend" <= 6 THEN 1 END)::int as detractors
      FROM "FeedbackSurvey" fs
      LEFT JOIN "MigrationUser" mu ON mu."newUserId" = fs."userId"
      GROUP BY COALESCE(mu.segment, 'UNKNOWN')
      ORDER BY total DESC
    `

    // Get daily responses
    const dailyResponses = await prisma.$queryRaw<any[]>`
      SELECT
        DATE("createdAt") as date,
        COUNT(*)::int as count
      FROM "FeedbackSurvey"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Get missing features breakdown
    const missingFeaturesRaw = await prisma.$queryRaw<any[]>`
      SELECT "missingFeatures"
      FROM "FeedbackSurvey"
      WHERE "missingFeatures" IS NOT NULL
    `

    const missingFeaturesCounts: Record<string, number> = {}
    missingFeaturesRaw.forEach(row => {
      const features = row.missingFeatures || []
      features.forEach((f: string) => {
        missingFeaturesCounts[f] = (missingFeaturesCounts[f] || 0) + 1
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: stats[0],
        nps: {
          score: npsScore,
          promoters: nps.promoters,
          passives: nps.passives,
          detractors: nps.detractors
        },
        segmentStats,
        dailyResponses,
        missingFeaturesCounts,
        responses
      }
    })
  } catch (error) {
    console.error('[Feedback API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Kon stats niet ophalen',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
