/**
 * Fix Ruben's Premium Subscription
 *
 * User: rubenpols@kpnmail.nl
 * Segment: DORMANT (should get 1 month premium)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRubenPremium() {
  const userId = 'cmkv1a8o00006ykvwllljv1wp'
  const email = 'rubenpols@kpnmail.nl'

  console.log('\n=== FIXING RUBEN PREMIUM ===\n')

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, subscriptionTier: true }
  })

  if (!user || user.email !== email) {
    console.error('User not found or email mismatch!')
    return
  }

  console.log('User found:', user.name, '<' + user.email + '>')
  console.log('Current tier:', user.subscriptionTier)

  // Calculate premium end date (1 month for DORMANT)
  const premiumMonths = 1
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + premiumMonths)

  console.log('\nApplying premium:')
  console.log('  Months:', premiumMonths)
  console.log('  End date:', endDate.toLocaleDateString('nl-NL'))

  // Update user subscription tier
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: 'PREMIUM'
    }
  })

  // Create subscription record
  await prisma.subscription.create({
    data: {
      userId,
      plan: 'PREMIUM_MIGRATION_BONUS',
      status: 'active',
      startDate: new Date(),
      endDate: endDate
    }
  })

  console.log('\n✅ Premium activated!')
  console.log('  New tier: PREMIUM')
  console.log('  Valid until:', endDate.toLocaleDateString('nl-NL'))

  // Verify
  const updated = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  })

  console.log('\nVerification:', updated?.subscriptionTier)

  await prisma.$disconnect()
}

fixRubenPremium().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
