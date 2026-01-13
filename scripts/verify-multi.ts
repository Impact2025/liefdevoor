import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  const users = await prisma.$queryRaw<any[]>`
    SELECT
      id,
      "oldUserId",
      "oldEmail",
      "firstName",
      segment,
      status,
      "couponCode",
      "claimToken",
      "createdAt"
    FROM "MigrationUser"
    WHERE "oldUserId" = 22
  `

  if (users.length > 0) {
    console.log('\n✅ User Multi gevonden in database!\n')
    console.log('═══════════════════════════════════════════════════════════════')
    const u = users[0]
    console.log(`   ID:           ${u.id}`)
    console.log(`   Old User ID:  ${u.oldUserId}`)
    console.log(`   Email:        ${u.oldEmail}`)
    console.log(`   Naam:         ${u.firstName}`)
    console.log(`   Segment:      ${u.segment}`)
    console.log(`   Status:       ${u.status}`)
    console.log(`   Coupon:       ${u.couponCode}`)
    console.log(`   Token:        ${u.claimToken}`)
    console.log(`   Created:      ${u.createdAt}`)
    console.log('═══════════════════════════════════════════════════════════════')
    console.log()
    console.log('🔗 TEST LINKS:')
    console.log(`   Landing:  http://localhost:3000/welkom/${u.claimToken}`)
    console.log(`   API:      http://localhost:3000/api/migration/claim/${u.claimToken}`)
    console.log()
  } else {
    console.log('❌ User Multi niet gevonden')
  }

  await prisma.$disconnect()
}

verify()
