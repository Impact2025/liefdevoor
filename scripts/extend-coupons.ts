/**
 * Extend Coupon Expiry Dates
 *
 * Extends expired coupons to give non-converters more time
 *
 * Usage:
 *   npx tsx scripts/extend-coupons.ts              # Dry run
 *   npx tsx scripts/extend-coupons.ts --live       # Extend coupons
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function extendCoupons(dryRun = true) {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║         EXTEND COUPON EXPIRY DATES                       ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log()
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✉️  LIVE'}`)
  console.log(`Date: ${new Date().toLocaleDateString('nl-NL')}`)
  console.log()

  // New expiry date: 31 maart 2026
  const newExpiryDate = new Date('2026-03-31T23:59:59Z')

  console.log(`New expiry date: ${newExpiryDate.toLocaleDateString('nl-NL')}`)
  console.log()

  // Find all non-converters
  const nonConverters = await prisma.migrationUser.findMany({
    where: {
      status: {
        in: ['EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED']
      },
      segment: { in: ['VIP', 'GOLD', 'ACTIVE', 'DORMANT'] }
    },
    select: {
      id: true,
      firstName: true,
      segment: true,
      couponExpiresAt: true,
      couponCode: true
    }
  })

  console.log(`📊 Found: ${nonConverters.length} non-converters\n`)

  // Count expired vs valid
  const now = new Date()
  const expired = nonConverters.filter(u => u.couponExpiresAt && u.couponExpiresAt < now).length
  const valid = nonConverters.filter(u => u.couponExpiresAt && u.couponExpiresAt >= now).length

  console.log(`Expired coupons: ${expired}`)
  console.log(`Valid coupons:   ${valid}`)
  console.log()

  if (!dryRun) {
    console.log('Extending coupons...\n')

    const result = await prisma.migrationUser.updateMany({
      where: {
        status: {
          in: ['EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED']
        },
        segment: { in: ['VIP', 'GOLD', 'ACTIVE', 'DORMANT'] }
      },
      data: {
        couponExpiresAt: newExpiryDate
      }
    })

    console.log(`✅ Extended ${result.count} coupons to ${newExpiryDate.toLocaleDateString('nl-NL')}`)
    console.log()
    console.log('Next steps:')
    console.log('1. Run reminder script dry run to verify')
    console.log('2. Send reminder emails with --live')
  } else {
    console.log('💡 DRY RUN - No changes made')
    console.log()
    console.log('Run with --live to extend coupons:')
    console.log('  npx tsx scripts/extend-coupons.ts --live')
  }

  await prisma.$disconnect()
}

// Parse arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--live')

// Run
extendCoupons(dryRun)
  .then(() => {
    console.log('\n✅ Coupon extension complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Coupon extension failed:', error)
    process.exit(1)
  })
