import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCached } from '@/lib/migration/cache'

/**
 * Migration Campaign Dashboard API
 * Returns comprehensive stats for admin dashboard
 */
export async function GET(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin permissions
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })

  if (user?.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Use cached data (60s TTL)
    const stats = await getCached('DASHBOARD_STATS', async () => {
      return await fetchMigrationDashboardStats()
    })

    return Response.json(stats)
  } catch (error) {
    console.error('[Dashboard API] Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function fetchMigrationDashboardStats() {
  const [overview, funnel, segments, emailMetrics, abTests, recentClaims] = await Promise.all([
    getOverview(),
    getFunnelMetrics(),
    getSegmentPerformance(),
    getEmailMetrics(),
    getABTestResults(),
    getRecentClaims(10)
  ])

  return {
    overview,
    funnel,
    segments,
    emailMetrics,
    abTests,
    recentClaims,
    generatedAt: new Date().toISOString()
  }
}

async function getOverview() {
  const result = await prisma.$queryRaw<{
    totalUsers: bigint
    claimed: bigint
    activated: bigint
    emailsSent: bigint
  }[]>`
    SELECT
      COUNT(*) as "totalUsers",
      COUNT(*) FILTER (WHERE status::text IN ('CLAIMED', 'ACTIVATED')) as claimed,
      COUNT(*) FILTER (WHERE status::text = 'ACTIVATED') as activated,
      COUNT(*) FILTER (WHERE status::text != 'PENDING') as "emailsSent"
    FROM "MigrationUser"
  `

  const totalUsers = Number(result[0]?.totalUsers || 0)
  const claimed = Number(result[0]?.claimed || 0)
  const activated = Number(result[0]?.activated || 0)
  const emailsSent = Number(result[0]?.emailsSent || 0)

  const conversionRate = emailsSent > 0 ? (claimed / emailsSent) * 100 : 0
  const activationRate = claimed > 0 ? (activated / claimed) * 100 : 0

  // Calculate estimated revenue (assuming €12.99/month average)
  const revenueImpact = claimed * 12.99

  return {
    totalUsers,
    claimed,
    activated,
    emailsSent,
    conversionRate: Number(conversionRate.toFixed(1)),
    activationRate: Number(activationRate.toFixed(1)),
    revenueImpact: Number(revenueImpact.toFixed(2))
  }
}

async function getFunnelMetrics() {
  const result = await prisma.$queryRaw<{
    emailSent: bigint
    emailOpened: bigint
    linkClicked: bigint
    landingVisited: bigint
    claimed: bigint
    activated: bigint
  }[]>`
    SELECT
      COUNT(*) FILTER (WHERE status::text IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "emailSent",
      COUNT(*) FILTER (WHERE status::text IN ('EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "emailOpened",
      COUNT(*) FILTER (WHERE status::text IN ('LINK_CLICKED', 'LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "linkClicked",
      COUNT(*) FILTER (WHERE status::text IN ('LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "landingVisited",
      COUNT(*) FILTER (WHERE status::text IN ('CLAIMED', 'ACTIVATED')) as claimed,
      COUNT(*) FILTER (WHERE status::text = 'ACTIVATED') as activated
    FROM "MigrationUser"
  `

  return {
    emailSent: Number(result[0]?.emailSent || 0),
    emailOpened: Number(result[0]?.emailOpened || 0),
    linkClicked: Number(result[0]?.linkClicked || 0),
    landingVisited: Number(result[0]?.landingVisited || 0),
    claimed: Number(result[0]?.claimed || 0),
    activated: Number(result[0]?.activated || 0)
  }
}

async function getSegmentPerformance() {
  const result = await prisma.$queryRaw<{
    segment: string
    total: bigint
    sent: bigint
    claimed: bigint
    activated: bigint
  }[]>`
    SELECT
      segment::text,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status::text != 'PENDING') as sent,
      COUNT(*) FILTER (WHERE status::text IN ('CLAIMED', 'ACTIVATED')) as claimed,
      COUNT(*) FILTER (WHERE status::text = 'ACTIVATED') as activated
    FROM "MigrationUser"
    GROUP BY segment
    ORDER BY
      CASE segment::text
        WHEN 'VIP' THEN 1
        WHEN 'GOLD' THEN 2
        WHEN 'ACTIVE' THEN 3
        WHEN 'DORMANT' THEN 4
        WHEN 'INACTIVE' THEN 5
      END
  `

  return result.map(r => ({
    segment: r.segment,
    total: Number(r.total),
    sent: Number(r.sent),
    claimed: Number(r.claimed),
    activated: Number(r.activated),
    conversionRate: Number(r.sent) > 0
      ? Number(((Number(r.claimed) / Number(r.sent)) * 100).toFixed(1))
      : 0
  }))
}

async function getEmailMetrics() {
  const result = await prisma.$queryRaw<{
    sent: bigint
    delivered: bigint
    opened: bigint
    clicked: bigint
    bounced: bigint
    totalOpens: bigint
    totalClicks: bigint
  }[]>`
    SELECT
      COUNT(*) as sent,
      COUNT("deliveredAt") as delivered,
      COUNT("openedAt") as opened,
      COUNT("clickedAt") as clicked,
      COUNT("bouncedAt") as bounced,
      SUM("openCount") as "totalOpens",
      SUM("clickCount") as "totalClicks"
    FROM "MigrationEmail"
  `

  const sent = Number(result[0]?.sent || 0)
  const delivered = Number(result[0]?.delivered || 0)
  const opened = Number(result[0]?.opened || 0)
  const clicked = Number(result[0]?.clicked || 0)
  const bounced = Number(result[0]?.bounced || 0)

  return {
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    deliveryRate: sent > 0 ? Number(((delivered / sent) * 100).toFixed(1)) : 0,
    openRate: sent > 0 ? Number(((opened / sent) * 100).toFixed(1)) : 0,
    clickRate: opened > 0 ? Number(((clicked / opened) * 100).toFixed(1)) : 0,
    bounceRate: sent > 0 ? Number(((bounced / sent) * 100).toFixed(1)) : 0
  }
}

async function getABTestResults() {
  const result = await prisma.$queryRaw<{
    abVariant: string | null
    sent: bigint
    opened: bigint
    clicked: bigint
  }[]>`
    SELECT
      "abVariant",
      COUNT(*) as sent,
      COUNT("openedAt") as opened,
      COUNT("clickedAt") as clicked
    FROM "MigrationEmail"
    WHERE "abVariant" IS NOT NULL
    GROUP BY "abVariant"
    ORDER BY "abVariant"
  `

  return result.map(r => ({
    variant: r.abVariant || 'unknown',
    sent: Number(r.sent),
    opened: Number(r.opened),
    clicked: Number(r.clicked),
    openRate: Number(r.sent) > 0
      ? Number(((Number(r.opened) / Number(r.sent)) * 100).toFixed(1))
      : 0,
    clickRate: Number(r.opened) > 0
      ? Number(((Number(r.clicked) / Number(r.opened)) * 100).toFixed(1))
      : 0
  }))
}

async function getRecentClaims(limit: number) {
  const claims = await prisma.migrationUser.findMany({
    where: {
      status: { in: ['CLAIMED', 'ACTIVATED'] }
    },
    select: {
      id: true,
      firstName: true,
      segment: true,
      claimedAt: true,
      status: true
    },
    orderBy: { claimedAt: 'desc' },
    take: limit
  })

  return claims.map(c => ({
    id: c.id,
    name: c.firstName,
    segment: c.segment,
    claimedAt: c.claimedAt?.toISOString(),
    status: c.status
  }))
}
