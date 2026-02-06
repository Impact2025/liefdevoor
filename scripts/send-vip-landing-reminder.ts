/**
 * Send reminder to VIP users who visited landing but didn't claim
 */

import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import ReminderV2 from '../lib/email/templates/migration/reminder-v2'

async function sendVIPLandingReminders() {
  console.log('\n📧 Sending VIP Landing Reminders...\n')
  console.log('═'.repeat(60))

  const users = await prisma.migrationUser.findMany({
    where: {
      segment: 'VIP',
      status: 'LANDING_VISITED',
      lastEmailSentAt: null,
      claimTokenExpiresAt: { gt: new Date() }
    }
  })

  console.log(`\nFound ${users.length} VIP users who visited but didn't claim:\n`)

  let sent = 0
  let errors = 0

  for (const user of users) {
    try {
      const daysRemaining = Math.ceil(
        (user.claimTokenExpiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      console.log(`Sending to: ${user.firstName} (${user.oldEmail})`)
      console.log(`  Days remaining: ${daysRemaining}`)

      const subject = `${user.firstName}, je was er bijna! Claim je 6 maanden Premium 🎁`

      const emailHtml = await render(
        React.createElement(ReminderV2, {
          userName: user.firstName,
          landingUrl: `https://liefdeveoriedereen.nl/welkom/${user.claimToken}`,
          premiumMonths: 6,
          superMessages: 20,
          daysRemaining,
          photoCount: user.photoCount || 0,
          hasOpened: false,
          hasClicked: false,
          emailId: ''
        })
      )

      const result = await sendEmail({
        to: user.oldEmail,
        from: 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>',
        subject,
        html: emailHtml,
        category: 'migration-vip-reminder',
        migrationUserId: user.id
      })

      if (result.success) {
        console.log(`  ✅ Sent successfully (ID: ${result.emailId})\n`)

        // Log in MigrationEmail table
        await prisma.migrationEmail.create({
          data: {
            migrationUserId: user.id,
            emailType: 'REMINDER',
            subject,
            resendId: result.emailId || null,
            sentAt: new Date()
          }
        })

        // Update lastEmailSentAt
        await prisma.migrationUser.update({
          where: { id: user.id },
          data: { lastEmailSentAt: new Date() }
        })

        sent++

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        console.log(`  ❌ Failed: ${result.error}\n`)
        errors++
      }

    } catch (error) {
      console.error(`  ❌ Error sending to ${user.firstName}:`, error)
      errors++
    }
  }

  console.log('═'.repeat(60))
  console.log(`\n✅ Sent: ${sent}`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`📧 Total: ${users.length}\n`)

  await prisma.$disconnect()
}

sendVIPLandingReminders()
