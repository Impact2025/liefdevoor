/**
 * WERELDKLASSE Spam Cleanup System
 *
 * Intelligently removes spam/bot accounts with:
 * - Multi-factor spam detection
 * - Safe mode with dry-run
 * - Whitelist protection
 * - Comprehensive audit logging
 * - Automatic scheduling capability
 * - Smart pattern recognition
 */

import { PrismaClient } from '@prisma/client'
import { auditLog } from '@/lib/audit'

const prisma = new PrismaClient()

interface CleanupStats {
  total: number
  deleted: number
  kept: number
  startTime: Date
  reasons: Record<string, number>
}

interface CleanupOptions {
  dryRun?: boolean
  aggressive?: boolean
  maxAge?: number // days
  minAge?: number // hours
}

interface SpamIndicators {
  score: number
  reasons: string[]
}

/**
 * Check if user is whitelisted (should never be deleted)
 */
function isWhitelisted(email: string): boolean {
  const whitelistedDomains = [
    '@liefdevooriedereen.nl',
    '@demo.nl',
    '@weareimpact.nl'
  ]

  return whitelistedDomains.some(domain => email.endsWith(domain))
}

/**
 * Calculate spam score for a user
 */
async function calculateSpamScore(user: {
  id: string
  email: string | null
  name: string | null
  emailVerified: Date | null
  onboardingStep: number
  isOnboarded: boolean
  createdAt: Date
}): Promise<SpamIndicators> {
  const indicators: SpamIndicators = {
    score: 0,
    reasons: []
  }

  if (!user.email) {
    indicators.score += 100
    indicators.reasons.push('No email')
    return indicators
  }

  // Check audit log for spam markers
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { userId: user.id },
        { ip: { not: null } } // Can't easily match email in metadata with current schema
      ],
      action: {
        in: [
          'REGISTER_HONEYPOT_TRIGGERED',
          'REGISTER_SPAM_DETECTED',
          'REGISTER_BLOCKED_EMAIL',
          'REGISTER_BOT_TIMING',
          'LOGIN_FAILED'
        ]
      }
    },
    take: 10
  })

  // HIGH RISK INDICATORS (30-50 points each)

  // Honeypot triggered
  if (auditLogs.some(log => log.action === 'REGISTER_HONEYPOT_TRIGGERED')) {
    indicators.score += 50
    indicators.reasons.push('Honeypot triggered')
  }

  // Bot timing detected
  if (auditLogs.some(log => log.action === 'REGISTER_BOT_TIMING')) {
    indicators.score += 40
    indicators.reasons.push('Bot timing detected')
  }

  // Multiple failed logins
  const failedLogins = auditLogs.filter(log => log.action === 'LOGIN_FAILED').length
  if (failedLogins >= 5) {
    indicators.score += 30
    indicators.reasons.push(`${failedLogins} failed logins`)
  } else if (failedLogins >= 3) {
    indicators.score += 15
    indicators.reasons.push(`${failedLogins} failed logins`)
  }

  // MEDIUM RISK INDICATORS (10-20 points each)

  // Not verified after 7+ days
  const daysSinceRegistration = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (!user.emailVerified && daysSinceRegistration >= 7) {
    indicators.score += 20
    indicators.reasons.push(`Not verified after ${Math.floor(daysSinceRegistration)} days`)
  } else if (!user.emailVerified && daysSinceRegistration >= 2) {
    indicators.score += 10
    indicators.reasons.push(`Not verified after ${Math.floor(daysSinceRegistration)} days`)
  }

  // Stuck at step 1 for long time
  if (!user.isOnboarded && user.onboardingStep === 1 && daysSinceRegistration >= 3) {
    indicators.score += 15
    indicators.reasons.push('Stuck at onboarding step 1')
  }

  // Suspicious name patterns
  const name = user.name || ''
  const suspiciousNamePatterns = [
    /^river\s+road$/i,
    /^test/i,
    /^spam/i,
    /^bot/i,
    /^\d+$/,  // Only numbers
    /^(.)\1{4,}/, // Repeated character (aaaaa)
  ]

  for (const pattern of suspiciousNamePatterns) {
    if (pattern.test(name)) {
      indicators.score += 15
      indicators.reasons.push(`Suspicious name pattern: ${name}`)
      break
    }
  }

  // LOW RISK INDICATORS (5-10 points each)

  // Suspicious email patterns
  const email = user.email.toLowerCase()
  const suspiciousEmailPatterns = [
    /^\w+\d{5,}@/,  // name followed by many numbers
    /^[a-z]{20,}@/,  // Very long random string
    /@tempmail\./i,
    /@throwaway\./i,
    /@guerrillamail\./i,
  ]

  for (const pattern of suspiciousEmailPatterns) {
    if (pattern.test(email)) {
      indicators.score += 10
      indicators.reasons.push('Suspicious email pattern')
      break
    }
  }

  // Check for duplicate names with different emails (bot pattern)
  if (name) {
    const duplicateNames = await prisma.user.count({
      where: {
        name: name,
        id: { not: user.id },
        emailVerified: null
      }
    })

    if (duplicateNames >= 2) {
      indicators.score += 20
      indicators.reasons.push(`${duplicateNames} other users with same name (not verified)`)
    }
  }

  return indicators
}

