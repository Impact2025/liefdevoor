/**
 * Daily Health Check - One Command Status Overview
 *
 * Run this every morning/afternoon/evening to get complete campaign status
 *
 * Usage:
 *   npx tsx scripts/daily-health-check.ts
 */

import { prisma } from '@/lib/prisma'
import { checkMigrationHealth } from '@/lib/migration/alerts'

interface DailyStats {
  overview: {
    totalUsers: number
    emailsSent: number
    claimed: number
    activated: number
    conversionRate: number
  }
  today: {
    emailsSent: number
    claimed: number
    activated: number
  }
  yesterday: {
    emailsSent: number
    claimed: number
    activated: number
  }
  nurture: {
    readyForDay3: number
    readyForDay7: number
    readyForDay10: number
  }
  health: {
    status: 'healthy' | 'warning' | 'critical'
    issues: number
    alerts: any[]
  }
}

async function dailyHealthCheck(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║     MIGRATION CAMPAIGN - DAILY HEALTH CHECK              ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log()
  console.log(`📅 ${new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`)
  console.log(`⏰ ${new Date().toLocaleTimeString('nl-NL')}`)
  console.log()

  const stats = await getStats()

  // 1. OVERVIEW
  printSection('📊 CAMPAIGN OVERVIEW')
  console.log(`Total Users:       ${stats.overview.totalUsers.toLocaleString('nl-NL')}`)
  console.log(`Emails Sent:       ${stats.overview.emailsSent.toLocaleString('nl-NL')} (${((stats.overview.emailsSent / stats.overview.totalUsers) * 100).toFixed(1)}%)`)
  console.log(`Claimed:           ${stats.overview.claimed.toLocaleString('nl-NL')}`)
  console.log(`Activated:         ${stats.overview.activated.toLocaleString('nl-NL')}`)
  console.log(`Conversion Rate:   ${stats.overview.conversionRate}% ${getStatusEmoji(stats.overview.conversionRate, 15, 10)}`)
  console.log()

  // 2. TODAY
  printSection('📈 TODAY')
  console.log(`Emails Sent:       ${stats.today.emailsSent}`)
  console.log(`Claimed:           ${stats.today.claimed} ${stats.today.claimed > 0 ? '🎉' : ''}`)
  console.log(`Activated:         ${stats.today.activated} ${stats.today.activated > 0 ? '✅' : ''}`)
  console.log()

  // 3. YESTERDAY
  printSection('📉 YESTERDAY (Comparison)')
  console.log(`Emails Sent:       ${stats.yesterday.emailsSent} ${getChangeIndicator(stats.today.emailsSent, stats.yesterday.emailsSent)}`)
  console.log(`Claimed:           ${stats.yesterday.claimed} ${getChangeIndicator(stats.today.claimed, stats.yesterday.claimed)}`)
  console.log(`Activated:         ${stats.yesterday.activated} ${getChangeIndicator(stats.today.activated, stats.yesterday.activated)}`)
  console.log()

  // 4. NURTURE SEQUENCE STATUS
  printSection('📧 NURTURE SEQUENCE')
  console.log(`Ready for Day 3:   ${stats.nurture.readyForDay3} users ${stats.nurture.readyForDay3 > 0 ? '🔔' : ''}`)
  console.log(`Ready for Day 7:   ${stats.nurture.readyForDay7} users ${stats.nurture.readyForDay7 > 0 ? '🔔' : ''}`)
  console.log(`Ready for Day 10:  ${stats.nurture.readyForDay10} users ${stats.nurture.readyForDay10 > 0 ? '🔔' : ''}`)

  if (stats.nurture.readyForDay3 > 0) {
    console.log()
    console.log(`   💡 Action: Run "npx tsx scripts/send-nurture-sequence.ts --day=3 --live"`)
  }
  if (stats.nurture.readyForDay7 > 0) {
    console.log()
    console.log(`   💡 Action: Run "npx tsx scripts/send-nurture-sequence.ts --day=7 --live"`)
  }
  if (stats.nurture.readyForDay10 > 0) {
    console.log()
    console.log(`   💡 Action: Run "npx tsx scripts/send-nurture-sequence.ts --day=10 --live"`)
  }
  console.log()

  // 5. HEALTH STATUS
  printSection('🏥 HEALTH STATUS')

  const healthIcon = stats.health.status === 'healthy' ? '✅' :
                     stats.health.status === 'warning' ? '⚠️' : '🚨'

  console.log(`Status:            ${healthIcon} ${stats.health.status.toUpperCase()}`)
  console.log(`Issues Detected:   ${stats.health.issues}`)

  if (stats.health.alerts.length > 0) {
    console.log()
    console.log('Alerts:')
    stats.health.alerts.forEach((alert, i) => {
      const icon = alert.level === 'critical' ? '🚨' :
                   alert.level === 'error' ? '❌' :
                   alert.level === 'warning' ? '⚠️' : 'ℹ️'
      console.log(`   ${icon} [${alert.level.toUpperCase()}] ${alert.message}`)
      if (alert.action) {
        console.log(`      → ${alert.action}`)
      }
    })
  }
  console.log()

  // 6. QUICK ACTIONS
  printSection('⚡ QUICK ACTIONS')
  console.log('View Dashboard:        /admin/migration/dashboard')
  console.log('Full Status:           npx tsx scripts/check-migration-status.ts')
  console.log('Segment Analysis:      npx tsx scripts/segment-conversion-analysis.ts')
  console.log('Send Nurture Emails:   npx tsx scripts/send-nurture-sequence.ts --day=X --live')
  console.log()

  // 7. SUMMARY
  printSeparator()

  if (stats.health.status === 'healthy' && stats.today.claimed > 0) {
    console.log('✅ Campaign is healthy and converting! Keep monitoring.')
  } else if (stats.health.status === 'healthy') {
    console.log('✅ Campaign is healthy. Monitor for conversions.')
  } else if (stats.health.status === 'warning') {
    console.log('⚠️  Some issues detected. Review alerts above.')
  } else {
    console.log('🚨 Critical issues detected! Take action immediately.')
  }

  console.log()
  printSeparator()

  await prisma.$disconnect()
}

