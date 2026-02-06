import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check table structure
  const columns = await prisma.$queryRaw<Array<{
    column_name: string
    is_nullable: string
    column_default: string | null
  }>>(Prisma.sql`
    SELECT column_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'MigrationEmail'
    ORDER BY ordinal_position
  `)

  console.log('\n=== MigrationEmail Table Structure ===\n')
  console.table(columns)

  // Check for recent failed inserts
  const recentEmails = await prisma.$queryRaw<Array<{
    id: string
    emailType: string
    sentAt: Date
    updatedAt: Date | null
  }>>(Prisma.sql`
    SELECT id, "emailType", "sentAt", "updatedAt"
    FROM "MigrationEmail"
    ORDER BY "sentAt" DESC
    LIMIT 5
  `)

  console.log('\n=== Recent MigrationEmail Records ===\n')
  console.table(recentEmails)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
