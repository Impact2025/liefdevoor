/**
 * Valentijnsdag Comeback Campaign
 *
 * Send to best 436 INACTIVE users
 * Offer: Gratis 1 maand Premium (na compleet profiel)
 *
 * Usage:
 *   npx tsx scripts/send-valentines-comeback.ts                # Dry run
 *   npx tsx scripts/send-valentines-comeback.ts --live         # Send emails
 */

import { PrismaClient } from '@prisma/client'
import { sendEmail } from '@/lib/email/send'
import { render } from '@react-email/render'
import ValentinesComebackEmail from '@/lib/email/templates/valentines/comeback'

const prisma = new PrismaClient()

interface CampaignStats {
  sent: number
  errors: number
}

async function sendValentinesComebackCampaign(dryRun = true) {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║      VALENTIJNSDAG COMEBACK CAMPAIGN                     ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log()
  console.log(`Mode:  ${dryRun ? '🔍 DRY RUN' : '💝 LIVE'}`)
  console.log(`Date:  ${new Date().toLocaleDateString('nl-NL')}`)
  console.log()

  const stats: CampaignStats = {
    sent: 0,
    errors: 0
  }

  // Get best INACTIVE users (most recent, with photos/messages)
  const users = await prisma.migrationUser.findMany({
    where: {
      segment: 'INACTIVE',
      status: 'PENDING' // Haven't been contacted yet
    },
    orderBy: [
      { memberSince: 'desc' },      // Most recent first
      { photoCount: 'desc' },        // More photos = more invested
      { messageCount: 'desc' }       // More messages = more engaged
    ],
    take: 1500 // Will get whatever is available (436 in practice)
  })

  console.log(`📊 Found: ${users.length} users`)
  console.log()

  if (users.length === 0) {
    console.log('ℹ️  No INACTIVE users to email')
    await prisma.$disconnect()
    return
  }

  // Show sample
  console.log('👥 Sample users:')
  users.slice(0, 5).forEach((u, i) => {
    console.log(`  ${i+1}. ${u.firstName} - ${u.photoCount} photos, ${u.messageCount} msgs`)
  })
  console.log()

  console.log(`Starting campaign for ${users.length} users...`)
  console.log()

  // Send to each user
  for (const user of users) {
    try {
      // Signup URL with tracking
      const signupUrl = `${process.env.NEXT_PUBLIC_BASE_URL}?ref=valentine2026&utm_source=email&utm_medium=comeback&utm_campaign=valentines2026`

      const subject = `${user.firstName}, gratis Premium deze Valentijnsdag 💝`

      if (!dryRun) {
        // Render email (async in v2.0.0)
        const html = await render(ValentinesComebackEmail({
          userName: user.firstName,
          signupUrl
        }))
        const text = await render(ValentinesComebackEmail({
          userName: user.firstName,
          signupUrl
        }), { plainText: true })

        // Send email
        const result = await sendEmail({
          to: user.oldEmail,
          subject,
          html,
          text,
          category: 'VALENTINES_COMEBACK',
          userId: user.newUserId || undefined
        })

        if (!result.success) {
          console.log(`  ❌ ${user.firstName} (${user.oldEmail}) - ${result.error}`)
          stats.errors++

          // Log error
          await prisma.migrationError.create({
            data: {
              migrationUserId: user.id,
              errorType: 'EMAIL_SEND_FAILED',
              errorMessage: `Valentines comeback failed: ${result.error}`,
              context: { error: result.error }
            }
          })
        } else {
          console.log(`  ✅ ${user.firstName} (${user.oldEmail})`)
          stats.sent++

          // Update user record
          await prisma.migrationUser.update({
            where: { id: user.id },
            data: {
              status: 'EMAIL_SENT',
              lastEmailSentAt: new Date()
            }
          })

          // Create email record
          if (result.emailId) {
            await prisma.migrationEmail.create({
              data: {
                migrationUserId: user.id,
                resendId: result.emailId,
                emailType: 'VALENTINES_COMEBACK',
                subject,
                sentAt: new Date()
              }
            })
          }
        }

        // Rate limiting (2 emails/second)
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        console.log(`  🔍 ${user.firstName} (${user.oldEmail})`)
        stats.sent++
      }
    } catch (error) {
      console.log(`  ❌ ${user.firstName} - Error: ${error}`)
      stats.errors++
    }
  }

  // Summary
  console.log()
  console.log('═'.repeat(60))
  console.log('SUMMARY')
  console.log('═'.repeat(60))
  console.log(`Mode:        ${dryRun ? 'DRY RUN (no emails sent)' : 'LIVE'}`)
  console.log(`Total Sent:  ${stats.sent}`)
  console.log(`Errors:      ${stats.errors}`)
  console.log()

  if (stats.sent > 0 && !dryRun) {
    console.log('✅ Valentijnsdag comeback campaign sent successfully!')
    console.log()
    console.log('📊 Expected Results:')
    console.log(`  - ${Math.round(stats.sent * 0.15)}-${Math.round(stats.sent * 0.20)} email opens (15-20%)`)
    console.log(`  - ${Math.round(stats.sent * 0.03)}-${Math.round(stats.sent * 0.05)} clicks (3-5%)`)
    console.log(`  - ${Math.round(stats.sent * 0.01)}-${Math.round(stats.sent * 0.02)} activations (1-2%)`)
    console.log()
    console.log('💰 Revenue Potential:')
    const minActivations = Math.round(stats.sent * 0.01)
    const maxActivations = Math.round(stats.sent * 0.02)
    console.log(`  - ${minActivations}-${maxActivations} nieuwe gebruikers`)
    console.log(`  - €${minActivations * 13}-€${maxActivations * 13}/maand MRR (na gratis periode)`)
    console.log(`  - €${minActivations * 130}-€${maxActivations * 130} LTV (1 jaar avg)`)
    console.log()
    console.log('🎯 Next Steps:')
    console.log('1. Monitor dashboard voor activaties')
    console.log('2. Check email stats in Resend')
    console.log('3. Run health check morgen')
  } else if (dryRun) {
    console.log('💡 Run with --live to send emails')
  }

  await prisma.$disconnect()
}

// Parse arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--live')

// Run
sendValentinesComebackCampaign(dryRun)
  .then(() => {
    console.log('\n✅ Valentijnsdag comeback campaign complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Campaign failed:', error)
    process.exit(1)
  })
