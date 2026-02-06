/**
 * Retarget Non-Converters
 *
 * Sends follow-up emails to high-value users who showed interest but didn't convert:
 * 1. Visited landing but didn't activate
 * 2. Opened email but didn't click (when tracking works)
 * 3. Clicked but didn't visit landing
 */

import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'

async function retargetNonConverters(dryRun: boolean = true) {
  console.log('🎯 RETARGETING NON-CONVERTERS\n')

  if (dryRun) {
    console.log('ℹ️  DRY RUN MODE - No emails will be sent\n')
  }

  // Get users who visited landing but didn't activate
  const landingVisitors = await prisma.$queryRaw<any[]>`
    SELECT
      id,
      "firstName",
      "oldEmail",
      segment,
      "landingVisitedAt",
      "couponCode",
      "couponExpiresAt"
    FROM "MigrationUser"
    WHERE status::text = 'LANDING_VISITED'
    AND segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
    ORDER BY segment, "landingVisitedAt" DESC
  `

  console.log('📊 Retargeting Opportunities:\n')
  console.log('1️⃣ Landing Visitors (didn\'t activate)')
  console.log('─'.repeat(60))
  console.log(`   Found: ${landingVisitors.length} users`)

  if (landingVisitors.length > 0) {
    console.log('\n   Breakdown by segment:')
    const bySegment = landingVisitors.reduce((acc: any, u) => {
      acc[u.segment] = (acc[u.segment] || 0) + 1
      return acc
    }, {})

    Object.entries(bySegment).forEach(([seg, count]) => {
      console.log(`   - ${seg}: ${count}`)
    })
  }

  // Get users who might have opened but not clicked (if tracking works)
  const emailOpened = await prisma.$queryRaw<any[]>`
    SELECT
      id,
      "firstName",
      "oldEmail",
      segment,
      "lastEmailOpenedAt"
    FROM "MigrationUser"
    WHERE "lastEmailOpenedAt" IS NOT NULL
    AND "lastEmailClickedAt" IS NULL
    AND status::text IN ('EMAIL_SENT', 'EMAIL_OPENED')
    AND segment IN ('VIP', 'GOLD', 'ACTIVE', 'DORMANT')
  `

  console.log('\n2️⃣ Email Opened (didn\'t click)')
  console.log('─'.repeat(60))
  console.log(`   Found: ${emailOpened.length} users`)

  if (emailOpened.length === 0) {
    console.log('   ⚠️  Email tracking may not be working (0 opens tracked)')
    console.log('   👉 Setup webhooks first: docs/RESEND_WEBHOOK_SETUP.md')
  }

  // Calculate potential impact
  console.log('\n📈 Potential Impact:')
  console.log('─'.repeat(60))

  const totalRetarget = landingVisitors.length + emailOpened.length
  const expectedConversion = 0.15 // 15% conversion on retargeting
  const expectedActivations = Math.round(totalRetarget * expectedConversion)

  console.log(`   Total retarget pool:      ${totalRetarget}`)
  console.log(`   Expected conversion:      15%`)
  console.log(`   Expected activations:     ${expectedActivations}`)
  console.log()

  // Preview email for landing visitors
  console.log('📧 Retargeting Email Preview (Landing Visitors):\n')
  console.log('─'.repeat(60))
  console.log('Subject: "[Naam], mis je iets? Je Premium wacht nog steeds 🎁"')
  console.log()
  console.log('Body:')
  console.log(`
Hoi [Naam],

Ik zag dat je je profiel hebt bekeken op Liefde Voor Iedereen, maar je hebt
je account nog niet geactiveerd.

Mis je iets? Heb je vragen?

Je persoonlijke welkomstcode is nog steeds geldig:

┌─────────────────────────┐
│  Code: OOGVOOR2026      │
│  [X] maanden Premium    │
│  Nog [X] dagen geldig   │
└─────────────────────────┘

EXTRA: Omdat je al interesse toonde, geven we je een extra week om te
activeren. Je code is nu geldig tot [datum + 7 dagen].

[ACTIVEER NU - BUTTON]

Vragen? Reply gewoon op deze email.

Groet,
Team Liefde Voor Iedereen

P.S. 847+ leden zijn al overgestapt. Doe je ook mee?
  `.trim())
  console.log('─'.repeat(60))
  console.log()

  if (!dryRun) {
    console.log('🚀 SENDING RETARGETING EMAILS...\n')

    let sent = 0
    let errors = 0

    // Send to landing visitors
    for (const user of landingVisitors) {
      try {
        const daysRemaining = user.couponExpiresAt
          ? Math.max(0, Math.ceil((new Date(user.couponExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 30

        const newExpiry = new Date()
        newExpiry.setDate(newExpiry.getDate() + daysRemaining + 7) // Extra week

        const incentives: Record<string, any> = {
          VIP: { premiumMonths: 3, superMessages: 10 },
          GOLD: { premiumMonths: 2, superMessages: 5 },
          ACTIVE: { premiumMonths: 1, superMessages: 3 },
          DORMANT: { premiumMonths: 1, superMessages: 5 }
        }

        const incentive = incentives[user.segment] || incentives.ACTIVE

        const subject = `${user.firstName}, mis je iets? Je Premium wacht nog steeds 🎁`

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #fce7f3 0%, #fff 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
    <h1 style="color: #e11d48; margin: 0 0 10px 0; font-size: 24px;">Hoi ${user.firstName},</h1>
    <p style="color: #64748b; margin: 0; font-size: 16px;">Je Premium wacht nog steeds op je...</p>
  </div>

  <p style="font-size: 16px; margin-bottom: 20px;">
    Ik zag dat je je profiel hebt bekeken op <strong>Liefde Voor Iedereen</strong>, maar je hebt je account nog niet geactiveerd.
  </p>

  <p style="font-size: 16px; margin-bottom: 20px;">
    Mis je iets? Heb je vragen?
  </p>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
    <p style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; font-weight: 600;">JE PERSOONLIJKE WELKOMSTCODE:</p>
    <p style="margin: 0 0 10px 0; font-size: 24px; font-family: monospace; color: #92400e; font-weight: bold;">${user.couponCode}</p>
    <p style="margin: 0; font-size: 14px; color: #92400e;">
      ✅ ${incentive.premiumMonths} maanden gratis Premium<br>
      ✅ ${incentive.superMessages} SuperBerichten<br>
      ✅ Nog ${daysRemaining + 7} dagen geldig (EXTRA WEEK!)
    </p>
  </div>

  <p style="font-size: 16px; margin-bottom: 20px;">
    <strong>EXTRA:</strong> Omdat je al interesse toonde, geven we je een <strong>extra week</strong> om te activeren.
    Je code is nu geldig tot <strong>${newExpiry.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}</strong>.
  </p>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://liefdevooriedereen.nl/welkom/${user.id}?utm_source=retarget&utm_medium=email"
       style="background: #e11d48; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;">
      Activeer Mijn Account →
    </a>
  </div>

  <p style="font-size: 16px; margin-bottom: 20px;">
    Vragen? Reply gewoon op deze email. We helpen je graag!
  </p>

  <p style="font-size: 16px; margin-bottom: 20px;">
    Groet,<br>
    Team Liefde Voor Iedereen
  </p>

  <p style="font-size: 14px; color: #94a3b8; font-style: italic;">
    P.S. 847+ leden zijn al overgestapt. Doe je ook mee?
  </p>

  <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 20px;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">
      Liefde Voor Iedereen • liefdevooriedereen.nl
    </p>
  </div>

</body>
</html>
        `

        const result = await sendEmail({
          to: user.oldEmail,
          subject,
          html,
          category: 'migration_retarget',
          userId: user.id
        })

        if (result.success) {
          sent++
          console.log(`✅ Sent to ${user.firstName} (${user.segment})`)

          // Update user status
          await prisma.$executeRaw`
            UPDATE "MigrationUser"
            SET "lastEmailSentAt" = NOW(),
                "updatedAt" = NOW()
            WHERE id = ${user.id}
          `
        } else {
          errors++
          console.log(`❌ Failed to send to ${user.firstName}`)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        errors++
        console.error(`Error sending to ${user.firstName}:`, error)
      }
    }

    console.log()
    console.log('═'.repeat(60))
    console.log(`✅ Retargeting complete: ${sent} sent, ${errors} errors`)
    console.log('═'.repeat(60))
  } else {
    console.log('ℹ️  DRY RUN - No emails sent')
    console.log()
    console.log('To actually send retargeting emails:')
    console.log('  npx tsx scripts/retarget-non-converters.ts --send')
    console.log()
  }

  await prisma.$disconnect()
}

// Check for --send flag
const shouldSend = process.argv.includes('--send')
retargetNonConverters(!shouldSend).catch(console.error)
