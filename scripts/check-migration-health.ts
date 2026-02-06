/**
 * Migration Campaign Health Check
 * Run this to check campaign health and get alerts
 *
 * Usage: npx tsx scripts/check-migration-health.ts
 */

import { checkMigrationHealth, getRecentAlerts } from '../lib/migration/alerts'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('\n' + '═'.repeat(70))
  console.log('   MIGRATION CAMPAIGN HEALTH CHECK')
  console.log('   ' + new Date().toLocaleString('nl-NL'))
  console.log('═'.repeat(70))

  // Run health check
  console.log('\n🔍 Running health check...\n')
  const alerts = await checkMigrationHealth()

  if (alerts.length === 0) {
    console.log('✅ All systems healthy - no alerts\n')
  } else {
    console.log(`⚠️  Found ${alerts.length} alert(s):\n`)

    for (const alert of alerts) {
      const emoji = {
        critical: '🔴',
        error: '🟠',
        warning: '🟡',
        info: '🔵'
      }[alert.level]

      console.log(`${emoji} [${alert.level.toUpperCase()}] ${alert.type}`)
      console.log(`   ${alert.message}`)
      if (alert.action) {
        console.log(`   💡 Action: ${alert.action}`)
      }
      console.log()
    }
  }

  // Get quick stats
  console.log('═'.repeat(70))
  console.log('   QUICK STATS')
  console.log('═'.repeat(70))

  const stats = await prisma.$queryRaw<{
    total: bigint
    emailSent: bigint
    claimed: bigint
    activated: bigint
  }[]>`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status != 'PENDING') as "emailSent",
      COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED')) as claimed,
      COUNT(*) FILTER (WHERE status = 'ACTIVATED') as activated
    FROM "MigrationUser"
  `

  const total = Number(stats[0]?.total || 0)
  const emailSent = Number(stats[0]?.emailSent || 0)
  const claimed = Number(stats[0]?.claimed || 0)
  const activated = Number(stats[0]?.activated || 0)

  const conversionRate = emailSent > 0 ? ((claimed / emailSent) * 100).toFixed(1) : '0.0'
  const activationRate = claimed > 0 ? ((activated / claimed) * 100).toFixed(1) : '0.0'

  console.log()
  console.log(`   Total Users:       ${total.toString().padStart(6)}`)
  console.log(`   Emails Sent:       ${emailSent.toString().padStart(6)}`)
  console.log(`   Claimed:           ${claimed.toString().padStart(6)}`)
  console.log(`   Activated:         ${activated.toString().padStart(6)}`)
  console.log(`   Conversion Rate:   ${conversionRate.padStart(6)}%`)
  console.log(`   Activation Rate:   ${activationRate.padStart(6)}%`)
  console.log()

  // Email metrics
  const emailStats = await prisma.$queryRaw<{
    sent: bigint
    opened: bigint
    clicked: bigint
  }[]>`
    SELECT
      COUNT(*) as sent,
      COUNT("openedAt") as opened,
      COUNT("clickedAt") as clicked
    FROM "MigrationEmail"
  `

  const sent = Number(emailStats[0]?.sent || 0)
  const opened = Number(emailStats[0]?.opened || 0)
  const clicked = Number(emailStats[0]?.clicked || 0)

  const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0'
  const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0.0'

  console.log('═'.repeat(70))
  console.log('   EMAIL METRICS')
  console.log('═'.repeat(70))
  console.log()
  console.log(`   Total Sent:        ${sent.toString().padStart(6)}`)
  console.log(`   Total Opened:      ${opened.toString().padStart(6)}`)
  console.log(`   Total Clicked:     ${clicked.toString().padStart(6)}`)
  console.log(`   Open Rate:         ${openRate.padStart(6)}%`)
  console.log(`   Click Rate:        ${clickRate.padStart(6)}%`)
  console.log()

  // Segment breakdown
  const segmentStats = await prisma.$queryRaw<{
    segment: string
    total: bigint
    sent: bigint
    claimed: bigint
  }[]>`
    SELECT
      segment::text,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status != 'PENDING') as sent,
      COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED')) as claimed
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

  console.log('═'.repeat(70))
  console.log('   SEGMENT PERFORMANCE')
  console.log('═'.repeat(70))
  console.log()
  console.log('   Segment    Total    Sent  Claimed   Conv%   Target')
  console.log('   ' + '─'.repeat(63))

  const targets: Record<string, number> = {
    VIP: 40,
    GOLD: 35,
    ACTIVE: 25,
    DORMANT: 10,
    INACTIVE: 5
  }

  for (const seg of segmentStats) {
    const total = Number(seg.total)
    const sent = Number(seg.sent)
    const claimed = Number(seg.claimed)
    const rate = sent > 0 ? ((claimed / sent) * 100).toFixed(1) : '0.0'
    const target = targets[seg.segment] || 0
    const status = parseFloat(rate) >= target ? '✅' : '⚠️ '

    console.log(
      `   ${seg.segment.padEnd(10)} ${total.toString().padStart(5)} ` +
      `${sent.toString().padStart(7)} ${claimed.toString().padStart(8)} ` +
      `${rate.padStart(6)}%  ${target.toString().padStart(3)}%  ${status}`
    )
  }

  console.log()
  console.log('═'.repeat(70))

  await prisma.$disconnect()
}

main().catch(console.error)
