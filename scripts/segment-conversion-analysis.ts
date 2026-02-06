/**
 * Segment Conversion Analysis
 *
 * Analyzes conversion rates per segment to identify why overall conversion has dropped
 */

import { prisma } from '../lib/prisma'

async function analyzeSegmentConversion() {
  console.clear()
  console.log('═'.repeat(80))
  console.log('   SEGMENT CONVERSIE ANALYSE')
  console.log('   ' + new Date().toLocaleString('nl-NL'))
  console.log('═'.repeat(80))

  // Get detailed stats per segment
  const segmentStats = await prisma.$queryRaw<any[]>`
    SELECT
      segment,
      COUNT(*)::int as total,
      COUNT(CASE WHEN status::text = 'PENDING' THEN 1 END)::int as pending,
      COUNT(CASE WHEN status::text != 'PENDING' THEN 1 END)::int as email_sent,
      COUNT(CASE WHEN status::text IN ('LANDING_VISITED', 'CLAIM_STARTED', 'CLAIMED', 'ACTIVATED') THEN 1 END)::int as landing_visited,
      COUNT(CASE WHEN status::text IN ('CLAIMED', 'ACTIVATED') THEN 1 END)::int as activated,
      COUNT(CASE WHEN "lastEmailSentAt" IS NOT NULL THEN 1 END)::int as emails_sent_count,
      COUNT(CASE WHEN "landingVisitedAt" IS NOT NULL THEN 1 END)::int as landing_visits,
      SUM(COALESCE("landingVisits", 0))::int as total_landing_visits
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

  console.log('\n📊 DETAILED CONVERSION PER SEGMENT')
  console.log('─'.repeat(80))

  const segments: any[] = []
  let totalSent = 0
  let totalLanding = 0
  let totalActivated = 0

  for (const seg of segmentStats) {
    const emailToLanding = seg.emails_sent_count > 0
      ? ((seg.landing_visits / seg.emails_sent_count) * 100).toFixed(1)
      : '0.0'

    const landingToActivated = seg.landing_visits > 0
      ? ((seg.activated / seg.landing_visits) * 100).toFixed(1)
      : '0.0'

    const emailToActivated = seg.emails_sent_count > 0
      ? ((seg.activated / seg.emails_sent_count) * 100).toFixed(1)
      : '0.0'

    const status = seg.pending === 0 ? '✅ KLAAR' : `⏳ ${seg.pending} te gaan`

    segments.push({
      segment: seg.segment,
      total: seg.total,
      sent: seg.emails_sent_count,
      landing: seg.landing_visits,
      activated: seg.activated,
      emailToLanding,
      landingToActivated,
      emailToActivated,
      status
    })

    totalSent += seg.emails_sent_count
    totalLanding += seg.landing_visits
    totalActivated += seg.activated

    console.log(`\n   ${getSegmentEmoji(seg.segment)} ${seg.segment}`)
    console.log(`   ${'─'.repeat(70)}`)
    console.log(`   Totaal:              ${seg.total}`)
    console.log(`   Emails verzonden:    ${seg.emails_sent_count}`)
    console.log(`   Landing bezocht:     ${seg.landing_visits}`)
    console.log(`   Geactiveerd:         ${seg.activated}`)
    console.log(`   `)
    console.log(`   Email → Landing:     ${emailToLanding}%`)
    console.log(`   Landing → Activated: ${landingToActivated}%`)
    console.log(`   Overall:             ${emailToActivated}%`)
    console.log(`   Status:              ${status}`)
  }

  // Overall totals
  const overallEmailToLanding = totalSent > 0
    ? ((totalLanding / totalSent) * 100).toFixed(1)
    : '0.0'

  const overallLandingToActivated = totalLanding > 0
    ? ((totalActivated / totalLanding) * 100).toFixed(1)
    : '0.0'

  const overallConversion = totalSent > 0
    ? ((totalActivated / totalSent) * 100).toFixed(1)
    : '0.0'

  console.log('\n\n📈 OVERALL TOTALS')
  console.log('─'.repeat(80))
  console.log(`   Emails verzonden:    ${totalSent}`)
  console.log(`   Landing bezocht:     ${totalLanding}`)
  console.log(`   Geactiveerd:         ${totalActivated} (+155 legacy)`)
  console.log(`   `)
  console.log(`   Email → Landing:     ${overallEmailToLanding}%`)
  console.log(`   Landing → Activated: ${overallLandingToActivated}%`)
  console.log(`   Overall:             ${overallConversion}%`)

  // Problem analysis
  console.log('\n\n⚠️ PROBLEM ANALYSIS')
  console.log('─'.repeat(80))

  // Find segments with low conversion
  const lowConversionSegments = segments.filter(s => parseFloat(s.emailToLanding) < 5)

  if (lowConversionSegments.length > 0) {
    console.log('\n   Segments met lage Email → Landing conversie (<5%):')
    lowConversionSegments.forEach(s => {
      console.log(`   - ${s.segment}: ${s.emailToLanding}% (${s.landing} van ${s.sent} emails)`)
    })
  }

  // Check if INACTIVE is dragging down overall stats
  const inactive = segments.find(s => s.segment === 'INACTIVE')
  if (inactive && inactive.sent > 1000) {
    console.log(`\n   ⚠️ INACTIVE segment heeft ${inactive.sent} emails verzonden`)
    console.log(`      Dit is ${((inactive.sent / totalSent) * 100).toFixed(0)}% van alle verzonden emails`)
    console.log(`      INACTIVE conversie: ${inactive.emailToLanding}% (vs overall ${overallEmailToLanding}%)`)

    if (parseFloat(inactive.emailToLanding) < parseFloat(overallEmailToLanding)) {
      console.log(`      ⚠️ INACTIVE trekt de overall conversie naar beneden!`)
    }
  }

  // Email tracking issues?
  console.log('\n\n🔍 POSSIBLE ISSUES')
  console.log('─'.repeat(80))
  console.log('   Mogelijke oorzaken van lage conversie:')
  console.log('   1. Email tracking werkt niet correct')
  console.log('   2. Emails komen in spam folder terecht')
  console.log('   3. INACTIVE segment heeft lage interest (verwacht)')
  console.log('   4. Links in emails werken niet')
  console.log('   5. Landing page heeft een probleem')

  // Get email open/click stats if available
  const emailStats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*)::int as total_emails,
      COUNT("openedAt")::int as opened,
      COUNT("clickedAt")::int as clicked
    FROM "MigrationEmail"
  `

  if (emailStats[0]?.total_emails > 0) {
    const es = emailStats[0]
    const openRate = ((es.opened / es.total_emails) * 100).toFixed(1)
    const clickRate = ((es.clicked / es.total_emails) * 100).toFixed(1)

    console.log('\n\n📧 EMAIL ENGAGEMENT')
    console.log('─'.repeat(80))
    console.log(`   Totaal emails:       ${es.total_emails}`)
    console.log(`   Geopend:             ${es.opened} (${openRate}%)`)
    console.log(`   Geklikt:             ${es.clicked} (${clickRate}%)`)

    if (parseFloat(openRate) < 20) {
      console.log(`\n   ⚠️ Open rate is laag (<20%)! Mogelijk spam folder probleem.`)
    }

    if (parseFloat(clickRate) < 5 && parseFloat(openRate) > 20) {
      console.log(`\n   ⚠️ Click rate is laag terwijl open rate OK is. Probleem met links of content?`)
    }
  }

  console.log('\n' + '═'.repeat(80))

  await prisma.$disconnect()
}

function getSegmentEmoji(segment: string): string {
  const emojis: Record<string, string> = {
    'VIP': '👑',
    'GOLD': '🥇',
    'ACTIVE': '🟢',
    'DORMANT': '🟡',
    'INACTIVE': '⚪'
  }
  return emojis[segment] || '📊'
}

analyzeSegmentConversion().catch(console.error)
