/**
 * Nurture Email Sequence Sender
 *
 * Sends follow-up emails to users who visited the landing page but didn't activate.
 *
 * Sequence:
 * - Day 3: Gentle reminder + extended deadline
 * - Day 7: Urgency + FOMO + testimonial
 * - Day 10: Soft sell + feedback request
 *
 * Expected conversion: 15-20% (3-5 conversions from 66 non-converters)
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import { ReminderDay3Email } from '@/lib/email/templates/migration/reminder-day3'
import { ReminderDay7Email } from '@/lib/email/templates/migration/reminder-day7'
import { ReminderDay10Email } from '@/lib/email/templates/migration/reminder-day10'

interface NurtureEmailConfig {
  day: 3 | 7 | 10
  template: 'day3' | 'day7' | 'day10'
  subject: string
  component: any
}

const NURTURE_CONFIGS: NurtureEmailConfig[] = [
  {
    day: 3,
    template: 'day3',
    subject: (firstName: string) => `${firstName}, mis je iets? Je Premium wacht nog steeds 🎁`,
    component: ReminderDay3Email,
  },
  {
    day: 7,
    template: 'day7',
    subject: (firstName: string) => `⏰ ${firstName}, laatste kans! Je Premium vervalt binnenkort`,
    component: ReminderDay7Email,
  },
  {
    day: 10,
    template: 'day10',
    subject: (firstName: string) => `${firstName}, we begrijpen het - maar de deur staat nog open...`,
    component: ReminderDay10Email,
  },
]

async function sendNurtureSequence(dryRun = true, dayToSend?: 3 | 7 | 10, limit = 10) {
  console.log('=== NURTURE EMAIL SEQUENCE ===\n')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Day filter: ${dayToSend || 'All days'}`)
  console.log(`Limit: ${limit}\n`)

  // Get count of activated users for social proof
  const activatedCount = await prisma.migrationUser.count({
    where: {
      status: { in: ['CLAIMED', 'ACTIVATED'] },
    },
  })

  let totalSent = 0
  let totalErrors = 0

  // Process each nurture day
  for (const config of NURTURE_CONFIGS) {
    // Skip if filtering by specific day
    if (dayToSend && config.day !== dayToSend) {
      continue
    }

    console.log(`\n📧 Processing Day ${config.day} Emails (${config.template})`)
    console.log('─'.repeat(50))

    // Find users who:
    // 1. Visited landing page (LANDING_VISITED status)
    // 2. X days ago (based on config.day)
    // 3. Haven't received this specific nurture email yet
    // 4. Haven't activated yet

    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - config.day)
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const users = await prisma.migrationUser.findMany({
      where: {
        status: 'LANDING_VISITED',
        landingVisitedAt: {
          gte: targetDate,
          lt: nextDay,
        },
        // Check if this specific nurture email was already sent
        nurtureEmailsSent: {
          not: {
            contains: config.template,
          },
        },
      },
      take: limit,
      orderBy: {
        landingVisitedAt: 'desc',
      },
    })

    console.log(`Found ${users.length} users to email`)

    if (users.length === 0) {
      console.log('✓ No users to email for this day\n')
      continue
    }

    // Send emails
    for (const user of users) {
      try {
        // Calculate days remaining (from coupon expiry)
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
            superMessages: user.superMessages || 0,
          },
          daysRemaining: Math.max(daysRemaining, 1),
          activatedCount,
          ...(config.day === 10 && {
            feedbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/feedback?user=${user.claimToken}`,
          }),
        }

        const subject = typeof config.subject === 'function'
          ? config.subject(user.firstName)
          : config.subject

        console.log(`\n  → ${user.firstName} (${user.email})`)
        console.log(`    Subject: ${subject}`)
        console.log(`    Days remaining: ${daysRemaining}`)

        if (!dryRun) {
          // Render email
          const emailComponent = React.createElement(config.component, emailData)
          const html = render(emailComponent)
          const text = render(emailComponent, { plainText: true })

          // Send email
          const result = await sendEmail({
            to: user.email,
            subject,
            html,
            text,
            category: 'MIGRATION_NURTURE',
            userId: user.newUserId || undefined,
          })

          if (!result.success) {
            console.log(`    ❌ Error:`, result.error)
            totalErrors++

            // Log error to database
            await prisma.migrationError.create({
              data: {
                migrationUserId: user.id,
                errorType: 'EMAIL_SEND_FAILED',
                errorMessage: `Nurture ${config.template} failed: ${result.error}`,
                context: { error: result.error },
              },
            })
          } else {
            console.log(`    ✅ Sent${result.emailId ? ` (ID: ${result.emailId})` : ''}`)
            totalSent++

            // Update user record
            const currentNurtureEmails = user.nurtureEmailsSent || ''
            const updatedNurtureEmails = currentNurtureEmails
              ? `${currentNurtureEmails},${config.template}`
              : config.template

            await prisma.migrationUser.update({
              where: { id: user.id },
              data: {
                nurtureEmailsSent: updatedNurtureEmails,
                lastEmailSentAt: new Date(),
              },
            })

            // Create email record (if Resend ID available)
            if (result.emailId) {
              await prisma.migrationEmail.create({
                data: {
                  migrationUserId: user.id,
                  resendId: result.emailId,
                  emailType: 'NURTURE',
                  subject,
                  sentAt: new Date(),
                },
              })
            }
          }

          // Rate limiting (2 emails/second)
          await new Promise((resolve) => setTimeout(resolve, 500))
        } else {
          console.log(`    🔍 [DRY RUN] Would send email`)
        }
      } catch (error) {
        console.log(`    ❌ Error:`, error)
        totalErrors++
      }
    }

    console.log(`\n✓ Day ${config.day} complete`)
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('SUMMARY')
  console.log('='.repeat(50))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no emails sent)' : 'LIVE'}`)
  console.log(`Total sent: ${totalSent}`)
  console.log(`Total errors: ${totalErrors}`)
  console.log(`Success rate: ${totalSent > 0 ? ((totalSent / (totalSent + totalErrors)) * 100).toFixed(1) : 0}%`)

  if (dryRun) {
    console.log('\n💡 Run with --live to actually send emails')
    console.log('💡 Run with --day=3 to send only day 3 emails')
    console.log('💡 Run with --limit=100 to change batch size')
  } else {
    console.log('\n✅ Nurture sequence sent!')
    console.log('\nNext steps:')
    console.log('1. Monitor conversions in 2-3 days')
    console.log('2. Run: npx tsx scripts/check-migration-status.ts')
    console.log('3. Check analytics: npx tsx scripts/segment-conversion-analysis.ts')
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--live')
const dayArg = args.find((arg) => arg.startsWith('--day='))
const dayToSend = dayArg ? parseInt(dayArg.split('=')[1]) as 3 | 7 | 10 : undefined
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10

// Run
sendNurtureSequence(dryRun, dayToSend, limit)
  .then(() => {
    console.log('\n✅ Script complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
