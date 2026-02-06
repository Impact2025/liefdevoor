/**
 * Send a single migration email to a specific user
 *
 * Usage: npx tsx scripts/send-single-email.ts weareimpactnl@gmail.com
 */

import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import MigrationWelcomeEmail from '../lib/email/templates/migration/welcome'

async function sendSingleEmail(email: string) {
  console.log(`\n📧 Sending migration email to: ${email}\n`)

  // Get the user
  const users = await prisma.$queryRaw<any[]>`
    SELECT * FROM "MigrationUser"
    WHERE "oldEmail" = ${email}
    LIMIT 1
  `

  if (users.length === 0) {
    console.log('❌ User not found')
    return
  }

  const user = users[0]
  console.log(`   Found user: ${user.firstName} (${user.segment})`)

  const landingUrl = `https://liefdevooriedereen.nl/welkom/${user.claimToken}`

  // Render email
  console.log('   Rendering email template...')
  const html = await render(
    React.createElement(MigrationWelcomeEmail, {
      userName: user.firstName,
      landingUrl: landingUrl,
      couponCode: 'OOGVOOR2026',
      memberSince: new Date(user.memberSince),
      photoCount: user.photoCount || 0,
      messageCount: user.messageCount || 0,
      incentive: { premiumMonths: 2, superMessages: 10 }
    })
  )

  console.log(`   Email rendered (${html.length} chars)`)

  // Send email
  console.log('   Sending email via Resend...')
  const result = await sendEmail({
    to: user.oldEmail,
    subject: `Geweldig nieuws ${user.firstName}! OogvoorLiefde wordt Liefde Voor Iedereen`,
    html: html,
    text: `Beste ${user.firstName},\n\nGeweldig nieuws! OogvoorLiefde wordt Liefde Voor Iedereen!\n\nJe ontvangt deze e-mail omdat je een gewaardeerd lid bent van OogvoorLiefde. We hebben fantastisch nieuws: OogvoorLiefde gaat verder als Liefde Voor Iedereen - een compleet vernieuwde dating ervaring met dezelfde betrouwbaarheid die je gewend bent.\n\nJouw welkomstcode: OOGVOOR2026\n2 maanden GRATIS Premium + 10 SuperBerichten cadeau!\n\nActiveer je account hier: ${landingUrl}\n\nHeb je vragen? We staan voor je klaar:\nE-mail: info@liefdevooriedereen.nl\nFAQ: liefdevooriedereen.nl/support/faq\nOver ons: liefdevooriedereen.nl/over-ons\n\nMet vriendelijke groet,\nVincent\nOprichter, Liefde Voor Iedereen\n\nP.S. Bewaar deze e-mail! Je welkomstcode OOGVOOR2026 is 30 dagen geldig.`,
    category: 'migration'
  })

  console.log('   Result:', result)

  if (result.success) {
    // Update user status
    await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        status = 'EMAIL_SENT',
        "lastEmailSentAt" = NOW(),
        "updatedAt" = NOW()
      WHERE "oldEmail" = ${email}
    `

    // Log the email
    await prisma.$executeRaw`
      INSERT INTO "MigrationEmail" (
        id, "migrationUserId", "emailType", subject, "abVariant", "sentAt", "resendId", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        ${user.id},
        'WELCOME',
        ${`Geweldig nieuws ${user.firstName}! OogvoorLiefde wordt Liefde Voor Iedereen`},
        'A',
        NOW(),
        ${result.emailId || null},
        NOW(),
        NOW()
      )
    `

    console.log('\n✅ Email verzonden!')
    console.log(`\n   Landing URL: ${landingUrl}`)
  } else {
    console.log('\n❌ Email verzenden mislukt')
  }

  await prisma.$disconnect()
}

const email = process.argv[2] || 'weareimpactnl@gmail.com'
sendSingleEmail(email).catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
