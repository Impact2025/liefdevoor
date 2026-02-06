/**
 * Migration Campaign - Next Steps Guide
 *
 * Interactive guide showing exactly what to do next
 */

import { prisma } from '../lib/prisma'

async function showNextSteps() {
  console.clear()
  console.log('═'.repeat(70))
  console.log('   🚀 MIGRATION CAMPAIGN - NEXT STEPS')
  console.log('═'.repeat(70))
  console.log()

  // Get current status
  const stats = await prisma.$queryRaw<any[]>`
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

  const emailTracking = await prisma.$queryRaw<any[]>`
    SELECT COUNT("openedAt")::int as opened
    FROM "MigrationEmail"
  `
  const trackingWorking = emailTracking[0]?.opened > 0

  console.log('📊 Current Status:')
  console.log('─'.repeat(70))
  stats.forEach(s => {
    const icon = s.segment === 'INACTIVE' ? '🛑' :
                 s.pending === 0 ? '✅' : '⏳'
    const conv = s.sent > 0 ? `${((s.activated / s.sent) * 100).toFixed(1)}%` : '-'
    console.log(`   ${icon} ${s.segment.padEnd(10)} ${s.sent.toString().padStart(4)}/${s.total.toString().padStart(4)} sent, ${s.activated.toString().padStart(3)} activated (${conv})`)
  })

  console.log()
  console.log('📧 Email Tracking:')
  console.log('─'.repeat(70))
  if (trackingWorking) {
    console.log('   ✅ Webhooks are working')
  } else {
    console.log('   ❌ Webhooks NOT working (0 opens tracked)')
  }

  console.log()
  console.log('═'.repeat(70))
  console.log('   🎯 RECOMMENDED ACTIONS')
  console.log('═'.repeat(70))
  console.log()

  // Step 1: Webhooks
  console.log('STEP 1: Setup Email Tracking (CRITICAL)')
  console.log('─'.repeat(70))
  if (trackingWorking) {
    console.log('✅ DONE - Webhooks are working')
  } else {
    console.log('❌ TODO - Setup Resend webhooks')
    console.log()
    console.log('Why: Without tracking, you can\'t see email opens/clicks')
    console.log('Time: 5 minutes')
    console.log('Command:')
    console.log('  cat docs/RESEND_WEBHOOK_SETUP.md')
    console.log()
    console.log('Verify after setup:')
    console.log('  npx tsx scripts/verify-webhook-setup.ts')
  }
  console.log()

  // Step 2: Stop INACTIVE
  const inactiveStat = stats.find(s => s.segment === 'INACTIVE')
  const inactivePending = inactiveStat?.pending || 0

  console.log('STEP 2: Stop INACTIVE Campaign')
  console.log('─'.repeat(70))
  if (inactivePending === 0) {
    console.log('✅ DONE - No INACTIVE emails pending')
  } else {
    console.log(`⚠️  ACTION NEEDED - ${inactivePending} INACTIVE emails still pending`)
    console.log()
    console.log('Why: INACTIVE has 1.2% conversion vs 15-27% for high-value segments')
    console.log('Risk: Spam complaints, wasted resources')
    console.log('Command:')
    console.log('  npx tsx scripts/stop-inactive-batch.ts')
    console.log()
    console.log('This will:')
    console.log('  - Update MIGRATION_STATUS.md with decision')
    console.log('  - Log rationale in database')
    console.log('  - Show impact analysis')
  }
  console.log()

  // Step 3: Finish DORMANT
  const dormantStat = stats.find(s => s.segment === 'DORMANT')
  const dormantPending = dormantStat?.pending || 0

  console.log('STEP 3: Finish DORMANT Segment')
  console.log('─'.repeat(70))
  if (dormantPending === 0) {
    console.log('✅ DONE - All DORMANT emails sent')
  } else {
    console.log(`📧 TODO - ${dormantPending} DORMANT emails remaining`)
    console.log()
    console.log('Why: DORMANT has 14.1% conversion (good!)')
    console.log('Safe: Low spam risk, proven to work')
    console.log('Command:')
    console.log('  npx tsx scripts/migration-batch-send.ts DORMANT 10')
  }
  console.log()

  // Step 4: Retargeting
  const retargetCandidates = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*)::int as count
    FROM "MigrationUser"
    WHERE status::text IN ('LANDING_VISITED', 'EMAIL_OPENED', 'LINK_CLICKED')
    AND segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
  `
  const retargetCount = retargetCandidates[0]?.count || 0

  console.log('STEP 4: Retarget Non-Converters')
  console.log('─'.repeat(70))
  if (retargetCount === 0) {
    console.log('⚠️  No retarget candidates (may need webhook tracking)')
  } else {
    console.log(`🎯 OPPORTUNITY - ${retargetCount} users showed interest but didn't activate`)
    console.log()
    console.log('Strategy: Send follow-up with extended coupon')
    console.log('Expected: 15% conversion = ~' + Math.round(retargetCount * 0.15) + ' activations')
    console.log()
    console.log('Preview first:')
    console.log('  npx tsx scripts/retarget-non-converters.ts')
    console.log()
    console.log('Then send:')
    console.log('  npx tsx scripts/retarget-non-converters.ts --send')
  }
  console.log()

  // Step 5: Final analysis
  console.log('STEP 5: Final Campaign Analysis')
  console.log('─'.repeat(70))
  console.log('Once steps 1-4 are complete:')
  console.log()
  console.log('Commands:')
  console.log('  npx tsx scripts/migration-dashboard.ts')
  console.log('  npx tsx scripts/segment-conversion-analysis.ts')
  console.log()
  console.log('Documents to review:')
  console.log('  MIGRATION_ANALYSIS_COMPLETE.md')
  console.log('  EMAIL_STRATEGY_OPTIMIZATION.md')
  console.log()

  console.log('═'.repeat(70))
  console.log('   📈 EXPECTED RESULTS')
  console.log('═'.repeat(70))
  console.log()

  const highValueStats = stats.filter(s => ['VIP', 'GOLD', 'ACTIVE', 'DORMANT'].includes(s.segment))
  const hvTotal = highValueStats.reduce((sum, s) => sum + s.total, 0)
  const hvSent = highValueStats.reduce((sum, s) => sum + s.sent, 0)
  const hvActivated = highValueStats.reduce((sum, s) => sum + s.activated, 0)
  const hvConv = hvSent > 0 ? ((hvActivated / hvSent) * 100).toFixed(1) : 0

  console.log('High-Value Segments (VIP, GOLD, ACTIVE, DORMANT):')
  console.log(`  Current: ${hvActivated} activations from ${hvSent} emails (${hvConv}%)`)
  console.log(`  Potential: +${dormantPending} from DORMANT`)
  console.log(`  Potential: +${Math.round(retargetCount * 0.15)} from retargeting`)
  console.log(`  TOTAL: ~${hvActivated + dormantPending + Math.round(retargetCount * 0.15)} activations`)
  console.log()
  console.log('With legacy users: ~${hvActivated + dormantPending + Math.round(retargetCount * 0.15) + 155} total')
  console.log()

  console.log('═'.repeat(70))
  console.log()
  console.log('Ready to proceed? Start with Step 1!')
  console.log()

  await prisma.$disconnect()
}

showNextSteps().catch(console.error)
