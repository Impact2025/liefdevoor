import { prisma } from '../lib/prisma'

async function quickStatus() {
  const stats = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) FILTER (WHERE status = 'ACTIVATED') as activated,
      COUNT(*) FILTER (WHERE status = 'CLAIMED') as claimed,
      COUNT(*) as total
    FROM "MigrationUser"
    WHERE status IN ('CLAIMED', 'ACTIVATED')
  `

  console.log('\n✅ QUICK STATUS CHECK')
  console.log('====================')
  console.log('Activated:', Number(stats[0].activated), '✅')
  console.log('Claimed:', Number(stats[0].claimed))
  console.log('Total:', Number(stats[0].total))
  console.log('Activation Success:', Number(stats[0].activated) === Number(stats[0].total) ? '100% ✅' : 'Needs fixing')
  console.log()

  await prisma.$disconnect()
}

quickStatus()
