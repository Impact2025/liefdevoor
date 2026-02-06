import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import MigrationWelcomeEmail from '../lib/email/templates/migration/welcome'

/**
 * Send a test migration email to test webhook tracking
 */
async function sendTestMigrationEmail() {
  console.log('📧 Sending test migration email...\n')

  // Find a test user or create one
  const testUser = await prisma.migrationUser.findFirst({
    where: {
      oldEmail: 'vincent@stichtingphilia.nl'
    }
  })

  if (!testUser) {
    console.error('❌ Test user not found. Create one first.')
    return
  }

  console.log(`Found user: ${testUser.firstName}`)
  console.log(`Email: ${testUser.oldEmail}`)
  console.log(`Segment: ${testUser.segment}\n`)

  // Send email
  const emailHtml = render(MigrationWelcomeEmail({
    firstName: testUser.firstName,
    segment: testUser.segment,
    claimToken: testUser.claimToken || 'test',
    couponCode: testUser.couponCode || 'TEST2026',
    couponMonths: 2,
    superMessages: 10,
    memberSince: testUser.memberSince,
    photoCount: testUser.photoCount,
    messageCount: testUser.messageCount,
    expiryDays: 30,
  }))

  const result = await sendEmail({
    to: testUser.oldEmail,
    subject: `TEST: Welkom bij Liefde Voor Iedereen!`,
    html: emailHtml,
    category: 'migration_test',
  })

  if (!result.success || !result.id) {
    console.error('❌ Failed to send email:', result.error)
    return
  }

  console.log('✅ Email sent!')
  console.log('📨 Resend ID:', result.id)

  // Save to database
  await prisma.migrationEmail.create({
    data: {
      migrationUserId: testUser.id,
      resendId: result.id,
      emailType: 'welcome',
      sentAt: new Date(),
    }
  })

  console.log('✅ Saved to database')
  console.log('\n🔍 Now watch for webhook events...')
  console.log('Wait 30 seconds, then run:')
  console.log(`npx tsx -e "import {prisma} from './lib/prisma'; const e = await prisma.migrationEmail.findFirst({where: {resendId: '${result.id}'}, include: {migrationUser: true}}); console.log('deliveredAt:', e?.deliveredAt); console.log('openedAt:', e?.openedAt); await prisma.$disconnect()"`)

  await prisma.$disconnect()
}

sendTestMigrationEmail()
