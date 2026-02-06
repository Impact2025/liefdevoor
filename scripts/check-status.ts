import { prisma } from '../lib/prisma'

async function check() {
  const result = await prisma.$queryRaw<any[]>`
    SELECT status, COUNT(*)::int as count
    FROM "MigrationUser"
    GROUP BY status
    ORDER BY count DESC
  `
  console.log('Status overzicht:')
  console.log(result)

  const segments = await prisma.$queryRaw<any[]>`
    SELECT segment, COUNT(*)::int as count
    FROM "MigrationUser"
    GROUP BY segment
  `
  console.log('\nSegment overzicht:')
  console.log(segments)

  await prisma.$disconnect()
}

check()
