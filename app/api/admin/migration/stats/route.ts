/**
 * Migration Stats API for Admin Dashboard
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Overall stats
    const stats = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int as total,
        COUNT(CASE WHEN status::text = 'PENDING' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status::text = 'EMAIL_SENT' THEN 1 END)::int as email_sent,
        COUNT(CASE WHEN status::text = 'LANDING_VISITED' THEN 1 END)::int as landing_visited,
        COUNT(CASE WHEN status::text = 'CLAIM_STARTED' THEN 1 END)::int as claim_started,
        COUNT(CASE WHEN status::text IN ('CLAIMED', 'ACTIVATED') THEN 1 END)::int as activated
      FROM "MigrationUser"
    `

    // Per segment stats
    const segmentStats = await prisma.$queryRaw<any[]>`
      SELECT
        segment,
        COUNT(*)::int as total,
        COUNT(CASE WHEN status::text = 'PENDING' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status::text != 'PENDING' THEN 1 END)::int as sent,
        COUNT(CASE WHEN status::text IN ('CLAIMED', 'ACTIVATED') THEN 1 END)::int as activated
      FROM "MigrationUser"
      GROUP BY segment
      ORDER BY
        CASE segment
          WHEN 'VIP' THEN 1
          WHEN 'GOLD' THEN 2
          WHEN 'ACTIVE' THEN 3
          WHEN 'DORMANT' THEN 4
          WHEN 'INACTIVE' THEN 5
        END
    `

    // Recent activations
    const recentActivations = await prisma.$queryRaw<any[]>`
      SELECT "firstName", "oldEmail", "claimedAt", segment
      FROM "MigrationUser"
      WHERE status::text IN ('CLAIMED', 'ACTIVATED')
      AND "claimedAt" IS NOT NULL
      ORDER BY "claimedAt" DESC
      LIMIT 10
    `

    // Today's stats
    const todayStats = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(CASE WHEN "lastEmailSentAt"::date = CURRENT_DATE THEN 1 END)::int as emails_today,
        COUNT(CASE WHEN "claimedAt"::date = CURRENT_DATE THEN 1 END)::int as activated_today
      FROM "MigrationUser"
    `

    // Hourly activity for today
    const hourlyActivity = await prisma.$queryRaw<any[]>`
      SELECT
        EXTRACT(HOUR FROM "lastEmailSentAt")::int as hour,
        COUNT(*)::int as count
      FROM "MigrationUser"
      WHERE "lastEmailSentAt"::date = CURRENT_DATE
      GROUP BY EXTRACT(HOUR FROM "lastEmailSentAt")
      ORDER BY hour
    `

    const s = stats[0]
    const emailsSent = s.email_sent + s.landing_visited + s.claim_started + s.activated

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: s.total,
          pending: s.pending,
          emailsSent,
          landingVisited: s.landing_visited + s.claim_started + s.activated,
          activated: s.activated,
          activatedWithLegacy: s.activated + 155 // +155 legacy
        },
        conversionRates: {
          emailToLanding: emailsSent > 0 ? ((s.landing_visited + s.claim_started + s.activated) / emailsSent * 100).toFixed(1) : '0',
          landingToActivated: (s.landing_visited + s.claim_started + s.activated) > 0
            ? (s.activated / (s.landing_visited + s.claim_started + s.activated) * 100).toFixed(1)
            : '0',
          overall: emailsSent > 0 ? (s.activated / emailsSent * 100).toFixed(1) : '0'
        },
        segments: segmentStats,
        recentActivations: recentActivations.map(a => ({
          ...a,
          claimedAt: a.claimedAt?.toISOString()
        })),
        today: todayStats[0],
        hourlyActivity
      }
    })
  } catch (error) {
    console.error('[Migration Stats API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
