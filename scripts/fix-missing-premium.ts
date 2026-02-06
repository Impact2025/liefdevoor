/**
 * FIX MISSING PREMIUM FOR CLAIMED USERS
 *
 * Identifies users who claimed their account but didn't receive
 * premium subscription, and fixes it manually.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Premium duration per segment (in months)
const SEGMENT_PREMIUM_MONTHS: Record<string, number> = {
  VIP: 3,
  GOLD: 2,
  ACTIVE: 1,
  DORMANT: 1,
  INACTIVE: 1
}

async function fixMissingPremium() {
  console.log('\n🔧 FIXING MISSING PREMIUM SUBSCRIPTIONS\n')
  console.log('═'.repeat(70))

  // Find all claimed users without premium
  const usersWithoutPremium = await prisma.$queryRaw<any[]>`
    SELECT
      mu.id as migration_id,
      mu."newUserId",
      mu."oldEmail",
      mu."firstName",
      mu.segment,
      mu."claimedAt",
      mu."couponCode",
      u.id as user_id,
      u."subscriptionTier"
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status = 'CLAIMED'
    AND (u."subscriptionTier" IS NULL OR u."subscriptionTier" = 'FREE')
    AND mu.segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
  `

  if (usersWithoutPremium.length === 0) {
    console.log('✅ No users found without premium!\n')
    return
  }

  console.log(`Found ${usersWithoutPremium.length} users without premium:\n`)

  for (const user of usersWithoutPremium) {
    const premiumMonths = SEGMENT_PREMIUM_MONTHS[user.segment] || 1
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + premiumMonths)

    console.log(`\n📝 Processing: ${user.firstName} (${user.oldEmail})`)
    console.log(`   Segment:         ${user.segment}`)
    console.log(`   Should receive:  ${premiumMonths} months premium`)
    console.log(`   Coupon:          ${user.couponCode}`)
    console.log(`   Claimed:         ${new Date(user.claimedAt).toLocaleDateString('nl-NL')}`)

    try {
      // 1. Update user subscription tier
      await prisma.user.update({
        where: { id: user.user_id },
        data: {
          subscriptionTier: 'PREMIUM',
          updatedAt: new Date()
        }
      })

      console.log(`   ✅ User tier updated to PREMIUM`)

      // 2. Create subscription record
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.user_id,
          plan: `MIGRATION_${user.segment}_${premiumMonths}M`,
          status: 'active',
          startDate: new Date(),
          endDate: expiresAt,
          multisafepayId: null,
          recurringId: null,
        }
      })

      console.log(`   ✅ Subscription created until ${expiresAt.toLocaleDateString('nl-NL')}`)

      // 3. Mark coupon as redeemed
      if (user.couponCode) {
        await prisma.migrationUser.update({
          where: { id: user.migration_id },
          data: {
            couponRedeemedAt: new Date()
          }
        })
        console.log(`   ✅ Coupon marked as redeemed`)
      }

      // 4. Log the fix
      console.log(`   📧 TODO: Send "Premium geactiveerd" email`)

    } catch (error) {
      console.log(`   ❌ Error: ${error}`)
    }
  }

  console.log('\n' + '═'.repeat(70))
  console.log(`\n✅ Fixed premium for ${usersWithoutPremium.length} users\n`)
}

async function verifyFix() {
  console.log('\n🔍 VERIFICATION\n')

  const stillMissing = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status = 'CLAIMED'
    AND (u."subscriptionTier" IS NULL OR u."subscriptionTier" = 'FREE')
    AND mu.segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
  `

  const count = parseInt(stillMissing[0].count)

  if (count === 0) {
    console.log('✅ All claimed users now have premium!\n')
  } else {
    console.log(`⚠️  Still ${count} users without premium\n`)
  }

  // Show current premium distribution
  const premiumStats = await prisma.$queryRaw<any[]>`
    SELECT
      mu.segment,
      COUNT(*) as claimed,
      COUNT(CASE WHEN u."subscriptionTier" = 'PREMIUM' THEN 1 END) as with_premium,
      COUNT(CASE WHEN u."subscriptionTier" = 'FREE' THEN 1 END) as still_free
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status = 'CLAIMED'
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

  console.log('Premium Status per Segment:')
  console.log('─'.repeat(60))
  console.log('Segment   | Claimed | With Premium | Still Free')
  console.log('─'.repeat(60))

  premiumStats.forEach(stat => {
    console.log(
      `${stat.segment.padEnd(9)} | ${String(stat.claimed).padStart(7)} | ` +
      `${String(stat.with_premium).padStart(12)} | ${String(stat.still_free).padStart(10)}`
    )
  })

  console.log()
}

async function main() {
  try {
    await fixMissingPremium()
    await verifyFix()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
