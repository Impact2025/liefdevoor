/**
 * Day 7 Reminder Email Script
 *
 * Send reminder to non-converters in VIP, GOLD, ACTIVE, DORMANT segments
 * Run on: 10 februari 2026 (7 days after first email)
 *
 * Usage:
 *   npx tsx scripts/send-day7-reminder.ts                    # Dry run
 *   npx tsx scripts/send-day7-reminder.ts --live             # Send emails
 *   npx tsx scripts/send-day7-reminder.ts --live --limit=50  # Send max 50
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import MigrationReminderEmail from '@/lib/email/templates/migration/reminder'

interface ReminderStats {
  vipSent: number
  goldSent: number
  activeSent: number
  dormantSent: number
  errors: number
  totalSent: number
}

async function sendDay7Reminder(dryRun = true, limit = 500): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║         DAY 7 REMINDER EMAIL SENDER                      ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log()
  console.log(`Mode:  ${dryRun ? '🔍 DRY RUN' : '✉️  LIVE'}`)
  console.log(`Limit: ${limit} emails per segment`)
  console.log(`Date:  ${new Date().toLocaleDateString('nl-NL')}`)
  console.log()

  const stats: ReminderStats = {
    vipSent: 0,
    goldSent: 0,
    activeSent: 0,
    dormantSent: 0,
    errors: 0,
    totalSent: 0
  }

  // Get activated count for social proof
  const activatedCount = await prisma.migrationUser.count({
    where: { status: { in: ['CLAIMED', 'ACTIVATED'] } }
  })

  console.log(`📊 Social Proof: ${activatedCount} mensen hebben al geactiveerd\n`)

  // Send to each segment
  stats.vipSent = await sendSegmentReminders('VIP', activatedCount, dryRun, limit)
  stats.goldSent = await sendSegmentReminders('GOLD', activatedCount, dryRun, limit)
  stats.activeSent = await sendSegmentReminders('ACTIVE', activatedCount, dryRun, limit)
  stats.dormantSent = await sendSegmentReminders('DORMANT', activatedCount, dryRun, limit)

  stats.totalSent = stats.vipSent + stats.goldSent + stats.activeSent + stats.dormantSent

  // Summary
  console.log()
  console.log('═'.repeat(60))
  console.log('SUMMARY')
  console.log('═'.repeat(60))
  console.log(`Mode:        ${dryRun ? 'DRY RUN (no emails sent)' : 'LIVE'}`)
  console.log(`VIP:         ${stats.vipSent} emails ${stats.vipSent > 0 ? '✅' : ''}`)
  console.log(`GOLD:        ${stats.goldSent} emails ${stats.goldSent > 0 ? '✅' : ''}`)
  console.log(`ACTIVE:      ${stats.activeSent} emails ${stats.activeSent > 0 ? '✅' : ''}`)
  console.log(`DORMANT:     ${stats.dormantSent} emails ${stats.dormantSent > 0 ? '✅' : ''}`)
  console.log(`Total Sent:  ${stats.totalSent}`)
  console.log(`Errors:      ${stats.errors}`)
  console.log()

  if (stats.totalSent === 0) {
    console.log('ℹ️  No emails sent - all users already converted!')
  } else if (!dryRun) {
    console.log('✅ Reminder emails sent successfully!')
    console.log()
    console.log('Expected impact:')
    console.log(`  - ${Math.round(stats.totalSent * 0.10)}-${Math.round(stats.totalSent * 0.15)} nieuwe conversies (10-15%)`)
    console.log(`  - €${Math.round(stats.totalSent * 0.10 * 13)}-€${Math.round(stats.totalSent * 0.15 * 13)} extra MRR`)
    console.log()
    console.log('Next steps:')
    console.log('1. Monitor dashboard voor nieuwe conversies')
    console.log('2. Check email open/click rates in Resend')
    console.log('3. Run health check vanavond')
  } else {
    console.log('💡 Run with --live flag to send emails')
  }
  console.log()

  await prisma.$disconnect()
}

async function sendSegmentReminders(
  segment: string,
  activatedCount: number,
  dryRun: boolean,
  limit: number
): Promise<number> {
  console.log(`\n📧 ${segment} Segment Reminders`)
  console.log('─'.repeat(60))

  // Find users who:
  // 1. Are in this segment
  // 2. Received first email (status != PENDING)
  // 3. Have NOT converted yet (status != CLAIMED, ACTIVATED)
  const users = await prisma.migrationUser.findMany({
    where: {
      segment: segment as any,
      status: {
        in: ['EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED']
      }
    },
    take: limit,
    orderBy: { lastEmailSentAt: 'asc' }
  })

  console.log(`Found: ${users.length} non-converters`)

  if (users.length === 0) {
    console.log('✓ All users in this segment already converted!')
    return 0
  }

  let sent = 0
  let errors = 0

  for (const user of users) {
    try {
      // Calculate days remaining
      const expiryDate = user.couponExpiresAt
      const daysRemaining = expiryDate
        ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 21

      // Prepare email data
      const emailData = {
        userName: user.firstName,
        landingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/welkom/${user.claimToken}`,
        couponCode: user.couponCode || 'WELKOM2026',
        daysRemaining: Math.max(daysRemaining, 1),
        photoCount: user.photoCount || 0,
        messageCount: user.messageCount || 0
      }

      // Laatste kans subject line (deadline verlengd tot 31 maart)
      const subject = `${user.firstName}, laatste kans: je premium toegang verloopt 31 maart`

      console.log(`  → ${user.firstName} (${user.oldEmail}) - ${daysRemaining}d remaining`)

      if (!dryRun) {
        // Render email (render is async in v2.0.0)
        const html = await render(MigrationReminderEmail(emailData))
        const text = await render(MigrationReminderEmail(emailData), { plainText: true })

        // Send email
        const result = await sendEmail({
          to: user.oldEmail,
          subject,
          html,
          text,
          category: 'MIGRATION_REMINDER',
          userId: user.newUserId || undefined
        })

        if (!result.success) {
          console.log(`    ❌ Error: ${result.error}`)
          errors++

          // Log error
          await prisma.migrationError.create({
            data: {
              migrationUserId: user.id,
              errorType: 'EMAIL_SEND_FAILED',
              errorMessage: `Day 7 reminder failed: ${result.error}`,
              context: { error: result.error }
            }
          })
        } else {
          console.log(`    ✅ Sent`)
          sent++

          // Update user record
          await prisma.migrationUser.update({
            where: { id: user.id },
            data: {
              lastEmailSentAt: new Date()
            }
          })

          // Create email record
          if (result.emailId) {
            await prisma.migrationEmail.create({
              data: {
                migrationUserId: user.id,
                resendId: result.emailId,
                emailType: 'REMINDER',
                subject,
                sentAt: new Date()
              }
            })
          }
        }

        // Rate limiting (2 emails/second)
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        console.log(`    🔍 [DRY RUN] Would send reminder`)
        sent++
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error}`)
      errors++
    }
  }

  console.log(`✓ ${segment} complete: ${sent} sent, ${errors} errors`)
  return sent
}

// Parse arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--live')
const limitArg = args.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 500

// Run
sendDay7Reminder(dryRun, limit)
  .then(() => {
    console.log('✅ Day 7 reminder sender complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Day 7 reminder sender failed:', error)
    process.exit(1)
  })
