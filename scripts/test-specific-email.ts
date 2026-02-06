import { prisma } from '../lib/prisma'

/**
 * Check if a specific email exists in the database and can be found by resendId
 */
async function testSpecificEmail() {
  const resendId = '89f7070a-ae90-4d67-9289-12f977fd687a' // anthonie - delivered!

  console.log(`🔍 Looking for email with resendId: ${resendId}\n`)

  const email = await prisma.migrationEmail.findFirst({
    where: { resendId },
    include: {
      migrationUser: {
        select: {
          firstName: true,
          oldEmail: true,
        }
      }
    }
  })

  if (email) {
    console.log('✅ Email found!')
    console.log('User:', email.migrationUser.firstName)
    console.log('Email:', email.migrationUser.oldEmail)
    console.log('Sent at:', email.sentAt)
    console.log('Resend ID:', email.resendId)
    console.log('\nTracking data:')
    console.log('- deliveredAt:', email.deliveredAt)
    console.log('- openedAt:', email.openedAt)
    console.log('- clickedAt:', email.clickedAt)
    console.log('- bouncedAt:', email.bouncedAt)
  } else {
    console.log('❌ Email NOT found in database!')
    console.log('This means the webhook cannot find the email to update it.')
  }

  await prisma.$disconnect()
}

testSpecificEmail()
