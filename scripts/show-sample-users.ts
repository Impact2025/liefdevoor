import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const samples = await prisma.$queryRaw<any[]>`
    (SELECT "oldUserId", "oldEmail", "firstName", segment, status, "claimToken"
     FROM "MigrationUser" WHERE segment = 'VIP' LIMIT 3)
    UNION ALL
    (SELECT "oldUserId", "oldEmail", "firstName", segment, status, "claimToken"
     FROM "MigrationUser" WHERE segment = 'GOLD' LIMIT 3)
    UNION ALL
    (SELECT "oldUserId", "oldEmail", "firstName", segment, status, "claimToken"
     FROM "MigrationUser" WHERE segment = 'ACTIVE' LIMIT 3)
  `

  console.log('\n🎯 Sample users per segment:')
  console.log('═══════════════════════════════════════════════════════════════')
  samples.forEach((u: any) => {
    const email = (u.oldEmail || '').substring(0, 25).padEnd(25)
    const name = (u.firstName || '').substring(0, 15).padEnd(15)
    const token = (u.claimToken || '').substring(0, 16)
    console.log(`   ${u.segment.padEnd(8)} ${name} ${email} ${token}...`)
  })

  console.log('')
  console.log('🔗 Test URLs:')
  if (samples[0]) {
    console.log(`   VIP:    https://liefdevooriedereen.nl/welkom/${samples[0].claimToken}`)
  }

  const goldUser = samples.find(u => u.segment === 'GOLD')
  if (goldUser) {
    console.log(`   GOLD:   https://liefdevooriedereen.nl/welkom/${goldUser.claimToken}`)
  }

  const activeUser = samples.find(u => u.segment === 'ACTIVE')
  if (activeUser) {
    console.log(`   ACTIVE: https://liefdevooriedereen.nl/welkom/${activeUser.claimToken}`)
  }

  console.log('')

  await prisma.$disconnect()
}

main()
