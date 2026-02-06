import { prisma } from '@/lib/prisma'

async function fixIncentives() {
  console.log('🔧 Fixing incentives per segment...\n')

  // Update VIP
  const vip = await prisma.migrationUser.updateMany({
    where: { segment: 'VIP' },
    data: { premiumMonths: 3, superMessages: 10 }
  })
  console.log(`✅ Updated ${vip.count} VIP users (3 months + 10 SuperMessages)`)

  // Update GOLD
  const gold = await prisma.migrationUser.updateMany({
    where: { segment: 'GOLD' },
    data: { premiumMonths: 2, superMessages: 5 }
  })
  console.log(`✅ Updated ${gold.count} GOLD users (2 months + 5 SuperMessages)`)

  // Update ACTIVE
  const active = await prisma.migrationUser.updateMany({
    where: { segment: 'ACTIVE' },
    data: { premiumMonths: 1, superMessages: 3 }
  })
  console.log(`✅ Updated ${active.count} ACTIVE users (1 month + 3 SuperMessages)`)

  // Update DORMANT
  const dormant = await prisma.migrationUser.updateMany({
    where: { segment: 'DORMANT' },
    data: { premiumMonths: 1, superMessages: 5 }
  })
  console.log(`✅ Updated ${dormant.count} DORMANT users (1 month + 5 SuperMessages)`)

  // Update INACTIVE
  const inactive = await prisma.migrationUser.updateMany({
    where: { segment: 'INACTIVE' },
    data: { premiumMonths: 0, superMessages: 0 }
  })
  console.log(`✅ Updated ${inactive.count} INACTIVE users (0 months + 0 SuperMessages)`)

  console.log('\n✅ All incentives fixed!')
}

fixIncentives()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
