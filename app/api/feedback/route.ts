/**
 * Feedback Survey API
 *
 * POST: Save survey response
 * GET: Get survey stats (admin)
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
      additionalComments
    } = body

    // Save to database using raw query (table may not be in Prisma schema yet)
    await prisma.$executeRaw`
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
        "createdAt"
      ) VALUES (
        gen_random_uuid(),
        ${session?.user?.id || null},
        ${satisfaction},
        ${easeOfUse},
        ${designRating},
        ${JSON.stringify(missingFeatures)},
        ${otherMissing || null},
        ${bestFeature || null},
        ${improvements || null},
        ${wouldRecommend},
        ${additionalComments || null},
        NOW()
      )
    `

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

    return NextResponse.json({
      success: true,
      message: 'Feedback opgeslagen!'
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

    // Get survey stats
    const responses = await prisma.$queryRaw<any[]>`
      SELECT * FROM "FeedbackSurvey"
      ORDER BY "createdAt" DESC
    `

    const stats = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int as total,
        AVG(satisfaction)::numeric(3,2) as avg_satisfaction,
        AVG("easeOfUse")::numeric(3,2) as avg_ease,
        AVG("designRating")::numeric(3,2) as avg_design,
        AVG("wouldRecommend")::numeric(3,2) as avg_nps
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
        responses
      }
    })
  } catch (error) {
    console.error('[Feedback API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Kon stats niet ophalen' },
      { status: 500 }
    )
  }
}
