/**
 * Migration Batch Email Sender
 *
 * Sends migration emails in controlled batches
 * Usage: npx tsx scripts/migration-batch-send.ts [segment] [limit]
 *
 * Examples:
 *   npx tsx scripts/migration-batch-send.ts VIP 100
 *   npx tsx scripts/migration-batch-send.ts GOLD 500
 *   npx tsx scripts/migration-batch-send.ts ALL 1000
 */

import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import MigrationWelcomeEmail from '../lib/email/templates/migration/welcome'

const DELAY_BETWEEN_EMAILS = 500 // ms between emails to avoid rate limits
const BATCH_SIZE = 10 // Process in small batches for better error handling

interface SendResult {
  success: number
  failed: number
  errors: string[]
}

async function sendBatch(segment: string, limit: number): Promise<SendResult> {
  console.log('\n' + '═'.repeat(60))
  console.log(`   MIGRATION BATCH SEND`)
  console.log(`   Segment: ${segment} | Limit: ${limit}`)
  console.log(`   Started: ${new Date().toLocaleString('nl-NL')}`)
  console.log('═'.repeat(60))

  // Get users to send to
  let users: any[]

  if (segment === 'ALL') {
    users = await prisma.$queryRaw<any[]>`
      SELECT
        id, "firstName", "oldEmail", "claimToken", "couponCode",
        "memberSince", "photoCount", "messageCount", segment
      FROM "MigrationUser"
      WHERE status::text = 'PENDING'
      ORDER BY
        CASE segment
          WHEN 'VIP' THEN 1
          WHEN 'GOLD' THEN 2
          WHEN 'ACTIVE' THEN 3
          WHEN 'DORMANT' THEN 4
          WHEN 'INACTIVE' THEN 5
        END,
        "memberSince" ASC
      LIMIT ${limit}
    `
  } else {
    users = await prisma.$queryRaw<any[]>`
      SELECT
        id, "firstName", "oldEmail", "claimToken", "couponCode",
        "memberSince", "photoCount", "messageCount", segment
      FROM "MigrationUser"
      WHERE status::text = 'PENDING'
      AND segment::text = ${segment}
      ORDER BY "memberSince" ASC
      LIMIT ${limit}
    `
  }

  if (users.length === 0) {
    console.log('\n⚠️  Geen gebruikers gevonden om te mailen')
    await prisma.$disconnect()
    return { success: 0, failed: 0, errors: [] }
  }

  console.log(`\n📋 ${users.length} gebruikers gevonden\n`)

  const result: SendResult = { success: 0, failed: 0, errors: [] }

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const progress = `[${(i + 1).toString().padStart(3)}/${users.length}]`

    try {
      const landingUrl = `https://liefdevooriedereen.nl/welkom/${user.claimToken}`

      // Render email
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

      // Send email
      const emailResult = await sendEmail({
        to: user.oldEmail,
        subject: `Geweldig nieuws ${user.firstName}! OogvoorLiefde wordt Liefde Voor Iedereen`,
        html: html,
        text: `Beste ${user.firstName},\n\nGeweldig nieuws! OogvoorLiefde wordt Liefde Voor Iedereen!\n\nActiveer je account: ${landingUrl}\n\nJe welkomstcode: OOGVOOR2026\n2 maanden GRATIS Premium!\n\nGroet, Vincent`,
        category: 'migration'
      })

      if (emailResult.success) {
        // Update user status
        await prisma.$executeRaw`
          UPDATE "MigrationUser"
          SET
            status = 'EMAIL_SENT',
            "lastEmailSentAt" = NOW(),
            "updatedAt" = NOW()
          WHERE id = ${user.id}
        `

        // Log the email
        await prisma.$executeRaw`
          INSERT INTO "MigrationEmail" (
            id, "migrationUserId", "emailType", subject, "abVariant", "sentAt", "resendId"
          ) VALUES (
            gen_random_uuid(),
            ${user.id},
            'WELCOME',
            ${`Geweldig nieuws ${user.firstName}! OogvoorLiefde wordt Liefde Voor Iedereen`},
            'A',
            NOW(),
            ${emailResult.emailId || null}
          )
        `

        console.log(`${progress} ✅ ${user.firstName} (${user.oldEmail})`)
        result.success++
      } else {
        console.log(`${progress} ❌ ${user.firstName} - Send failed`)
        result.failed++
        result.errors.push(`${user.oldEmail}: Send failed`)
      }

    } catch (error: any) {
      console.log(`${progress} ❌ ${user.firstName} - ${error.message}`)
      result.failed++
      result.errors.push(`${user.oldEmail}: ${error.message}`)
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
  console.log(`   ✅ Succesvol:  ${result.success}`)
  console.log(`   ❌ Mislukt:    ${result.failed}`)
  console.log(`   📧 Totaal:     ${users.length}`)
  console.log(`   ⏱️  Klaar:      ${new Date().toLocaleString('nl-NL')}`)

  if (result.errors.length > 0 && result.errors.length <= 10) {
    console.log('\n   Fouten:')
    result.errors.forEach(e => console.log(`   - ${e}`))
  }

  console.log('═'.repeat(60))

  await prisma.$disconnect()
  return result
}

// Parse command line args
const segment = process.argv[2]?.toUpperCase() || 'VIP'
const limit = parseInt(process.argv[3]) || 100

if (!['VIP', 'GOLD', 'ACTIVE', 'DORMANT', 'INACTIVE', 'ALL'].includes(segment)) {
  console.log('Usage: npx tsx scripts/migration-batch-send.ts [segment] [limit]')
  console.log('Segments: VIP, GOLD, ACTIVE, DORMANT, INACTIVE, ALL')
  process.exit(1)
}

sendBatch(segment, limit).catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
