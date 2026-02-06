import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMigrationStatus() {
  console.log('\n=== MIGRATIE STATUS ===\n')

  // Check totals per segment
  const bySegment = await prisma.$queryRaw<{ segment: string; count: bigint }[]>`
    SELECT segment, COUNT(*) as count
    FROM "MigrationUser"
    GROUP BY segment
    ORDER BY segment
  `

  console.log('Per segment:')
  bySegment.forEach(s => {
    console.log(`  ${s.segment}: ${s.count}`)
  })

  // Check totals per status
  const byStatus = await prisma.$queryRaw<{ status: string; count: bigint }[]>`
    SELECT status, COUNT(*) as count
    FROM "MigrationUser"
    GROUP BY status
    ORDER BY status
  `

  console.log('\nPer status:')
  byStatus.forEach(s => {
    console.log(`  ${s.status}: ${s.count}`)
  })

  // Check pending users
  const pending = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM "MigrationUser"
    WHERE status = 'PENDING'
  `
  console.log(`\nPending (wachten op eerste email): ${pending[0]?.count || 0}`)

  // Check emails sent
  const emailsSent = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM "MigrationEmail"
  `
  console.log(`Totaal emails verstuurd: ${emailsSent[0]?.count || 0}`)

  // Recent emails
  const recentEmails = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM "MigrationEmail"
    WHERE "sentAt" > NOW() - INTERVAL '24 hours'
  `
  console.log(`Emails laatste 24 uur: ${recentEmails[0]?.count || 0}`)

  // Check claimed
  const claimed = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM "MigrationUser"
    WHERE status IN ('CLAIMED', 'ACTIVATED')
  `
  console.log(`\nGeclaimed/Geactiveerd: ${claimed[0]?.count || 0}`)

  await prisma.$disconnect()
}

checkMigrationStatus().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
