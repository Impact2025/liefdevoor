import { prisma } from '@/lib/prisma'

async function checkIncentives() {
  const check = await prisma.$queryRaw`
    SELECT segment, "premiumMonths", "superMessages", COUNT(*) as count
    FROM "MigrationUser"
    GROUP BY segment, "premiumMonths", "superMessages"
    ORDER BY segment;
  `

  console.log('📊 Incentives per segment:')
  console.table(check)

  await prisma.$disconnect()
}

checkIncentives()
