import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRuben() {
  console.log('\n=== RUBEN ACCOUNT CHECK ===\n')

  // Find user by email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'rubenpols@kpnmail.nl' },
        { name: { contains: 'Ruben1980', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      registrationSource: true,
      createdAt: true,
      subscriptions: true
    }
  })

  if (user) {
    console.log('User gevonden:')
    console.log('  ID:', user.id)
    console.log('  Name:', user.name)
    console.log('  Email:', user.email)
    console.log('  Subscription Tier:', user.subscriptionTier)
    console.log('  Registration Source:', user.registrationSource)
    console.log('  Created:', user.createdAt)
    if (user.subscriptions && user.subscriptions.length > 0) {
      console.log('  Subscriptions:', user.subscriptions)
    }
  } else {
    console.log('User niet gevonden met email rubenpols@kpnmail.nl of naam Ruben1980')
  }

  // Find coupon oogvoor2026
  console.log('\n=== COUPON CHECK ===\n')
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: { equals: 'oogvoor2026', mode: 'insensitive' }
    }
  })

  if (coupon) {
    console.log('Coupon gevonden:')
    console.log('  Code:', coupon.code)
    console.log('  Type:', coupon.type)
    console.log('  Value:', coupon.value)
    console.log('  Is Active:', coupon.isActive)
    console.log('  Valid From:', coupon.validFrom)
    console.log('  Valid Until:', coupon.validUntil)
    console.log('  Max Uses:', coupon.maxTotalUses)
    console.log('  Times Used:', coupon.timesUsed)
  } else {
    console.log('Coupon "oogvoor2026" niet gevonden')

    // List all coupons with oogvoor
    const allCoupons = await prisma.coupon.findMany({
      where: {
        code: { contains: 'oogvoor', mode: 'insensitive' }
      }
    })

    if (allCoupons.length > 0) {
      console.log('\nVergelijkbare coupons:')
      allCoupons.forEach(c => {
        console.log(`  - ${c.code} (${c.isActive ? 'actief' : 'inactief'})`)
      })
    }
  }

  // Check migration user
  console.log('\n=== MIGRATION USER CHECK ===\n')
  const migrationUsers = await prisma.$queryRaw<any[]>`
    SELECT id, "firstName", "oldEmail", segment, status, "couponCode", "claimedAt"
    FROM "MigrationUser"
    WHERE "oldEmail" ILIKE '%rubenpols%'
    OR "oldEmail" ILIKE '%ruben%'
    OR "firstName" ILIKE '%ruben%'
    LIMIT 10
  `

  if (migrationUsers.length > 0) {
    console.log('Migration users gevonden:')
    migrationUsers.forEach(u => {
      console.log(`  - ${u.firstName} <${u.oldEmail}>`)
      console.log(`    Segment: ${u.segment}, Status: ${u.status}`)
      console.log(`    Coupon: ${u.couponCode || 'geen'}`)
      console.log(`    Claimed: ${u.claimedAt || 'nee'}`)
    })
  } else {
    console.log('Geen migration user gevonden')
  }

  await prisma.$disconnect()
}

checkRuben().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
