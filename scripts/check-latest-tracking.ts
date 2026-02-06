import { prisma } from '../lib/prisma'

/**
 * Check tracking for most recently sent emails (last batch)
 */
async function checkLatestTracking() {
  console.log('📊 Checking tracking for latest batch...\n')

  // Get 20 most recent emails
  const recent = await prisma.migrationEmail.findMany({
    take: 20,
    orderBy: { sentAt: 'desc' },
    include: {
      migrationUser: {
        select: { firstName: true, oldEmail: true }
      }
    }
  })

  console.log(`Showing last 20 emails:\n`)

  let deliveredCount = 0
  let openedCount = 0
  let clickedCount = 0
  let bouncedCount = 0

  for (const email of recent) {
    const icon = email.deliveredAt ? '✅' :
                 email.bouncedAt ? '❌' : '⏳'

    console.log(`${icon} ${email.migrationUser.firstName}`)
    console.log(`   Sent: ${email.sentAt.toISOString()}`)

    if (email.deliveredAt) {
      deliveredCount++
      console.log(`   ✅ Delivered: ${email.deliveredAt.toISOString()}`)
    }
    if (email.openedAt) {
      openedCount++
      console.log(`   👁️  Opened: ${email.openedAt.toISOString()}`)
    }
    if (email.clickedAt) {
      clickedCount++
      console.log(`   🖱️  Clicked: ${email.clickedAt.toISOString()}`)
    }
    if (email.bouncedAt) {
      bouncedCount++
      console.log(`   ❌ Bounced`)
    }
    console.log()
  }

  console.log('📈 Summary of last 20:')
  console.log(`- Delivered: ${deliveredCount}/20 (${(deliveredCount/20*100).toFixed(0)}%)`)
  console.log(`- Opened: ${openedCount}/20 (${(openedCount/20*100).toFixed(0)}%)`)
  console.log(`- Clicked: ${clickedCount}/20 (${(clickedCount/20*100).toFixed(0)}%)`)
  console.log(`- Bounced: ${bouncedCount}/20`)

  await prisma.$disconnect()
}

checkLatestTracking()
