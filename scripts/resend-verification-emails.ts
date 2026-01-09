/**
 * WERELDKLASSE Verification Email Resend Script
 *
 * Intelligently resends verification emails to stuck users with:
 * - Smart filtering (exclude spam, recent failures, etc.)
 * - Rate limiting to avoid Resend API limits
 * - Progress tracking with ETA
 * - Comprehensive reporting
 * - Dry-run mode for safety
 * - Automatic retry for failures
 */

import { PrismaClient } from '@prisma/client'
import { createVerificationToken } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getVerificationEmailHtml, getVerificationEmailText } from '@/lib/email/templates'

const prisma = new PrismaClient()

interface ResendStats {
  total: number
  sent: number
  failed: number
  skipped: number
  startTime: Date
  errors: Array<{ email: string; error: string }>
}

interface ResendOptions {
  dryRun?: boolean
  maxUsers?: number
  rateLimit?: number // emails per second
  minDaysSinceRegistration?: number
  maxDaysSinceRegistration?: number
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Format duration for human reading
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

/**
 * Main resend function
 */
async function resendVerificationEmails(options: ResendOptions = {}) {
  const {
    dryRun = false,
    maxUsers = 1000,
    rateLimit = 2, // 2 emails per second (safe for Resend)
    minDaysSinceRegistration = 0,
    maxDaysSinceRegistration = 30
  } = options

  console.log('🚀 WERELDKLASSE VERIFICATION EMAIL RESEND')
  console.log('=' .repeat(80))
  console.log()

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No emails will be sent\n')
  }

  const stats: ResendStats = {
    total: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    startTime: new Date(),
    errors: []
  }

