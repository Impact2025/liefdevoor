/**
 * Check for claimed migration users without premium
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClaimedWithoutPremium() {
  console.log('\n=== CLAIMED USERS WITHOUT PREMIUM ===\n')

  // Get all claimed migration users
  const claimedUsers = await prisma.$queryRaw<any[]>`
    SELECT
      mu.id as migration_id,
      mu."firstName",
      mu."oldEmail",
      mu.segment,
      mu."couponCode",
      mu."newUserId",
      mu."claimedAt",
      u."subscriptionTier",
      u.name
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status IN ('CLAIMED', 'ACTIVATED')
    ORDER BY mu."claimedAt" DESC
  `

  console.log(`Totaal geclaimd: ${claimedUsers.length}\n`)

  // Check which ones don't have premium
  const withoutPremium = claimedUsers.filter(u =>
    u.subscriptionTier === 'FREE' || u.subscriptionTier === null
  )

  const withPremium = claimedUsers.filter(u =>
    u.subscriptionTier === 'PREMIUM' || u.subscriptionTier === 'GOLD'
  )

  console.log(`Met Premium: ${withPremium.length}`)
  console.log(`Zonder Premium (FREE): ${withoutPremium.length}`)

  if (withoutPremium.length > 0) {
    console.log('\n--- Users zonder premium die wel premium zouden moeten hebben ---\n')

    // Group by segment to see the pattern
    const bySegment: Record<string, any[]> = {}
    withoutPremium.forEach(u => {
      const seg = u.segment || 'UNKNOWN'
      if (!bySegment[seg]) bySegment[seg] = []
      bySegment[seg].push(u)
    })

    Object.entries(bySegment).forEach(([segment, users]) => {
      console.log(`\n${segment} (${users.length}):`)
      users.forEach(u => {
        console.log(`  - ${u.firstName} <${u.oldEmail}>`)
        console.log(`    Claimed: ${u.claimedAt ? new Date(u.claimedAt).toLocaleDateString('nl-NL') : 'unknown'}`)
        console.log(`    Coupon: ${u.couponCode || 'geen'}`)
        console.log(`    User ID: ${u.newUserId}`)
      })
    })
  }

  // Check expected premium by segment
  console.log('\n--- Premium per segment volgens plan ---')
  console.log('  VIP: 3 maanden')
  console.log('  GOLD: 2 maanden')
  console.log('  ACTIVE: 1 maand')
  console.log('  DORMANT: 1 maand')
  console.log('  INACTIVE: 1 maand (nieuw!)')

  await prisma.$disconnect()
}

checkClaimedWithoutPremium().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
