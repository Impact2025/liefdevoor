/**
 * Fix Claimed Users Status
 * Updates all CLAIMED users to ACTIVATED status
 * Ensures they have premium and credits
 */

import { prisma } from '../lib/prisma'

async function fixClaimedUsers() {
  console.log('\n' + '═'.repeat(60))
  console.log('   FIX CLAIMED USERS → ACTIVATED')
  console.log('═'.repeat(60))

  // Find all users with CLAIMED status
  const claimedUsers = await prisma.$queryRaw<any[]>`
    SELECT
      mu.*,
      u.id as "userId",
      u.email as "userEmail",
      u."subscriptionTier",
      u.credits
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status = 'CLAIMED'
    AND mu."newUserId" IS NOT NULL
  `

  console.log(`\nFound ${claimedUsers.length} users with CLAIMED status\n`)

  let fixed = 0
  let alreadyGood = 0
  let errors = 0

  for (const migUser of claimedUsers) {
    try {
      if (!migUser.userId) {
        console.log(`⚠️  ${migUser.firstName} - No linked user found`)
        errors++
        continue
      }

      // Check if user already has premium
      const hasPremium = migUser.subscriptionTier === 'PREMIUM'
      const hasCredits = (migUser.credits || 0) > 0

      if (hasPremium && hasCredits) {
        // Just update status to ACTIVATED
        await prisma.$executeRaw`
          UPDATE "MigrationUser"
          SET status = 'ACTIVATED',
              "couponRedeemedAt" = COALESCE("couponRedeemedAt", NOW()),
              "updatedAt" = NOW()
          WHERE id = ${migUser.id}
        `

        console.log(`✅ ${migUser.firstName} (${migUser.userEmail}) - Already has premium, status → ACTIVATED`)
        alreadyGood++
      } else {
        // Apply missing premium/credits
        const incentive = getIncentiveForSegment(migUser.segment)

        // Update user
        await prisma.$executeRaw`
          UPDATE "User"
          SET "subscriptionTier" = 'PREMIUM',
              credits = credits + ${incentive.superMessages},
              "monthlySupermessages" = ${incentive.superMessages},
              "updatedAt" = NOW()
          WHERE id = ${migUser.userId}
        `

        // Ensure subscription exists
        const existingSub = await prisma.$queryRaw<any[]>`
          SELECT id FROM "Subscription"
          WHERE "userId" = ${migUser.userId}
          AND status = 'active'
          LIMIT 1
        `

        if (existingSub.length === 0) {
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + incentive.premiumMonths)

          await prisma.$executeRaw`
            INSERT INTO "Subscription" (id, "userId", plan, status, "startDate", "endDate", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${migUser.userId}, ${`MIGRATION_${migUser.segment}_${incentive.premiumMonths}M`}, 'active', NOW(), ${expiresAt}, NOW(), NOW())
          `
        }

        // Update migration user
        await prisma.$executeRaw`
          UPDATE "MigrationUser"
          SET status = 'ACTIVATED',
              "couponRedeemedAt" = NOW(),
              "updatedAt" = NOW()
          WHERE id = ${migUser.id}
        `

        console.log(`✅ ${migUser.firstName} (${migUser.userEmail}) - Fixed: Premium + ${incentive.superMessages} credits + ACTIVATED`)
        fixed++
      }

    } catch (error) {
      console.error(`❌ ${migUser.firstName} - Error: ${error}`)
      errors++
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log('   SUMMARY')
  console.log('═'.repeat(60))
  console.log(`   Already good:  ${alreadyGood}`)
  console.log(`   Fixed:         ${fixed}`)
  console.log(`   Errors:        ${errors}`)
  console.log(`   Total:         ${claimedUsers.length}`)
  console.log('═'.repeat(60))

  await prisma.$disconnect()
}

function getIncentiveForSegment(segment: string) {
  const incentives: Record<string, { premiumMonths: number; superMessages: number }> = {
    VIP: { premiumMonths: 6, superMessages: 20 },
    GOLD: { premiumMonths: 4, superMessages: 15 },
    ACTIVE: { premiumMonths: 3, superMessages: 10 },
    DORMANT: { premiumMonths: 2, superMessages: 10 },
    INACTIVE: { premiumMonths: 1, superMessages: 3 }
  }
  return incentives[segment] || { premiumMonths: 1, superMessages: 3 }
}

fixClaimedUsers().catch(console.error)
