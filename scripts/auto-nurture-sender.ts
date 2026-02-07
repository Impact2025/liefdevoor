/**
 * Automated Nurture Email Sender
 *
 * Run this daily (via cron) to automatically send nurture emails
 * when users reach the appropriate day thresholds
 *
 * Usage:
 *   npx tsx scripts/auto-nurture-sender.ts [--dry-run] [--limit=100]
 *
 * Cron Example (daily at 10am):
 *   0 10 * * * cd /path/to/app && npx tsx scripts/auto-nurture-sender.ts
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import { ReminderDay3Email } from '@/lib/email/templates/migration/reminder-day3'
import { ReminderDay7Email } from '@/lib/email/templates/migration/reminder-day7'
import { ReminderDay10Email } from '@/lib/email/templates/migration/reminder-day10'

interface DailyRun {
  day3Sent: number
  day7Sent: number
  day10Sent: number
  errors: number
  totalSent: number
}

async function autoNurtureSender(dryRun = false, limit = 100): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║         AUTOMATED NURTURE EMAIL SENDER                   ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log()
  console.log(`Mode:  ${dryRun ? '🔍 DRY RUN' : '✉️  LIVE'}`)
  console.log(`Limit: ${limit} emails per day threshold`)
  console.log(`Time:  ${new Date().toLocaleString('nl-NL')}`)
  console.log()

  const results: DailyRun = {
    day3Sent: 0,
    day7Sent: 0,
    day10Sent: 0,
    errors: 0,
    totalSent: 0
  }

  // Get activated count for social proof
  const activatedCount = await prisma.migrationUser.count({
    where: { status: { in: ['CLAIMED', 'ACTIVATED'] } }
  })

  // Send Day 3 emails
  results.day3Sent = await sendDayEmails(3, ReminderDay3Email, activatedCount, dryRun, limit)

  // Send Day 7 emails
  results.day7Sent = await sendDayEmails(7, ReminderDay7Email, activatedCount, dryRun, limit)

  // Send Day 10 emails
  results.day10Sent = await sendDayEmails(10, ReminderDay10Email, activatedCount, dryRun, limit)

  results.totalSent = results.day3Sent + results.day7Sent + results.day10Sent

  // Summary
  console.log()
  console.log('═'.repeat(60))
  console.log('SUMMARY')
  console.log('═'.repeat(60))
  console.log(`Mode:        ${dryRun ? 'DRY RUN (no emails sent)' : 'LIVE'}`)
  console.log(`Day 3:       ${results.day3Sent} emails ${results.day3Sent > 0 ? '✅' : ''}`)
  console.log(`Day 7:       ${results.day7Sent} emails ${results.day7Sent > 0 ? '✅' : ''}`)
  console.log(`Day 10:      ${results.day10Sent} emails ${results.day10Sent > 0 ? '✅' : ''}`)
  console.log(`Total Sent:  ${results.totalSent}`)
  console.log(`Errors:      ${results.errors}`)
  console.log()

  if (results.totalSent === 0) {
    console.log('ℹ️  No emails sent - no users at day thresholds yet')
  } else if (!dryRun) {
    console.log('✅ Nurture emails sent successfully!')
    console.log()
    console.log('Next steps:')
    console.log('1. Check dashboard for conversions')
    console.log('2. Monitor email open/click rates')
    console.log('3. Run again tomorrow for next batch')
  } else {
    console.log('💡 Run with --live flag to send emails')
  }
  console.log()

  await prisma.$disconnect()
}

async function sendDayEmails(
  day: 3 | 7 | 10,
  EmailComponent: any,
  activatedCount: number,
  dryRun: boolean,
  limit: number
): Promise<number> {
  const dayTemplate = `day${day}` as 'day3' | 'day7' | 'day10'

  console.log(`\n📧 Day ${day} Emails`)
  console.log('─'.repeat(60))

  // Calculate date range for users who visited exactly X days ago
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() - day)
  targetDate.setHours(0, 0, 0, 0)

  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  // Find users who:
  // 1. Visited landing page exactly X days ago
  // 2. Haven't received this specific nurture email yet
  // 3. Still have status LANDING_VISITED (didn't convert yet)
  const users = await prisma.migrationUser.findMany({
    where: {
      status: 'LANDING_VISITED',
      landingVisitedAt: {
        gte: targetDate,
        lt: nextDay
      },
      nurtureEmailsSent: {
        not: { contains: dayTemplate }
      }
    },
    take: limit,
    orderBy: { landingVisitedAt: 'desc' }
  })

  console.log(`Found: ${users.length} users`)

  if (users.length === 0) {
    console.log('✓ No users to email for Day ${day}')
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
        : 14

      // Prepare email data
      const emailData = {
        firstName: user.firstName,
        lastName: user.lastName || undefined,
        activationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/welkom/${user.claimToken}`,
        couponCode: user.couponCode || 'OOGVOOR2026',
        incentive: {
          premiumMonths: user.premiumMonths || 1,
          superMessages: user.superMessages || 0
        },
        daysRemaining: Math.max(daysRemaining, 1),
        activatedCount,
        ...(day === 10 && {
          feedbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/feedback?user=${user.claimToken}`
        })
      }

      const subject = day === 3
        ? `${user.firstName}, mis je iets? Je Premium wacht nog steeds 🎁`
        : day === 7
        ? `⏰ ${user.firstName}, laatste kans! Je Premium vervalt binnenkort`
        : `${user.firstName}, we begrijpen het - maar de deur staat nog open...`

      console.log(`  → ${user.firstName} (${user.email})`)

      if (!dryRun) {
        // Render email
        const emailComponent = React.createElement(EmailComponent, emailData)
        const html = render(emailComponent)
        const text = render(emailComponent, { plainText: true })

        // Send email
        const result = await sendEmail({
          to: user.email,
          subject,
          html,
          text,
          category: 'MIGRATION_NURTURE',
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
              errorMessage: `Nurture ${dayTemplate} failed: ${result.error}`,
              context: { error: result.error }
            }
          })
        } else {
          console.log(`    ✅ Sent`)
          sent++

          // Update user record
          const currentNurtureEmails = user.nurtureEmailsSent || ''
          const updatedNurtureEmails = currentNurtureEmails
            ? `${currentNurtureEmails},${dayTemplate}`
            : dayTemplate

          await prisma.migrationUser.update({
            where: { id: user.id },
            data: {
              nurtureEmailsSent: updatedNurtureEmails,
              lastEmailSentAt: new Date()
            }
          })

          // Create email record
          if (result.emailId) {
            await prisma.migrationEmail.create({
              data: {
                migrationUserId: user.id,
                resendId: result.emailId,
                emailType: 'NURTURE',
                subject,
                sentAt: new Date()
              }
            })
          }
        }

        // Rate limiting (2 emails/second)
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        console.log(`    🔍 [DRY RUN] Would send`)
        sent++
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error}`)
      errors++
    }
  }

  console.log(`✓ Day ${day} complete: ${sent} sent, ${errors} errors`)
  return sent
}

// Parse arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--live')
const limitArg = args.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 100

// Run
autoNurtureSender(dryRun, limit)
  .then(() => {
    console.log('✅ Auto-nurture sender complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Auto-nurture sender failed:', error)
    process.exit(1)
  })
