import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== Fixing Orphaned Email Records ===\n')

  // Find users who have status EMAIL_SENT but no MigrationEmail record
  const orphanedUsers = await prisma.$queryRaw<Array<{
    id: string
    firstName: string
    oldEmail: string
    status: string
    lastEmailSentAt: Date | null
  }>>(Prisma.sql`
    SELECT mu.id, mu."firstName", mu."oldEmail", mu.status, mu."lastEmailSentAt"
    FROM "MigrationUser" mu
    WHERE mu."lastEmailSentAt" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "MigrationEmail" me WHERE me."migrationUserId" = mu.id
    )
    ORDER BY mu."lastEmailSentAt" DESC
  `)

  console.log(`Found ${orphanedUsers.length} users with email sent but no MigrationEmail record`)

  if (orphanedUsers.length === 0) {
    console.log('Nothing to fix!')
    return
  }

  // Show first 10
  console.log('\nFirst 10 orphaned users:')
  console.table(orphanedUsers.slice(0, 10))

  // Create MigrationEmail records for these users
  console.log('\nCreating MigrationEmail records...')

  let fixed = 0
  for (const user of orphanedUsers) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "MigrationEmail" (
          id, "migrationUserId", "emailType", subject, "abVariant", "sentAt", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(),
          ${user.id},
          'WELCOME',
          ${`Geweldig nieuws ${user.firstName}! OogvoorLiefde wordt Liefde Voor Iedereen`},
          'A',
          ${user.lastEmailSentAt || new Date()},
          NOW(),
          NOW()
        )
      `
      fixed++
    } catch (error) {
      console.error(`Failed to fix ${user.oldEmail}:`, error)
    }
  }

  console.log(`\n✅ Fixed ${fixed}/${orphanedUsers.length} orphaned records`)

  // Verify
  const remaining = await prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
    SELECT COUNT(*) as count
    FROM "MigrationUser" mu
    WHERE mu."lastEmailSentAt" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "MigrationEmail" me WHERE me."migrationUserId" = mu.id
    )
  `)

  console.log(`Remaining orphaned: ${remaining[0].count}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
