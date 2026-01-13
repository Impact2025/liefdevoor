/**
 * Migration Dashboard Stats API
 *
 * Returns comprehensive statistics for migration campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify authorization (admin only)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Check if user is admin via session
      // For now, allow access in development
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Get overall statistics
    const overallStats = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*) as "total",
        COUNT(*) FILTER (WHERE segment = 'VIP') as "totalVIP",
        COUNT(*) FILTER (WHERE segment = 'GOLD') as "totalGold",
        COUNT(*) FILTER (WHERE segment = 'ACTIVE') as "totalActive",
        COUNT(*) FILTER (WHERE segment = 'DORMANT') as "totalDormant",
        COUNT(*) FILTER (WHERE segment = 'INACTIVE') as "totalInactive",
        COUNT(*) FILTER (WHERE status = 'PENDING') as "pending",
        COUNT(*) FILTER (WHERE status = 'EMAIL_SENT') as "emailSent",
        COUNT(*) FILTER (WHERE status = 'EMAIL_OPENED') as "emailOpened",
        COUNT(*) FILTER (WHERE status = 'LINK_CLICKED') as "linkClicked",
        COUNT(*) FILTER (WHERE status = 'LANDING_VISITED') as "landingVisited",
        COUNT(*) FILTER (WHERE status = 'CLAIM_STARTED') as "claimStarted",
        COUNT(*) FILTER (WHERE status = 'CLAIMED') as "claimed",
        COUNT(*) FILTER (WHERE status = 'ACTIVATED') as "activated",
        COUNT(*) FILTER (WHERE status = 'EXPIRED') as "expired"
      FROM "MigrationUser"
    `

    // Get email statistics
    const emailStats = await prisma.$queryRaw<any[]>`
      SELECT
        "emailType",
        COUNT(*) as "sent",
        COUNT(*) FILTER (WHERE "openedAt" IS NOT NULL) as "opened",
        COUNT(*) FILTER (WHERE "clickedAt" IS NOT NULL) as "clicked"
      FROM "MigrationEmail"
      GROUP BY "emailType"
      ORDER BY "emailType"
    `

    // Get daily activity for last 30 days
    const dailyActivity = await prisma.$queryRaw<any[]>`
      SELECT
        DATE("sentAt") as "date",
        COUNT(*) as "emailsSent",
        COUNT(*) FILTER (WHERE "openedAt" IS NOT NULL) as "emailsOpened",
        COUNT(*) FILTER (WHERE "clickedAt" IS NOT NULL) as "linksClicked"
      FROM "MigrationEmail"
      WHERE "sentAt" > NOW() - INTERVAL '30 days'
      GROUP BY DATE("sentAt")
      ORDER BY "date" DESC
    `

    // Get recent activations
    const recentActivations = await prisma.$queryRaw<any[]>`
      SELECT
        "firstName",
        segment,
        "claimedAt",
        "couponCode"
      FROM "MigrationUser"
      WHERE status IN ('CLAIMED', 'ACTIVATED')
      AND "claimedAt" > NOW() - INTERVAL '7 days'
      ORDER BY "claimedAt" DESC
      LIMIT 10
    `

    // Get conversion funnel
    const stats = overallStats[0] || {}
    const total = Number(stats.total) || 1
    const conversionRates = {
      openRate: Number(stats.emailOpened) > 0
        ? ((Number(stats.emailOpened) + Number(stats.linkClicked) + Number(stats.landingVisited) + Number(stats.claimStarted) + Number(stats.claimed) + Number(stats.activated)) / (total - Number(stats.pending)) * 100).toFixed(1)
        : '0',
      clickRate: Number(stats.linkClicked) > 0
        ? ((Number(stats.linkClicked) + Number(stats.landingVisited) + Number(stats.claimStarted) + Number(stats.claimed) + Number(stats.activated)) / (total - Number(stats.pending)) * 100).toFixed(1)
        : '0',
      visitRate: Number(stats.landingVisited) > 0
        ? ((Number(stats.landingVisited) + Number(stats.claimStarted) + Number(stats.claimed) + Number(stats.activated)) / (total - Number(stats.pending)) * 100).toFixed(1)
        : '0',
      claimRate: ((Number(stats.claimed) + Number(stats.activated)) / total * 100).toFixed(1),
      activationRate: (Number(stats.activated) / total * 100).toFixed(1)
    }

    // Segment performance
    const segmentPerformance = await prisma.$queryRaw<any[]>`
      SELECT
        segment,
        COUNT(*) as "total",
        COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED')) as "converted",
        ROUND(
          COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED'))::numeric /
          NULLIF(COUNT(*), 0) * 100, 1
        ) as "conversionRate"
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

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total: Number(stats.total),
          bySegment: {
            VIP: Number(stats.totalVIP),
            GOLD: Number(stats.totalGold),
            ACTIVE: Number(stats.totalActive),
            DORMANT: Number(stats.totalDormant),
            INACTIVE: Number(stats.totalInactive)
          },
          byStatus: {
            pending: Number(stats.pending),
            emailSent: Number(stats.emailSent),
            emailOpened: Number(stats.emailOpened),
            linkClicked: Number(stats.linkClicked),
            landingVisited: Number(stats.landingVisited),
            claimStarted: Number(stats.claimStarted),
            claimed: Number(stats.claimed),
            activated: Number(stats.activated),
            expired: Number(stats.expired)
          }
        },
        conversionRates,
        emailPerformance: emailStats.map(e => ({
          type: e.emailType,
          sent: Number(e.sent),
          opened: Number(e.opened),
          clicked: Number(e.clicked),
          openRate: (Number(e.opened) / Number(e.sent) * 100).toFixed(1),
          clickRate: (Number(e.clicked) / Number(e.sent) * 100).toFixed(1)
        })),
        segmentPerformance: segmentPerformance.map(s => ({
          segment: s.segment,
          total: Number(s.total),
          converted: Number(s.converted),
          conversionRate: Number(s.conversionRate) || 0
        })),
        dailyActivity: dailyActivity.map(d => ({
          date: d.date,
          emailsSent: Number(d.emailsSent),
          emailsOpened: Number(d.emailsOpened),
          linksClicked: Number(d.linksClicked)
        })),
        recentActivations: recentActivations.map(a => ({
          name: a.firstName,
          segment: a.segment,
          claimedAt: a.claimedAt,
          couponUsed: !!a.couponCode
        }))
      }
    })
  } catch (error) {
    console.error('[Migration Stats] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
