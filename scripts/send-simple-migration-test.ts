import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'

/**
 * Send a simple test migration email
 */
async function sendSimpleMigrationTest() {
  console.log('📧 Sending simple migration test email...\n')

  // Find or create a test migration user
  let testUser = await prisma.migrationUser.findFirst({
    where: {
      oldEmail: 'vincent@stichtingphilia.nl'
    }
  })

  if (!testUser) {
    console.log('Creating test user...')
    testUser = await prisma.migrationUser.create({
      data: {
        oldUserId: 999999,
        oldEmail: 'vincent@stichtingphilia.nl',
        firstName: 'Test',
        lastName: 'User',
        segment: 'GOLD',
        memberSince: new Date('2020-01-01'),
        status: 'PENDING',
      }
    })
  }

  console.log(`Using user: ${testUser.firstName} (${testUser.oldEmail})`)

  // Send simple email
  const result = await sendEmail({
    to: testUser.oldEmail,
    subject: 'TEST: Webhook tracking test',
    html: `
      <h1>Webhook Tracking Test</h1>
      <p>This is a test email to verify webhook tracking works.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p><a href="https://liefdevooriedereen.nl">Click this link</a></p>
    `,
    category: 'migration_test',
  })

  if (!result.success || !result.emailId) {
    console.error('❌ Failed:', result.error)
    await prisma.$disconnect()
    return
  }

  console.log('✅ Email sent!')
  console.log('📨 Resend ID:', result.emailId)

  // Save to database
  const email = await prisma.migrationEmail.create({
    data: {
      migrationUserId: testUser.id,
      resendId: result.emailId,
      emailType: 'WELCOME',
      subject: 'TEST: Webhook tracking test',
      sentAt: new Date(),
    }
  })

  console.log('✅ Saved to database with ID:', email.id)
  console.log('\n⏳ Waiting 10 seconds for webhook...')

  await new Promise(resolve => setTimeout(resolve, 10000))

  // Check tracking
  const updated = await prisma.migrationEmail.findUnique({
    where: { id: email.id }
  })

  console.log('\n📊 Tracking status:')
  console.log('- deliveredAt:', updated?.deliveredAt ? '✅ ' + updated.deliveredAt : '❌ null')
  console.log('- openedAt:', updated?.openedAt ? '✅ ' + updated.openedAt : '⏳ null (expected)')
  console.log('- clickedAt:', updated?.clickedAt ? '✅ ' + updated.clickedAt : '⏳ null (expected)')

  if (updated?.deliveredAt) {
    console.log('\n🎉 WEBHOOK TRACKING WORKS!')
  } else {
    console.log('\n❌ Webhook tracking NOT working yet')
    console.log('Check Vercel logs for webhook errors')
  }

  await prisma.$disconnect()
}

sendSimpleMigrationTest()
