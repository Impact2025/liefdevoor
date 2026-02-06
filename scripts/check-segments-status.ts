/**
 * Check segment status - who hasn't received emails yet
 */

import { prisma } from '../lib/prisma'

async function checkSegmentStatus() {
  console.log('\n📊 Migration Segment Status\n')
  console.log('═'.repeat(70))

  // Get overview per segment
  const segments = await prisma.$queryRaw<any[]>`
    SELECT
      mu.segment,
      COUNT(*) as total,
      COUNT(CASE WHEN mu.status = 'PENDING' THEN 1 END) as pending,
      COUNT(CASE WHEN mu.status IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED') THEN 1 END) as in_progress,
      COUNT(CASE WHEN mu.status IN ('CLAIMED', 'ACTIVATED') THEN 1 END) as converted,
      COUNT(CASE WHEN mu."lastEmailSentAt" IS NOT NULL THEN 1 END) as received_email,
      COUNT(CASE WHEN mu."lastEmailSentAt" IS NULL THEN 1 END) as never_emailed,
      ROUND(
        COUNT(CASE WHEN mu.status IN ('CLAIMED', 'ACTIVATED') THEN 1 END)::numeric * 100.0 /
        COUNT(*)::numeric,
        1
      ) as conversion_rate
    FROM "MigrationUser" mu
    GROUP BY mu.segment
    ORDER BY
      CASE mu.segment
        WHEN 'VIP' THEN 1
        WHEN 'GOLD' THEN 2
        WHEN 'ACTIVE' THEN 3
        WHEN 'DORMANT' THEN 4
        WHEN 'INACTIVE' THEN 5
      END
  `

  console.log('\nSegment Overview:')
  console.log('─'.repeat(70))
  console.log('Segment    | Total | Never Emailed | In Progress | Converted | Rate')
  console.log('─'.repeat(70))

  segments.forEach(seg => {
    const name = seg.segment.padEnd(10)
    const total = String(seg.total).padStart(5)
    const never = String(seg.never_emailed).padStart(13)
    const progress = String(seg.in_progress).padStart(11)
    const converted = String(seg.converted).padStart(9)
    const rate = String(seg.conversion_rate + '%').padStart(6)

    console.log(`${name} | ${total} | ${never} | ${progress} | ${converted} | ${rate}`)
  })

  console.log('═'.repeat(70))

  // Get recommendation
  const vip = segments.find(s => s.segment === 'VIP')
  const gold = segments.find(s => s.segment === 'GOLD')
  const active = segments.find(s => s.segment === 'ACTIVE')

  console.log('\n💡 Recommendations:\n')

  if (vip && Number(vip.never_emailed) > 0) {
    console.log(`🎯 HIGH PRIORITY: ${vip.never_emailed} VIP users never emailed`)
    console.log(`   Command: npx tsx scripts/migration-batch-send.ts VIP ${vip.never_emailed}`)
    console.log(`   Expected: ~40% conversion = ${Math.round(Number(vip.never_emailed) * 0.4)} claims\n`)
  }

  if (gold && Number(gold.never_emailed) > 0) {
    console.log(`🥇 HIGH PRIORITY: ${gold.never_emailed} GOLD users never emailed`)
    console.log(`   Command: npx tsx scripts/migration-batch-send.ts GOLD ${gold.never_emailed}`)
    console.log(`   Expected: ~35% conversion = ${Math.round(Number(gold.never_emailed) * 0.35)} claims\n`)
  }

  if (active && Number(active.never_emailed) > 0) {
    console.log(`✨ MEDIUM PRIORITY: ${active.never_emailed} ACTIVE users never emailed`)
    console.log(`   Command: npx tsx scripts/migration-batch-send.ts ACTIVE ${active.never_emailed}`)
    console.log(`   Expected: ~25% conversion = ${Math.round(Number(active.never_emailed) * 0.25)} claims\n`)
  }

  // Check users ready for follow-up
  const followUpReady = await prisma.$queryRaw<any[]>`
    SELECT
      mu.segment,
      COUNT(*) as count
    FROM "MigrationUser" mu
    WHERE mu.status IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED')
    AND mu."lastEmailSentAt" < NOW() - INTERVAL '2 days'
    AND mu."claimTokenExpiresAt" > NOW()
    GROUP BY mu.segment
    ORDER BY count DESC
  `

  if (followUpReady.length > 0) {
    console.log('📧 Follow-up Ready (>2 days since last email):')
    followUpReady.forEach(seg => {
      console.log(`   ${seg.segment}: ${seg.count} users`)
    })
    console.log(`   Command: npx tsx scripts/run-automation.ts\n`)
  }

  console.log('═'.repeat(70))

  await prisma.$disconnect()
}

checkSegmentStatus()