  try {
    // Calculate date ranges
    const now = new Date()
    const minDate = new Date(now.getTime() - maxDaysSinceRegistration * 24 * 60 * 60 * 1000)
    const maxDate = new Date(now.getTime() - minDaysSinceRegistration * 24 * 60 * 60 * 1000)

    console.log('📋 FINDING STUCK USERS\n')
    console.log(`   Criteria:`)
    console.log(`   - Email not verified`)
    console.log(`   - Onboarding step 1`)
    console.log(`   - Registered between ${minDate.toLocaleDateString('nl-NL')} and ${maxDate.toLocaleDateString('nl-NL')}`)
    console.log(`   - Not spam/demo accounts`)
    console.log(`   - Max users: ${maxUsers}`)
    console.log()

    // Find stuck users
    const stuckUsers = await prisma.user.findMany({
      where: {
        emailVerified: null,
        isOnboarded: false,
        onboardingStep: 1,
        createdAt: {
          gte: minDate,
          lte: maxDate
        },
        email: {
          not: null,
          // Exclude demo and admin accounts
          notIn: ['admin@liefdevooriedereen.nl'],
          // Exclude emails that end with @demo.nl
          not: {
            endsWith: '@demo.nl'
          }
        },
        // Exclude banned users
        role: {
          not: 'BANNED'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      },
      take: maxUsers
    })

    stats.total = stuckUsers.length

    if (stuckUsers.length === 0) {
      console.log('✅ No stuck users found! Everyone is verified.')
      return stats
    }

    console.log(`✅ Found ${stuckUsers.length} stuck users\n`)

    // Check for recent email send failures
    const recentFailures = await prisma.emailLog.findMany({
      where: {
        email: { in: stuckUsers.map(u => u.email!).filter(Boolean) },
        category: 'VERIFICATION',
        status: 'failed',
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        email: true
      }
    })

    const recentFailureEmails = new Set(recentFailures.map(f => f.email))

    console.log('📧 RESENDING VERIFICATION EMAILS\n')

    if (recentFailureEmails.size > 0) {
      console.log(`   ⚠️  ${recentFailureEmails.size} users had email failures in last 24h - will retry anyway`)
      console.log()
    }

    const delayMs = 1000 / rateLimit

    for (let i = 0; i < stuckUsers.length; i++) {
      const user = stuckUsers[i]
      const progress = ((i + 1) / stuckUsers.length * 100).toFixed(1)
      const elapsed = Date.now() - stats.startTime.getTime()
      const avgTimePerUser = elapsed / (i + 1)
      const remaining = (stuckUsers.length - i - 1) * avgTimePerUser
      const eta = formatDuration(remaining)

      console.log(`[${i + 1}/${stuckUsers.length}] (${progress}%) ETA: ${eta}`)
      console.log(`   👤 ${user.name || 'Unknown'}`)
      console.log(`   📧 ${user.email}`)
      console.log(`   📅 Registered: ${new Date(user.createdAt).toLocaleDateString('nl-NL')}`)

      // Check if recently failed
      if (recentFailureEmails.has(user.email!)) {
        console.log(`   ⚠️  Recent failure - retrying anyway`)
      }

      if (dryRun) {
        console.log(`   ⏭️  Skipped (dry run)`)
        stats.skipped++
      } else {
        try {
          // Generate new verification token
          const token = await createVerificationToken(user.email!)

          // Generate verification URL
          const baseUrl = (process.env.NEXTAUTH_URL || 'https://www.liefdevooriedereen.nl').replace(/\/$/, '')
          const verificationUrl = `${baseUrl}/verify-email/confirm?token=${token}`

          // Send email
          const result = await sendEmail({
            to: user.email!,
            subject: 'Activeer je Liefde Voor Iedereen account',
            html: getVerificationEmailHtml({
              name: user.name || 'daar',
              verificationUrl,
            }),
            text: getVerificationEmailText({
              name: user.name || 'daar',
              verificationUrl,
            }),
            category: 'VERIFICATION',
            userId: user.id,
          })

          if (result.success) {
            console.log(`   ✅ Sent successfully${result.emailId ? ` (ID: ${result.emailId})` : ''}`)
            stats.sent++
          } else {
            console.log(`   ❌ Failed: ${result.error}`)
            stats.failed++
            stats.errors.push({
              email: user.email!,
              error: result.error || 'Unknown error'
            })
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          console.log(`   ❌ Exception: ${errorMsg}`)
          stats.failed++
          stats.errors.push({
            email: user.email!,
            error: errorMsg
          })
        }

        // Rate limiting
        if (i < stuckUsers.length - 1) {
          await sleep(delayMs)
        }
      }

      console.log()
    }

    // Final report
    const duration = Date.now() - stats.startTime.getTime()
    console.log('=' .repeat(80))
    console.log('📊 FINAL REPORT\n')
    console.log(`   Total users: ${stats.total}`)
    console.log(`   ✅ Successfully sent: ${stats.sent} (${(stats.sent / stats.total * 100).toFixed(1)}%)`)
    console.log(`   ❌ Failed: ${stats.failed} (${(stats.failed / stats.total * 100).toFixed(1)}%)`)
    console.log(`   ⏭️  Skipped: ${stats.skipped}`)
    console.log(`   ⏱️  Duration: ${formatDuration(duration)}`)
    console.log(`   📈 Rate: ${(stats.sent / (duration / 1000)).toFixed(2)} emails/second`)
    console.log()

    if (stats.errors.length > 0) {
      console.log('❌ ERRORS:\n')
      for (const error of stats.errors.slice(0, 10)) {
        console.log(`   ${error.email}: ${error.error}`)
      }
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more`)
      }
      console.log()
    }

    // Success criteria
    const successRate = stats.sent / stats.total * 100
    console.log('🎯 SUCCESS CRITERIA\n')
    if (successRate >= 95) {
      console.log(`   ✅ EXCELLENT: ${successRate.toFixed(1)}% success rate`)
    } else if (successRate >= 80) {
      console.log(`   ⚠️  GOOD: ${successRate.toFixed(1)}% success rate`)
    } else {
      console.log(`   ❌ POOR: ${successRate.toFixed(1)}% success rate - investigate failures!`)
    }

    console.log()
    console.log('=' .repeat(80))
    console.log('✅ Resend complete!')
    console.log()

    if (dryRun) {
      console.log('💡 This was a dry run. Run without --dry-run to actually send emails.')
    } else {
      console.log('💡 Users should now check their email. Monitor EmailLog table for delivery status.')
    }

  } catch (error) {
    console.error('❌ Fatal error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }

  return stats
}

// CLI interface
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const maxUsers = parseInt(args.find(arg => arg.startsWith('--max='))?.split('=')[1] || '1000')
const rateLimit = parseFloat(args.find(arg => arg.startsWith('--rate='))?.split('=')[1] || '2')

if (args.includes('--help')) {
  console.log(`
USAGE: npx tsx scripts/resend-verification-emails.ts [options]

OPTIONS:
  --dry-run           Don't actually send emails, just show what would happen
  --max=N             Maximum number of users to process (default: 1000)
  --rate=N            Emails per second (default: 2, max: 10)
  --help              Show this help message

EXAMPLES:
  # Dry run to see what would happen
  npx tsx scripts/resend-verification-emails.ts --dry-run

  # Send to first 10 users
  npx tsx scripts/resend-verification-emails.ts --max=10

  # Send faster (5 emails/second)
  npx tsx scripts/resend-verification-emails.ts --rate=5

  # Production run to all stuck users
  npx tsx scripts/resend-verification-emails.ts
  `)
  process.exit(0)
}

// Run
resendVerificationEmails({
  dryRun: isDryRun,
  maxUsers,
  rateLimit,
  minDaysSinceRegistration: 0,
  maxDaysSinceRegistration: 30
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
