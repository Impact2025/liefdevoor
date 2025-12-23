/**
 * Check and manage user subscriptions
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.log('Usage: npx tsx scripts/check-subscription.ts <email>')
    console.log('       npx tsx scripts/check-subscription.ts <email> --cancel')
    process.exit(1)
  }

  const shouldCancel = process.argv.includes('--cancel')

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
    },
  })

  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  console.log('\n=== User Info ===')
  console.log(`ID: ${user.id}`)
  console.log(`Email: ${user.email}`)
  console.log(`Name: ${user.name}`)
  console.log(`Current Tier: ${user.subscriptionTier}`)

  // Find all subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`\n=== Subscriptions (${subscriptions.length}) ===`)
  subscriptions.forEach((sub, idx) => {
    console.log(`\n[${idx + 1}] ID: ${sub.id}`)
    console.log(`    Plan: ${sub.plan}`)
    console.log(`    Status: ${sub.status}`)
    console.log(`    Created: ${sub.createdAt.toISOString()}`)
    console.log(`    End Date: ${sub.endDate ? sub.endDate.toISOString() : 'N/A'}`)
    console.log(`    MultiSafepay ID: ${sub.multisafepayId || 'N/A'}`)
    console.log(`    Cancelled At: ${sub.cancelledAt ? sub.cancelledAt.toISOString() : 'N/A'}`)
  })

  if (shouldCancel) {
    console.log('\n=== Cancelling Active/Pending Subscriptions ===')

    const result = await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: { in: ['active', 'pending'] },
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    })

    console.log(`Cancelled ${result.count} subscription(s)`)

    // Reset user tier to FREE
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionTier: 'FREE' },
    })

    console.log('User tier reset to FREE')
  } else {
    const activeCount = subscriptions.filter(s => s.status === 'active').length
    const pendingCount = subscriptions.filter(s => s.status === 'pending').length

    if (activeCount > 0 || pendingCount > 0) {
      console.log('\n⚠️  This user has active/pending subscriptions.')
      console.log('    Run with --cancel flag to cancel them:')
      console.log(`    npx tsx scripts/check-subscription.ts ${email} --cancel`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
