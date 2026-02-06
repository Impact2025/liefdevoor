/**
 * Fix Premium for ALL claimed migration users
 *
 * Gives premium based on segment:
 * - VIP: 3 months
 * - GOLD: 2 months
 * - ACTIVE: 1 month
 * - DORMANT: 1 month
 * - INACTIVE: 1 month
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PREMIUM_MONTHS: Record<string, number> = {
  VIP: 3,
  GOLD: 2,
  ACTIVE: 1,
  DORMANT: 1,
  INACTIVE: 1,
}

async function fixAllClaimedPremium() {
  console.log('\n=== FIXING ALL CLAIMED USERS WITHOUT PREMIUM ===\n')

  // Get all claimed migration users without premium
  const usersToFix = await prisma.$queryRaw<any[]>`
    SELECT
      mu.id as migration_id,
      mu."firstName",
      mu."oldEmail",
      mu.segment,
      mu."newUserId",
      u."subscriptionTier"
    FROM "MigrationUser" mu
    JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status IN ('CLAIMED', 'ACTIVATED')
    AND (u."subscriptionTier" = 'FREE' OR u."subscriptionTier" IS NULL)
  `

  console.log(`Users to fix: ${usersToFix.length}\n`)

  if (usersToFix.length === 0) {
    console.log('Geen users om te fixen!')
    await prisma.$disconnect()
    return
  }

  let fixed = 0
  let errors = 0

  for (const user of usersToFix) {
    try {
      const months = PREMIUM_MONTHS[user.segment] || 1
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + months)

      // Update user subscription tier
      await prisma.user.update({
        where: { id: user.newUserId },
        data: { subscriptionTier: 'PREMIUM' }
      })

      // Create subscription record
      await prisma.subscription.create({
        data: {
          userId: user.newUserId,
          plan: 'PREMIUM_MIGRATION_BONUS',
          status: 'active',
          startDate: new Date(),
          endDate: endDate
        }
      })

      console.log(`✅ ${user.firstName} <${user.oldEmail}> - ${user.segment} - ${months} maand(en) tot ${endDate.toLocaleDateString('nl-NL')}`)
      fixed++
    } catch (error) {
      console.error(`❌ ${user.firstName} <${user.oldEmail}> - Error:`, error)
      errors++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`\nResultaat:`)
  console.log(`  ✅ Fixed: ${fixed}`)
  console.log(`  ❌ Errors: ${errors}`)

  // Verify
  const stillFree = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM "MigrationUser" mu
    JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status IN ('CLAIMED', 'ACTIVATED')
    AND (u."subscriptionTier" = 'FREE' OR u."subscriptionTier" IS NULL)
  `

  console.log(`\nVerificatie: ${stillFree[0]?.count || 0} users nog zonder premium`)

  await prisma.$disconnect()
}

fixAllClaimedPremium().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
