import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== EXACT PENDING STATUS ===\n')

  const segments = ['VIP', 'GOLD', 'ACTIVE', 'DORMANT', 'INACTIVE']

  for (const segment of segments) {
    const pending = await prisma.migrationUser.count({
      where: {
        segment,
        status: 'PENDING'
      }
    })

    const total = await prisma.migrationUser.count({
      where: { segment }
    })

    console.log(`${segment}: ${pending} pending / ${total} total`)
  }

  console.log('\n=== HIGH-VALUE ANALYSIS ===\n')

  // Check landed but not activated
  const landedNotActivated = await prisma.migrationUser.count({
    where: {
      segment: { in: ['VIP', 'GOLD', 'ACTIVE', 'DORMANT'] },
      status: { in: ['LANDING_VISITED', 'CLAIMED'] }
    }
  })

  console.log(`Landed but not fully activated: ${landedNotActivated}`)

  await prisma.$disconnect()
}

main()