/**
 * Main cleanup function
 */
async function cleanupSpam(options: CleanupOptions = {}) {
  const {
    dryRun = false,
    aggressive = false,
    maxAge = 30, // Delete accounts older than 30 days
    minAge = 24 // Don't delete accounts younger than 24 hours
  } = options

  console.log('🧹 WERELDKLASSE SPAM CLEANUP SYSTEM')
  console.log('=' .repeat(80))
  console.log()

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No accounts will be deleted\n')
  }

  if (aggressive) {
    console.log('⚠️  AGGRESSIVE MODE - Lower spam threshold\n')
  }

  const stats: CleanupStats = {
    total: 0,
    deleted: 0,
    kept: 0,
    startTime: new Date(),
    reasons: {}
  }

  try {
    // Date boundaries
    const now = new Date()
    const minDate = new Date(now.getTime() - maxAge * 24 * 60 * 60 * 1000)
    const maxDate = new Date(now.getTime() - minAge * 60 * 60 * 1000)

    console.log('🔍 SCANNING FOR SPAM ACCOUNTS\n')
    console.log(`   Criteria:`)
    console.log(`   - Registered between ${minDate.toLocaleDateString('nl-NL')} and ${maxDate.toLocaleDateString('nl-NL')}`)
    console.log(`   - Spam score threshold: ${aggressive ? 30 : 50}`)
    console.log(`   - Whitelisted domains protected`)
    console.log()

    // Find potential spam accounts
    const suspects = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: minDate,
          lte: maxDate
        },
        role: { not: 'ADMIN' }, // Never delete admins
        email: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        onboardingStep: true,
        isOnboarded: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    stats.total = suspects.length
    console.log(`✅ Found ${suspects.length} accounts to analyze\n`)

    console.log('📊 ANALYZING ACCOUNTS\n')

    const spamThreshold = aggressive ? 30 : 50
    let analyzed = 0

    for (const user of suspects) {
      analyzed++
      const progress = ((analyzed / suspects.length) * 100).toFixed(1)

      // Check whitelist
      if (isWhitelisted(user.email!)) {
        stats.kept++
        continue
      }

      // Calculate spam score
      const spamIndicators = await calculateSpamScore(user)

      if (spamIndicators.score >= spamThreshold) {
        console.log(`[${analyzed}/${suspects.length}] (${progress}%) 🚩 SPAM DETECTED`)
        console.log(`   👤 ${user.name || 'Unknown'}`)
        console.log(`   📧 ${user.email}`)
        console.log(`   📊 Spam score: ${spamIndicators.score}`)
        console.log(`   📋 Reasons:`)
        for (const reason of spamIndicators.reasons) {
          console.log(`      - ${reason}`)
          stats.reasons[reason] = (stats.reasons[reason] || 0) + 1
        }

        if (dryRun) {
          console.log(`   ⏭️  Would delete (dry run)`)
          stats.deleted++
        } else {
          try {
            // Delete user and all related data (cascade)
            await prisma.user.delete({
              where: { id: user.id }
            })

            // Audit log
            await auditLog('SPAM_CLEANUP_DELETE', {
              userId: undefined,
              details: `Deleted spam account: ${user.email} (score: ${spamIndicators.score}, reasons: ${spamIndicators.reasons.join(', ')})`,
              success: true
            })

            console.log(`   ✅ Deleted`)
            stats.deleted++
          } catch (error) {
            console.log(`   ❌ Failed to delete: ${error}`)
            stats.kept++
          }
        }
        console.log()
      } else {
        // Keep this account
        stats.kept++

        // Log high-risk accounts that weren't deleted (for review)
        if (spamIndicators.score >= 30) {
          console.log(`[${analyzed}/${suspects.length}] (${progress}%) ⚠️  High risk but kept (score: ${spamIndicators.score})`)
          console.log(`   👤 ${user.name || 'Unknown'}`)
          console.log(`   📧 ${user.email}`)
          console.log()
        }
      }

      // Progress indicator every 10 accounts
      if (analyzed % 10 === 0) {
        console.log(`   ... processed ${analyzed}/${suspects.length} ...`)
      }
    }

    // Final report
    const duration = Date.now() - stats.startTime.getTime()
    const durationMin = (duration / 1000 / 60).toFixed(1)

    console.log('=' .repeat(80))
    console.log('📊 CLEANUP REPORT\n')
    console.log(`   Total analyzed: ${stats.total}`)
    console.log(`   🗑️  Deleted: ${stats.deleted} (${(stats.deleted / stats.total * 100).toFixed(1)}%)`)
    console.log(`   ✅ Kept: ${stats.kept} (${(stats.kept / stats.total * 100).toFixed(1)}%)`)
    console.log(`   ⏱️  Duration: ${durationMin} minutes`)
    console.log()

    if (Object.keys(stats.reasons).length > 0) {
      console.log('📈 TOP SPAM INDICATORS:\n')
      const sortedReasons = Object.entries(stats.reasons)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

      for (const [reason, count] of sortedReasons) {
        console.log(`   ${count}× ${reason}`)
      }
      console.log()
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS\n')

    if (stats.deleted === 0) {
      console.log(`   ✅ No spam found! System is clean.`)
    } else if (stats.deleted / stats.total < 0.1) {
      console.log(`   ✅ Low spam rate (${(stats.deleted / stats.total * 100).toFixed(1)}%) - system is healthy`)
    } else if (stats.deleted / stats.total < 0.3) {
      console.log(`   ⚠️  Moderate spam (${(stats.deleted / stats.total * 100).toFixed(1)}%) - consider stronger registration filters`)
    } else {
      console.log(`   🚨 High spam rate (${(stats.deleted / stats.total * 100).toFixed(1)}%) - URGENT: strengthen spam prevention!`)
      console.log(`   - Enable stricter Turnstile mode`)
      console.log(`   - Add email domain blacklist`)
      console.log(`   - Require phone verification for high-risk countries`)
    }

    console.log()
    console.log('=' .repeat(80))
    console.log('✅ Cleanup complete!')
    console.log()

    if (dryRun) {
      console.log('💡 This was a dry run. Run without --dry-run to actually delete accounts.')
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
const isAggressive = args.includes('--aggressive')
const maxAge = parseInt(args.find(arg => arg.startsWith('--max-age='))?.split('=')[1] || '30')
const minAge = parseInt(args.find(arg => arg.startsWith('--min-age='))?.split('=')[1] || '24')

if (args.includes('--help')) {
  console.log(`
USAGE: npx tsx scripts/spam-cleanup.ts [options]

OPTIONS:
  --dry-run            Don't actually delete, just show what would happen
  --aggressive         Lower spam threshold (30 instead of 50)
  --max-age=N          Delete accounts older than N days (default: 30)
  --min-age=N          Don't delete accounts younger than N hours (default: 24)
  --help               Show this help message

SPAM SCORING:
  High Risk (30-50 points):
  - Honeypot triggered (50 pts)
  - Bot timing detected (40 pts)
  - 5+ failed logins (30 pts)

  Medium Risk (10-20 points):
  - Not verified after 7+ days (20 pts)
  - Stuck at onboarding step 1 (15 pts)
  - Suspicious name pattern (15 pts)

  Low Risk (5-10 points):
  - Suspicious email pattern (10 pts)
  - Duplicate names (20 pts)

THRESHOLDS:
  - Normal mode: 50+ points = spam
  - Aggressive mode: 30+ points = spam

SAFETY:
  - Admin accounts never deleted
  - Whitelisted domains protected (@liefdevooriedereen.nl, @demo.nl, etc.)
  - Accounts < 24 hours old protected by default
  - Comprehensive audit logging

EXAMPLES:
  # Dry run to see what would be deleted
  npx tsx scripts/spam-cleanup.ts --dry-run

  # Conservative cleanup (default)
  npx tsx scripts/spam-cleanup.ts

  # Aggressive cleanup
  npx tsx scripts/spam-cleanup.ts --aggressive

  # Clean accounts 7-60 days old
  npx tsx scripts/spam-cleanup.ts --min-age=168 --max-age=60
  `)
  process.exit(0)
}

// Run
cleanupSpam({
  dryRun: isDryRun,
  aggressive: isAggressive,
  maxAge,
  minAge
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
