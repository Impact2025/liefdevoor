/**
 * Send Feedback Survey Invitations
 *
 * Sends feedback invite emails to recently activated migration users
 *
 * Usage:
 *   npx tsx scripts/send-feedback-invite.ts          # Send to all eligible
 *   npx tsx scripts/send-feedback-invite.ts 10       # Send to first 10
 *   npx tsx scripts/send-feedback-invite.ts test     # Preview only
 */

import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import FeedbackInviteEmail from '../lib/email/templates/feedback-invite'

const SURVEY_URL = 'https://liefdevooriedereen.nl/feedback'
const DELAY_BETWEEN_EMAILS = 500 // ms

async function sendFeedbackInvites(limit?: number, testMode = false) {
  console.log('\n' + '═'.repeat(60))
  console.log('   FEEDBACK SURVEY UITNODIGINGEN')
  console.log('   ' + new Date().toLocaleString('nl-NL'))
  console.log('═'.repeat(60))

  // Get activated migration users who haven't received feedback invite yet
  // (Users who activated at least 2 days ago)
  // Note: Track sent invites via EmailLog with category 'feedback-invite' instead of MigrationEmail
  const baseQuery = `
    SELECT
      mu.id,
      mu."firstName",
      mu."oldEmail",
      mu."claimedAt",
      mu."newUserId",
      u.email
    FROM "MigrationUser" mu
    LEFT JOIN "User" u ON u.id = mu."newUserId"
    WHERE mu.status IN ('CLAIMED', 'ACTIVATED')
    AND mu."claimedAt" < NOW() - INTERVAL '2 days'
    AND u.email IS NOT NULL
    AND u.email NOT IN (
      SELECT DISTINCT email
      FROM "EmailLog"
      WHERE category = 'feedback-invite'
    )
    ORDER BY mu."claimedAt" DESC
    ${limit ? `LIMIT ${limit}` : ''}
  `
  const users = await prisma.$queryRawUnsafe<any[]>(baseQuery)

  if (users.length === 0) {
    console.log('\n⚠️  Geen gebruikers gevonden om uit te nodigen')
    console.log('   (Moet 2-14 dagen geleden geactiveerd zijn)')
    await prisma.$disconnect()
    return
  }

  console.log(`\n📋 ${users.length} gebruikers gevonden\n`)

  if (testMode) {
    console.log('TEST MODE - Geen emails worden verstuurd\n')
    for (const user of users.slice(0, 5)) {
      const daysActive = Math.floor((Date.now() - new Date(user.claimedAt).getTime()) / (1000 * 60 * 60 * 24))
      console.log(`   ${user.firstName} (${user.email || user.oldEmail}) - ${daysActive} dagen actief`)
    }
    if (users.length > 5) {
      console.log(`   ... en ${users.length - 5} meer`)
    }
    await prisma.$disconnect()
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const email = user.email || user.oldEmail
    const daysActive = Math.floor((Date.now() - new Date(user.claimedAt).getTime()) / (1000 * 60 * 60 * 24))
    const progress = `[${(i + 1).toString().padStart(3)}/${users.length}]`

    try {
      // Render email
      const html = await render(
        React.createElement(FeedbackInviteEmail, {
          userName: user.firstName,
          surveyUrl: SURVEY_URL,
          daysActive
        })
      )

      // Send email (category 'feedback-invite' is used to track sent invites)
      const result = await sendEmail({
        to: email,
        subject: `${user.firstName}, hoe bevalt Liefde Voor Iedereen?`,
        html,
        text: `Hoi ${user.firstName},\n\nJe bent nu ${daysActive} dagen actief op Liefde Voor Iedereen. We zijn super benieuwd naar jouw ervaring!\n\nDeel je mening: ${SURVEY_URL}\n\nAls dank krijg je 5 gratis SuperBerichten!\n\nGroet,\nVincent`,
        category: 'feedback-invite'
      })

      if (result.success) {
        // Email is automatically logged in EmailLog by sendEmail with category 'feedback-invite'
        console.log(`${progress} ✅ ${user.firstName} (${email})`)
        success++
      } else {
        console.log(`${progress} ❌ ${user.firstName} - Send failed`)
        failed++
      }
    } catch (error: any) {
      console.log(`${progress} ❌ ${user.firstName} - ${error.message}`)
      failed++
    }

    // Delay between emails
    if (i < users.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS))
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('   SAMENVATTING')
  console.log('═'.repeat(60))
  console.log(`   ✅ Succesvol:  ${success}`)
  console.log(`   ❌ Mislukt:    ${failed}`)
  console.log(`   📧 Totaal:     ${users.length}`)
  console.log('═'.repeat(60))

  await prisma.$disconnect()
}

// Parse args
const arg = process.argv[2]
const testMode = arg === 'test'
const limit = testMode ? undefined : (arg ? parseInt(arg) : undefined)

sendFeedbackInvites(limit, testMode).catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
