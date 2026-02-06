/**
 * Check if migration coupons exist in Coupon table
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCoupons() {
  console.log('\n=== COUPON CHECK ===\n')

  // Get coupon codes from claimed migration users
  const migrationCoupons = await prisma.$queryRaw<{ couponCode: string }[]>`
    SELECT DISTINCT "couponCode"
    FROM "MigrationUser"
    WHERE status IN ('CLAIMED', 'ACTIVATED')
    AND "couponCode" IS NOT NULL
  `

  console.log(`Migration coupons van geclaimde users: ${migrationCoupons.length}`)

  // Check how many exist in Coupon table
  const codes = migrationCoupons.map(c => c.couponCode)

  const existingCoupons = await prisma.coupon.findMany({
    where: {
      code: { in: codes }
    },
    select: { code: true }
  })

  console.log(`Coupons in Coupon tabel: ${existingCoupons.length}`)
  console.log(`Ontbrekende coupons: ${codes.length - existingCoupons.length}`)

  const existingCodes = new Set(existingCoupons.map(c => c.code))
  const missingCodes = codes.filter(c => !existingCodes.has(c))

  if (missingCodes.length > 0) {
    console.log('\nOntbrekende coupon codes:')
    missingCodes.slice(0, 10).forEach(c => console.log(`  - ${c}`))
    if (missingCodes.length > 10) {
      console.log(`  ... en ${missingCodes.length - 10} meer`)
    }
  }

  // Check total coupons in system
  const totalCoupons = await prisma.coupon.count()
  console.log(`\nTotaal coupons in systeem: ${totalCoupons}`)

  // Check coupon usages
  const usages = await prisma.couponUsage.count()
  console.log(`Coupon usages: ${usages}`)

  await prisma.$disconnect()
}

checkCoupons().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
