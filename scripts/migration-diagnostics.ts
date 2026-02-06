/**
 * MIGRATION DIAGNOSTICS SCRIPT
 *
 * Comprehensive analysis of migration campaign performance
 * Identifies issues and provides actionable insights
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DiagnosticResults {
  emailDeliverability: any
  conversionFunnel: any
  segmentPerformance: any
  technicalIssues: any
  highIntentUsers: any
  couponIssues: any
}

async function runDiagnostics(): Promise<DiagnosticResults> {
  console.log('\n🔍 MIGRATIE DIAGNOSTICS - COMPREHENSIVE ANALYSIS\n')
  console.log('═'.repeat(70))

  // 1. EMAIL DELIVERABILITY
  console.log('\n📧 1. EMAIL DELIVERABILITY & TRACKING\n')

  const emailStats = await prisma.$queryRaw<any[]>`
    SELECT
      "emailType",
      COUNT(*) as sent,
      COUNT("openedAt") as opened,
      COUNT("clickedAt") as clicked,
      COUNT("bouncedAt") as bounced,
      COUNT("errorMessage") as errors,
      ROUND(COUNT("openedAt")::numeric / NULLIF(COUNT(*), 0) * 100, 2) as open_rate,
      ROUND(COUNT("clickedAt")::numeric / NULLIF(COUNT(*), 0) * 100, 2) as click_rate,
      ROUND(COUNT("bouncedAt")::numeric / NULLIF(COUNT(*), 0) * 100, 2) as bounce_rate
    FROM "MigrationEmail"
    GROUP BY "emailType"
    ORDER BY sent DESC
  `

  console.log('Email Type Stats:')
  if (emailStats.length === 0) {
    console.log('  ⚠️  CRITICAL: No email tracking data found!')
    console.log('  → Email opens/clicks may not be tracked')
    console.log('  → Check Resend webhook configuration')
  } else {
    emailStats.forEach(stat => {
      console.log(`\n  ${stat.emailType}:`)
      console.log(`    Sent:        ${stat.sent}`)
      console.log(`    Opened:      ${stat.opened} (${stat.open_rate}%)`)
      console.log(`    Clicked:     ${stat.clicked} (${stat.click_rate}%)`)
      console.log(`    Bounced:     ${stat.bounced} (${stat.bounce_rate}%)`)
      console.log(`    Errors:      ${stat.errors}`)

      // Alert on issues
      if (parseFloat(stat.open_rate) < 15) {
        console.log(`    🚨 LOW OPEN RATE - Expected: >20%`)
      }
      if (parseFloat(stat.bounce_rate) > 5) {
        console.log(`    🚨 HIGH BOUNCE RATE - Expected: <2%`)
      }
    })
  }

  // Overall email stats
  const totalEmailStats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) as total_sent,
      COUNT("openedAt") as total_opened,
      COUNT("clickedAt") as total_clicked,
      COUNT("bouncedAt") as total_bounced,
      ROUND(COUNT("openedAt")::numeric / NULLIF(COUNT(*), 0) * 100, 2) as overall_open_rate,
      ROUND(COUNT("clickedAt")::numeric / NULLIF(COUNT(*), 0) * 100, 2) as overall_click_rate
    FROM "MigrationEmail"
  `

  console.log('\n  Overall Email Performance:')
  const overall = totalEmailStats[0]
  console.log(`    Total Sent:      ${overall.total_sent}`)
  console.log(`    Open Rate:       ${overall.overall_open_rate}% ${parseFloat(overall.overall_open_rate) < 20 ? '🔴 LOW' : '✅'}`)
  console.log(`    Click Rate:      ${overall.overall_click_rate}% ${parseFloat(overall.overall_click_rate) < 2 ? '🔴 LOW' : '✅'}`)
  console.log(`    Bounced:         ${overall.total_bounced}`)

  // 2. CONVERSION FUNNEL
  console.log('\n\n📊 2. CONVERSION FUNNEL ANALYSIS\n')

  const funnelStats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'EMAIL_SENT' THEN 1 END) as email_sent,
      COUNT(CASE WHEN status = 'EMAIL_OPENED' THEN 1 END) as email_opened,
      COUNT(CASE WHEN status = 'LINK_CLICKED' THEN 1 END) as link_clicked,
      COUNT(CASE WHEN status = 'LANDING_VISITED' THEN 1 END) as landing_visited,
      COUNT(CASE WHEN status = 'CLAIM_STARTED' THEN 1 END) as claim_started,
      COUNT(CASE WHEN status = 'CLAIMED' THEN 1 END) as claimed,
      COUNT(CASE WHEN status = 'ACTIVATED' THEN 1 END) as activated,
      COUNT(CASE WHEN "lastEmailOpenedAt" IS NOT NULL THEN 1 END) as tracked_opens,
      COUNT(CASE WHEN "lastEmailClickedAt" IS NOT NULL THEN 1 END) as tracked_clicks
    FROM "MigrationUser"
  `

  const funnel = funnelStats[0]
  const emailsSent = parseInt(funnel.email_sent) + parseInt(funnel.email_opened) +
                     parseInt(funnel.link_clicked) + parseInt(funnel.landing_visited) +
                     parseInt(funnel.claim_started) + parseInt(funnel.claimed) +
                     parseInt(funnel.activated)

  console.log('  Funnel Breakdown:')
  console.log(`    Total Users:           ${funnel.total}`)
  console.log(`    ├─ PENDING:            ${funnel.pending} (${(parseInt(funnel.pending) / parseInt(funnel.total) * 100).toFixed(1)}%)`)
  console.log(`    ├─ EMAIL_SENT:         ${funnel.email_sent} (${(parseInt(funnel.email_sent) / parseInt(funnel.total) * 100).toFixed(1)}%)`)
  console.log(`    ├─ LANDING_VISITED:    ${funnel.landing_visited} (${(parseInt(funnel.landing_visited) / emailsSent * 100).toFixed(1)}% of sent)`)
  console.log(`    └─ CLAIMED:            ${funnel.claimed} (${(parseInt(funnel.claimed) / emailsSent * 100).toFixed(1)}% of sent) 🎯`)
  console.log(`\n  Tracking Data:`)
  console.log(`    Users with open track: ${funnel.tracked_opens} ${parseInt(funnel.tracked_opens) === 0 ? '🚨 NO TRACKING!' : ''}`)
  console.log(`    Users with click track: ${funnel.tracked_clicks}`)

  // Calculate drop-off
  console.log(`\n  Drop-off Analysis:`)
  const emailToLanding = emailsSent > 0 ? (parseInt(funnel.landing_visited) / emailsSent * 100).toFixed(2) : 0
  const landingToClaim = parseInt(funnel.landing_visited) > 0 ? (parseInt(funnel.claimed) / parseInt(funnel.landing_visited) * 100).toFixed(2) : 0

  console.log(`    Email → Landing:       ${emailToLanding}% ${parseFloat(emailToLanding as string) < 5 ? '🔴 CRITICAL' : parseFloat(emailToLanding as string) < 15 ? '🟡 LOW' : '✅'}`)
  console.log(`    Landing → Claim:       ${landingToClaim}% ${parseFloat(landingToClaim as string) > 70 ? '✅ GOOD' : '🟡'}`)

  // 3. SEGMENT PERFORMANCE
  console.log('\n\n🎯 3. SEGMENT PERFORMANCE\n')

  const segmentStats = await prisma.$queryRaw<any[]>`
    SELECT
      segment,
      COUNT(*) as total,
      COUNT(CASE WHEN status IN ('CLAIMED', 'ACTIVATED') THEN 1 END) as claimed,
      COUNT(CASE WHEN status = 'EMAIL_SENT' THEN 1 END) as email_sent,
      COUNT(CASE WHEN "lastEmailOpenedAt" IS NOT NULL THEN 1 END) as opened,
      COUNT(CASE WHEN "lastEmailClickedAt" IS NOT NULL THEN 1 END) as clicked,
      ROUND(
        COUNT(CASE WHEN status IN ('CLAIMED', 'ACTIVATED') THEN 1 END)::numeric /
        NULLIF(COUNT(CASE WHEN status != 'PENDING' THEN 1 END), 0) * 100,
        2
      ) as conversion_rate
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

  const expectedRates: Record<string, string> = {
    VIP: '40-50%',
    GOLD: '35-45%',
    ACTIVE: '25-35%',
    DORMANT: '15-25%',
    INACTIVE: '5-15%'
  }

  console.log('  Segment          | Total | Sent | Claims | Conv Rate | Expected | Status')
  console.log('  ' + '─'.repeat(75))

  segmentStats.forEach(seg => {
    const rate = parseFloat(seg.conversion_rate) || 0
    const expected = expectedRates[seg.segment] || 'N/A'
    const [minExp, maxExp] = expected.split('-').map(s => parseFloat(s))

    let status = '✅'
    if (rate < minExp / 2) status = '🔴'
    else if (rate < minExp) status = '🟡'

    console.log(
      `  ${seg.segment.padEnd(15)} | ${String(seg.total).padStart(5)} | ` +
      `${String(seg.email_sent).padStart(4)} | ${String(seg.claimed).padStart(6)} | ` +
      `${String(seg.conversion_rate).padStart(8)}% | ${expected.padStart(8)} | ${status}`
    )
  })

  // 4. TECHNICAL ISSUES
  console.log('\n\n🔧 4. TECHNICAL ISSUES\n')

  // Check for email errors
  const emailErrors = await prisma.$queryRaw<any[]>`
    SELECT
      "errorMessage",
      COUNT(*) as count
    FROM "MigrationEmail"
    WHERE "errorMessage" IS NOT NULL
    GROUP BY "errorMessage"
    ORDER BY count DESC
    LIMIT 10
  `

  if (emailErrors.length > 0) {
    console.log('  ⚠️  Email Errors Found:')
    emailErrors.forEach(err => {
      console.log(`    • ${err.errorMessage} (${err.count} times)`)
    })
  } else {
    console.log('  ✅ No email errors recorded')
  }

  // Check for users without coupons
  const missingCoupons = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count
    FROM "MigrationUser"
    WHERE "couponCode" IS NULL
    AND segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
  `

  if (parseInt(missingCoupons[0].count) > 0) {
    console.log(`\n  ⚠️  ${missingCoupons[0].count} users without coupons (should have incentives)`)
  } else {
    console.log('\n  ✅ All eligible users have coupons')
  }

  // Check for claimed users without premium
  const claimedWithoutPremium = await prisma.$queryRaw<any[]>`
    SELECT
      mu.id,
      mu."oldEmail",
      mu.segment,
      mu."claimedAt",
      u."subscriptionTier"
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status = 'CLAIMED'
    AND (u."subscriptionTier" IS NULL OR u."subscriptionTier" = 'FREE')
    AND mu.segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
  `

  if (claimedWithoutPremium.length > 0) {
    console.log(`\n  🚨 CRITICAL: ${claimedWithoutPremium.length} claimed users without premium!`)
    claimedWithoutPremium.forEach(user => {
      console.log(`    • ${user.oldEmail} (${user.segment}) - Claimed: ${new Date(user.claimedAt).toLocaleDateString('nl-NL')}`)
    })
  } else {
    console.log('\n  ✅ All claimed users have correct subscription tier')
  }

  // 5. HIGH INTENT USERS (opened/clicked but didn't claim)
  console.log('\n\n💎 5. HIGH INTENT USERS (Re-engagement Opportunity)\n')

  const highIntentUsers = await prisma.$queryRaw<any[]>`
    SELECT
      "oldEmail",
      "firstName",
      segment,
      "lastEmailOpenedAt",
      "lastEmailClickedAt",
      status,
      "landingVisits"
    FROM "MigrationUser"
    WHERE (
      "lastEmailOpenedAt" IS NOT NULL
      OR "lastEmailClickedAt" IS NOT NULL
      OR "landingVisits" > 0
    )
    AND status NOT IN ('CLAIMED', 'ACTIVATED')
    ORDER BY "lastEmailClickedAt" DESC NULLS LAST, "lastEmailOpenedAt" DESC NULLS LAST
    LIMIT 15
  `

  if (highIntentUsers.length > 0) {
    console.log(`  Found ${highIntentUsers.length} high-intent users who engaged but didn't claim:\n`)
    console.log('  Email                          | Segment | Opened    | Clicked   | Visits')
    console.log('  ' + '─'.repeat(75))

    highIntentUsers.forEach(user => {
      const opened = user.lastEmailOpenedAt ? new Date(user.lastEmailOpenedAt).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }) : '-'
      const clicked = user.lastEmailClickedAt ? new Date(user.lastEmailClickedAt).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }) : '-'

      console.log(
        `  ${user.oldEmail.padEnd(30)} | ${user.segment.padEnd(7)} | ` +
        `${opened.padEnd(9)} | ${clicked.padEnd(9)} | ${user.landingVisits}`
      )
    })

    console.log(`\n  💡 Recommendation: Send targeted follow-up to these ${highIntentUsers.length} users`)
    console.log('     • Personalized subject: "We noticed you visited..."')
    console.log('     • Increased incentive')
    console.log('     • Address potential concerns')
  } else {
    console.log('  No high-intent users found (tracking may not be working)')
  }

  // 6. COUPON PERFORMANCE
  console.log('\n\n🎟️  6. COUPON PERFORMANCE\n')

  const couponStats = await prisma.$queryRaw<any[]>`
    SELECT
      segment,
      COUNT(*) as coupons_created,
      COUNT("couponRedeemedAt") as redeemed,
      COUNT(CASE WHEN "couponExpiresAt" < NOW() THEN 1 END) as expired,
      ROUND(
        COUNT("couponRedeemedAt")::numeric /
        NULLIF(COUNT(*), 0) * 100,
        2
      ) as redemption_rate
    FROM "MigrationUser"
    WHERE "couponCode" IS NOT NULL
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

  console.log('  Segment   | Created | Redeemed | Expired | Redemption Rate')
  console.log('  ' + '─'.repeat(60))

  couponStats.forEach(stat => {
    console.log(
      `  ${stat.segment.padEnd(9)} | ${String(stat.coupons_created).padStart(7)} | ` +
      `${String(stat.redeemed).padStart(8)} | ${String(stat.expired).padStart(7)} | ` +
      `${String(stat.redemption_rate).padStart(15)}%`
    )
  })

  // 7. TIMELINE ANALYSIS
  console.log('\n\n📅 7. CAMPAIGN TIMELINE\n')

  const timeline = await prisma.$queryRaw<any[]>`
    SELECT
      DATE("sentAt") as date,
      COUNT(*) as emails_sent,
      COUNT(DISTINCT "migrationUserId") as unique_users
    FROM "MigrationEmail"
    GROUP BY DATE("sentAt")
    ORDER BY date DESC
    LIMIT 10
  `

  if (timeline.length > 0) {
    console.log('  Last 10 Days:')
    console.log('  Date       | Emails Sent | Unique Users')
    console.log('  ' + '─'.repeat(45))

    timeline.forEach(day => {
      const date = new Date(day.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric', year: 'numeric' })
      console.log(`  ${date.padEnd(11)} | ${String(day.emails_sent).padStart(11)} | ${String(day.unique_users).padStart(12)}`)
    })

    // Check if campaign is stalled
    const lastEmailDate = new Date(timeline[0].date)
    const daysSinceLastEmail = Math.floor((Date.now() - lastEmailDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceLastEmail > 3) {
      console.log(`\n  ⚠️  Campaign appears stalled (${daysSinceLastEmail} days since last email)`)
    }
  } else {
    console.log('  ⚠️  No email timeline data found')
  }

  // SUMMARY & RECOMMENDATIONS
  console.log('\n\n' + '═'.repeat(70))
  console.log('📋 SUMMARY & CRITICAL ACTION ITEMS')
  console.log('═'.repeat(70) + '\n')

  const criticalIssues: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  // Analyze and generate recommendations
  if (parseInt(overall.total_sent) > 0) {
    const openRate = parseFloat(overall.overall_open_rate)
    const clickRate = parseFloat(overall.overall_click_rate)

    if (openRate < 15) {
      criticalIssues.push('Email open rate critically low (<15%) - Check spam/deliverability')
    } else if (openRate < 20) {
      warnings.push('Email open rate below target (20%) - Consider A/B testing subject lines')
    }

    if (clickRate < 2) {
      criticalIssues.push('Click rate very low (<2%) - Email content may not be compelling')
    }
  }

  if (parseInt(funnel.tracked_opens) === 0) {
    criticalIssues.push('No email tracking data - Resend webhooks may not be configured')
  }

  if (claimedWithoutPremium.length > 0) {
    criticalIssues.push(`${claimedWithoutPremium.length} users claimed but didn't receive premium - Fix immediately!`)
  }

  const totalEmailsSent = emailsSent
  const totalClaimed = parseInt(funnel.claimed)
  const overallConversion = totalEmailsSent > 0 ? (totalClaimed / totalEmailsSent * 100) : 0

  if (overallConversion < 5) {
    criticalIssues.push(`Overall conversion rate very low (${overallConversion.toFixed(1)}%) - Expected: 10-30%`)
  }

  if (highIntentUsers.length > 0) {
    recommendations.push(`Re-engage ${highIntentUsers.length} high-intent users with personalized follow-up`)
  }

  // Calculate VIP/GOLD underperformance
  const vipSegment = segmentStats.find(s => s.segment === 'VIP')
  const goldSegment = segmentStats.find(s => s.segment === 'GOLD')

  if (vipSegment && parseFloat(vipSegment.conversion_rate) < 20) {
    warnings.push(`VIP segment underperforming (${vipSegment.conversion_rate}% vs 40-50% target)`)
    recommendations.push('Increase VIP incentives and send personalized follow-up')
  }

  if (goldSegment && parseFloat(goldSegment.conversion_rate) < 17) {
    warnings.push(`GOLD segment underperforming (${goldSegment.conversion_rate}% vs 35-45% target)`)
  }

  // Print issues
  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES:\n')
    criticalIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`)
    })
    console.log()
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n')
    warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`)
    })
    console.log()
  }

  if (recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:\n')
    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`)
    })
    console.log()
  }

  if (criticalIssues.length === 0 && warnings.length === 0) {
    console.log('✅ No critical issues detected!\n')
  }

  console.log('═'.repeat(70) + '\n')

  return {
    emailDeliverability: { overall, stats: emailStats },
    conversionFunnel: funnel,
    segmentPerformance: segmentStats,
    technicalIssues: { emailErrors, missingCoupons, claimedWithoutPremium },
    highIntentUsers,
    couponIssues: couponStats
  }
}

// Main
async function main() {
  try {
    await runDiagnostics()
  } catch (error) {
    console.error('Error running diagnostics:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
