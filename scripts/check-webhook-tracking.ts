import { prisma } from '../lib/prisma'

/**
 * Check if webhook tracking is working for migration emails
 */
async function checkWebhookTracking() {
  console.log('🔍 Checking webhook tracking for recent emails...\n')

  // Get 10 most recent emails
  const recentEmails = await prisma.migrationEmail.findMany({
    take: 10,
    orderBy: { sentAt: 'desc' },
    include: {
      migrationUser: {
        select: {
          firstName: true,
          oldEmail: true,
          segment: true,
        }
      }
    }
  })

  console.log(`Found ${recentEmails.length} recent emails\n`)

  for (const email of recentEmails) {
    const hasTracking = !!(email.deliveredAt || email.openedAt || email.clickedAt)
    const trackingIcon = hasTracking ? '✅' : '⏳'

    console.log(`${trackingIcon} ${email.migrationUser.firstName} (${email.migrationUser.segment})`)
    console.log(`   Email: ${email.migrationUser.oldEmail}`)
    console.log(`   Sent: ${email.sentAt.toISOString()}`)
    console.log(`   Resend ID: ${email.resendId}`)

    if (email.deliveredAt) {
      console.log(`   ✅ Delivered: ${email.deliveredAt.toISOString()}`)
    }
    if (email.openedAt) {
      console.log(`   👁️  Opened: ${email.openedAt.toISOString()} (${email.openCount}x)`)
    }
    if (email.clickedAt) {
      console.log(`   🖱️  Clicked: ${email.clickedAt.toISOString()} (${email.clickCount}x)`)
    }
    if (email.bouncedAt) {
      console.log(`   ❌ Bounced: ${email.bouncedAt.toISOString()}`)
    }
    if (email.errorMessage) {
      console.log(`   ⚠️  Error: ${email.errorMessage}`)
    }

    console.log()
  }

  // Statistics
  const totalEmails = await prisma.migrationEmail.count()
  const deliveredCount = await prisma.migrationEmail.count({ where: { deliveredAt: { not: null } } })
  const openedCount = await prisma.migrationEmail.count({ where: { openedAt: { not: null } } })
  const clickedCount = await prisma.migrationEmail.count({ where: { clickedAt: { not: null } } })
  const bouncedCount = await prisma.migrationEmail.count({ where: { bouncedAt: { not: null } } })

  console.log('📊 Overall Statistics:')
  console.log(`Total emails sent: ${totalEmails}`)
  console.log(`Delivered: ${deliveredCount} (${((deliveredCount/totalEmails)*100).toFixed(1)}%)`)
  console.log(`Opened: ${openedCount} (${((openedCount/totalEmails)*100).toFixed(1)}%)`)
  console.log(`Clicked: ${clickedCount} (${((clickedCount/totalEmails)*100).toFixed(1)}%)`)
  console.log(`Bounced: ${bouncedCount} (${((bouncedCount/totalEmails)*100).toFixed(1)}%)`)

  await prisma.$disconnect()
}

checkWebhookTracking()
