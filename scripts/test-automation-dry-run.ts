/**
 * Test Automation (Dry Run)
 * Check which users would receive automated emails without actually sending
 */

import { prisma } from '../lib/prisma'

async function testAutomation() {
  console.log('\n🤖 Testing Automation System (Dry Run)...\n')
  console.log('═'.repeat(60))

  const results = {
    sequence1: 0,
    sequence2: 0,
    sequence3: 0,
    sequence4: 0
  }

  try {
    // Sequence 1: Opened but no click (2-3 days after email)
    console.log('\n📧 Sequence 1: Opened but No Click')
    console.log('   Target: Users who opened email but didn\'t click')
    console.log('   Timing: 2-3 days after last email')

    const seq1Users = await prisma.$queryRaw<any[]>`
      SELECT
        mu.id,
        mu."firstName",
        mu."oldEmail",
        mu.status,
        DATE_PART('day', NOW() - mu."lastEmailOpenedAt") as "daysSinceOpened"
      FROM "MigrationUser" mu
      WHERE mu.status = 'EMAIL_OPENED'
      AND mu."lastEmailOpenedAt" >= NOW() - INTERVAL '3 days'
      AND mu."lastEmailOpenedAt" <= NOW() - INTERVAL '2 days'
      AND mu."lastEmailSentAt" <= NOW() - INTERVAL '2 days'
      AND mu."claimTokenExpiresAt" > NOW() + INTERVAL '3 days'
      LIMIT 5
    `
    results.sequence1 = seq1Users.length
    console.log(`   Found: ${seq1Users.length} users`)
    if (seq1Users.length > 0) {
      seq1Users.forEach(u => {
        console.log(`   - ${u.firstName} (${u.oldEmail})`)
      })
    }

    // Sequence 2: Visited but no claim (12-24h after visit)
    console.log('\n🔗 Sequence 2: Visited but No Claim')
    console.log('   Target: Users who visited landing but didn\'t claim')
    console.log('   Timing: 12-24 hours after visit')

    const seq2Users = await prisma.$queryRaw<any[]>`
      SELECT
        mu.id,
        mu."firstName",
        mu."oldEmail",
        mu.status,
        DATE_PART('hour', NOW() - mu."landingVisitedAt") as "hoursSinceVisit"
      FROM "MigrationUser" mu
      WHERE mu.status = 'LANDING_VISITED'
      AND mu."landingVisitedAt" >= NOW() - INTERVAL '24 hours'
      AND mu."landingVisitedAt" <= NOW() - INTERVAL '12 hours'
      AND mu."lastEmailSentAt" <= NOW() - INTERVAL '1 day'
      AND mu."claimTokenExpiresAt" > NOW() + INTERVAL '2 days'
      LIMIT 5
    `
    results.sequence2 = seq2Users.length
    console.log(`   Found: ${seq2Users.length} users`)
    if (seq2Users.length > 0) {
      seq2Users.forEach(u => {
        console.log(`   - ${u.firstName} (${Math.round(u.hoursSinceVisit)}h ago)`)
      })
    }

    // Sequence 3: Last chance (< 3 days remaining)
    console.log('\n⚠️  Sequence 3: Last Chance')
    console.log('   Target: Users with < 3 days until expiry')
    console.log('   Timing: When < 3 days remaining')

    const seq3Users = await prisma.$queryRaw<any[]>`
      SELECT
        mu.id,
        mu."firstName",
        mu."oldEmail",
        mu.status,
        DATE_PART('day', mu."claimTokenExpiresAt" - NOW()) as "daysRemaining"
      FROM "MigrationUser" mu
      WHERE mu.status IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED')
      AND mu."claimTokenExpiresAt" <= NOW() + INTERVAL '3 days'
      AND mu."claimTokenExpiresAt" > NOW()
      AND mu."lastEmailSentAt" <= NOW() - INTERVAL '2 days'
      AND NOT EXISTS (
        SELECT 1 FROM "MigrationEmail" me
        WHERE me."migrationUserId" = mu.id
        AND me."emailType" = 'LAST_CHANCE'
      )
      LIMIT 5
    `
    results.sequence3 = seq3Users.length
    console.log(`   Found: ${seq3Users.length} users`)
    if (seq3Users.length > 0) {
      seq3Users.forEach(u => {
        const days = Math.max(1, Math.ceil(u.daysRemaining))
        console.log(`   - ${u.firstName} (${days} day${days === 1 ? '' : 's'} left)`)
      })
    }

    // Sequence 4: Re-engagement (non-openers after 3+ days)
    console.log('\n🔄 Sequence 4: Re-engagement')
    console.log('   Target: Users who never opened after 3+ days')
    console.log('   Timing: 3+ days after first email')

    const seq4Users = await prisma.$queryRaw<any[]>`
      SELECT
        mu.id,
        mu."firstName",
        mu."oldEmail",
        mu.status,
        DATE_PART('day', NOW() - mu."lastEmailSentAt") as "daysSinceEmail",
        (SELECT COUNT(*) FROM "MigrationEmail" me WHERE me."migrationUserId" = mu.id) as "emailCount"
      FROM "MigrationUser" mu
      WHERE mu.status = 'EMAIL_SENT'
      AND mu."lastEmailSentAt" <= NOW() - INTERVAL '3 days'
      AND mu."lastEmailOpenedAt" IS NULL
      AND mu."claimTokenExpiresAt" > NOW() + INTERVAL '5 days'
      AND (
        SELECT COUNT(*) FROM "MigrationEmail" me
        WHERE me."migrationUserId" = mu.id
      ) < 3
      LIMIT 5
    `
    results.sequence4 = seq4Users.length
    console.log(`   Found: ${seq4Users.length} users`)
    if (seq4Users.length > 0) {
      seq4Users.forEach(u => {
        console.log(`   - ${u.firstName} (${Math.round(u.daysSinceEmail)} days, ${u.emailCount} emails sent)`)
      })
    }

    // Summary
    console.log('\n' + '═'.repeat(60))
    console.log('   AUTOMATION DRY RUN SUMMARY')
    console.log('═'.repeat(60))
    console.log(`   Sequence 1 (Opened):     ${results.sequence1} users`)
    console.log(`   Sequence 2 (Visited):    ${results.sequence2} users`)
    console.log(`   Sequence 3 (Last Chance):${results.sequence3} users`)
    console.log(`   Sequence 4 (Re-engage):  ${results.sequence4} users`)
    console.log(`   ─────────────────────────────────`)
    console.log(`   TOTAL:                   ${Object.values(results).reduce((a,b) => a+b, 0)} users`)
    console.log('═'.repeat(60))

    const total = Object.values(results).reduce((a,b) => a+b, 0)

    if (total > 0) {
      console.log('\n✅ Automation would send to', total, 'users')
      console.log('📧 To actually send: npx tsx scripts/run-automation.ts')
    } else {
      console.log('\n✅ No users currently eligible for automation')
      console.log('💡 This is normal if:')
      console.log('   - All users recently received emails')
      console.log('   - Most users have claimed already')
      console.log('   - Campaign is new (not enough time passed)')
    }

  } catch (error) {
    console.error('❌ Automation test error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAutomation()
