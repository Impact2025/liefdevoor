/**
 * Migration Campaign Dashboard
 *
 * Real-time stats for the migration campaign
 * Usage: npx tsx scripts/migration-dashboard.ts
 */

import { prisma } from '../lib/prisma'

async function showDashboard() {
  console.clear()
  console.log('═'.repeat(60))
  console.log('   MIGRATIE CAMPAIGN DASHBOARD')
  console.log('   ' + new Date().toLocaleString('nl-NL'))
  console.log('═'.repeat(60))

  // Get overall stats - use string comparison to avoid enum issues
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

  const s = stats[0]
  const total = s.total
  const pending = s.pending
  const emailSent = s.email_sent
  const landingVisited = s.landing_visited
  const claimStarted = s.claim_started
  const activated = s.activated

  console.log('\n📊 FUNNEL OVERZICHT')
  console.log('─'.repeat(60))

  const bar = (count: number, max: number, width: number = 30) => {
    const filled = Math.round((count / Math.max(max, 1)) * width)
    return '█'.repeat(filled) + '░'.repeat(width - filled)
  }

  console.log(`   Totaal gebruikers:    ${total.toLocaleString('nl-NL')}`)
  console.log(`   Nog te versturen:     ${pending.toLocaleString('nl-NL')}`)
  console.log(`   ─────────────────────────────────────────`)
  console.log(`   📧 Email verzonden:   ${emailSent.toString().padStart(6)} ${bar(emailSent, total)}`)
  console.log(`   👁️  Landing bezocht:   ${landingVisited.toString().padStart(6)} ${bar(landingVisited, total)}`)
  console.log(`   ✏️  Claim gestart:     ${claimStarted.toString().padStart(6)} ${bar(claimStarted, total)}`)
  console.log(`   ✅ Geactiveerd:       ${(activated + 155).toString().padStart(6)} ${bar(activated + 155, total)} (+155 legacy)`)

  // Conversion rates
  const sent = emailSent + landingVisited + claimStarted + activated
  if (sent > 0) {
    console.log('\n📈 CONVERSIE RATES')
    console.log('─'.repeat(60))

    const pct = (a: number, b: number) => b > 0 ? ((a / b) * 100).toFixed(1) + '%' : '-'

    console.log(`   Email → Landing:      ${pct(landingVisited + claimStarted + activated, sent)}`)
    console.log(`   Landing → Activated:  ${pct(activated, landingVisited + claimStarted + activated)}`)
    console.log(`   Email → Activated:    ${pct(activated, sent)} (overall)`)
  }

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

  console.log('\n👥 PER SEGMENT')
  console.log('─'.repeat(60))
  console.log('   Segment      Totaal    Te gaan    Verzonden   Activated')
  console.log('   ─────────────────────────────────────────────────────────')

  for (const seg of segmentStats) {
    console.log(`   ${seg.segment.padEnd(10)}  ${seg.total.toString().padStart(6)}    ${seg.pending.toString().padStart(6)}       ${seg.sent.toString().padStart(6)}      ${seg.activated.toString().padStart(6)}`)
  }

  // Recent activity
  const recentActivations = await prisma.$queryRaw<any[]>`
    SELECT "firstName", "claimedAt"
    FROM "MigrationUser"
    WHERE status::text IN ('CLAIMED', 'ACTIVATED')
    AND "claimedAt" IS NOT NULL
    ORDER BY "claimedAt" DESC
    LIMIT 5
  `

  if (recentActivations.length > 0) {
    console.log('\n🎉 RECENTE ACTIVATIES')
    console.log('─'.repeat(60))
    for (const u of recentActivations) {
      const time = new Date(u.claimedAt).toLocaleString('nl-NL')
      console.log(`   ${u.firstName} - ${time}`)
    }
  }

  // Today's stats
  const todayStats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(CASE WHEN "lastEmailSentAt"::date = CURRENT_DATE THEN 1 END)::int as emails_today,
      COUNT(CASE WHEN "claimedAt"::date = CURRENT_DATE THEN 1 END)::int as activated_today
    FROM "MigrationUser"
  `

  console.log('\n📅 VANDAAG')
  console.log('─'.repeat(60))
  console.log(`   Emails verzonden:     ${todayStats[0].emails_today}`)
  console.log(`   Accounts geactiveerd: ${todayStats[0].activated_today}`)

  console.log('\n' + '═'.repeat(60))

  await prisma.$disconnect()
}

// Run once (no auto-refresh for cleaner output)
showDashboard().catch(console.error)