async function getStats(): Promise<DailyStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  // Overview
  const overview = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) as "totalUsers",
      COUNT(*) FILTER (WHERE status::text != 'PENDING') as "emailsSent",
      COUNT(*) FILTER (WHERE status::text IN ('CLAIMED', 'ACTIVATED')) as claimed,
      COUNT(*) FILTER (WHERE status::text = 'ACTIVATED') as activated
    FROM "MigrationUser"
  `

  const totalUsers = Number(overview[0]?.totalUsers || 0)
  const emailsSent = Number(overview[0]?.emailsSent || 0)
  const claimed = Number(overview[0]?.claimed || 0)
  const activated = Number(overview[0]?.activated || 0)
  const conversionRate = emailsSent > 0 ? Number(((claimed / emailsSent) * 100).toFixed(1)) : 0

  // Today
  const today = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) FILTER (WHERE "lastEmailSentAt" >= ${todayStart}) as "emailsSent",
      COUNT(*) FILTER (WHERE "claimedAt" >= ${todayStart}) as claimed,
      COUNT(*) FILTER (WHERE "activatedAt" >= ${todayStart}) as activated
    FROM "MigrationUser"
  `

  // Yesterday
  const yesterday = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) FILTER (WHERE "lastEmailSentAt" >= ${yesterdayStart} AND "lastEmailSentAt" < ${todayStart}) as "emailsSent",
      COUNT(*) FILTER (WHERE "claimedAt" >= ${yesterdayStart} AND "claimedAt" < ${todayStart}) as claimed,
      COUNT(*) FILTER (WHERE "activatedAt" >= ${yesterdayStart} AND "activatedAt" < ${todayStart}) as activated
    FROM "MigrationUser"
  `

  // Nurture sequence readiness
  const day3Date = new Date()
  day3Date.setDate(day3Date.getDate() - 3)
  day3Date.setHours(0, 0, 0, 0)
  const day3Next = new Date(day3Date)
  day3Next.setDate(day3Next.getDate() + 1)

  const day7Date = new Date()
  day7Date.setDate(day7Date.getDate() - 7)
  day7Date.setHours(0, 0, 0, 0)
  const day7Next = new Date(day7Date)
  day7Next.setDate(day7Next.getDate() + 1)

  const day10Date = new Date()
  day10Date.setDate(day10Date.getDate() - 10)
  day10Date.setHours(0, 0, 0, 0)
  const day10Next = new Date(day10Date)
  day10Next.setDate(day10Next.getDate() + 1)

  const readyForDay3 = await prisma.migrationUser.count({
    where: {
      status: 'LANDING_VISITED',
      landingVisitedAt: { gte: day3Date, lt: day3Next },
      nurtureEmailsSent: { not: { contains: 'day3' } }
    }
  })

  const readyForDay7 = await prisma.migrationUser.count({
    where: {
      status: 'LANDING_VISITED',
      landingVisitedAt: { gte: day7Date, lt: day7Next },
      nurtureEmailsSent: { not: { contains: 'day7' } }
    }
  })

  const readyForDay10 = await prisma.migrationUser.count({
    where: {
      status: 'LANDING_VISITED',
      landingVisitedAt: { gte: day10Date, lt: day10Next },
      nurtureEmailsSent: { not: { contains: 'day10' } }
    }
  })

  // Health check
  const alerts = await checkMigrationHealth()
  const criticalAlerts = alerts.filter(a => a.level === 'critical')
  const errorAlerts = alerts.filter(a => a.level === 'error')

  const healthStatus = criticalAlerts.length > 0 ? 'critical' :
                       errorAlerts.length > 0 ? 'warning' : 'healthy'

  return {
    overview: {
      totalUsers,
      emailsSent,
      claimed,
      activated,
      conversionRate
    },
    today: {
      emailsSent: Number(today[0]?.emailsSent || 0),
      claimed: Number(today[0]?.claimed || 0),
      activated: Number(today[0]?.activated || 0)
    },
    yesterday: {
      emailsSent: Number(yesterday[0]?.emailsSent || 0),
      claimed: Number(yesterday[0]?.claimed || 0),
      activated: Number(yesterday[0]?.activated || 0)
    },
    nurture: {
      readyForDay3,
      readyForDay7,
      readyForDay10
    },
    health: {
      status: healthStatus,
      issues: alerts.length,
      alerts
    }
  }
}

function printSection(title: string): void {
  console.log(`\n${title}`)
  console.log('─'.repeat(60))
}

function printSeparator(): void {
  console.log('═'.repeat(60))
}

function getStatusEmoji(value: number, good: number, warning: number): string {
  if (value >= good) return '✅'
  if (value >= warning) return '⚠️'
  return '🔴'
}

function getChangeIndicator(current: number, previous: number): string {
  if (current > previous) return '📈'
  if (current < previous) return '📉'
  return '➡️'
}

// Run
dailyHealthCheck()
  .then(() => {
    console.log('Health check complete ✅')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Health check failed:', error)
    process.exit(1)
  })
