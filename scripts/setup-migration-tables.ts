/**
 * Setup Migration Tables
 *
 * Creates the migration tables directly in the database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupMigrationTables() {
  console.log('🔧 Setting up migration tables...\n')

  try {
    // Create enums
    console.log('   Creating enums...')

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "MigrationSegment" AS ENUM ('VIP', 'GOLD', 'ACTIVE', 'DORMANT', 'INACTIVE');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "MigrationEmailType" AS ENUM ('WELCOME', 'MATCHES_WAITING', 'REMINDER', 'FEATURES', 'SOCIAL_PROOF', 'LAST_CHANCE', 'GOODBYE', 'EXPIRED');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `)

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "MigrationStatus" AS ENUM ('PENDING', 'EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED', 'CLAIM_STARTED', 'CLAIMED', 'ACTIVATED', 'EXPIRED');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `)

    console.log('   ✅ Enums created')

    // Create MigrationUser table
    console.log('   Creating MigrationUser table...')

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MigrationUser" (
          "id" TEXT NOT NULL,
          "oldUserId" INTEGER NOT NULL,
          "oldEmail" TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT,
          "oldProfilePhoto" TEXT,
          "memberSince" TIMESTAMP(3) NOT NULL,
          "lastActiveOld" TIMESTAMP(3),
          "hadGoldMembership" BOOLEAN NOT NULL DEFAULT false,
          "photoCount" INTEGER NOT NULL DEFAULT 0,
          "messageCount" INTEGER NOT NULL DEFAULT 0,
          "matchCount" INTEGER NOT NULL DEFAULT 0,
          "segment" "MigrationSegment" NOT NULL,
          "newUserId" TEXT,
          "status" "MigrationStatus" NOT NULL DEFAULT 'PENDING',
          "couponCode" TEXT,
          "couponExpiresAt" TIMESTAMP(3),
          "couponRedeemedAt" TIMESTAMP(3),
          "claimToken" TEXT,
          "claimTokenExpiresAt" TIMESTAMP(3),
          "claimedAt" TIMESTAMP(3),
          "lastEmailSentAt" TIMESTAMP(3),
          "lastEmailOpenedAt" TIMESTAMP(3),
          "lastEmailClickedAt" TIMESTAMP(3),
          "totalEmailsOpened" INTEGER NOT NULL DEFAULT 0,
          "landingVisitedAt" TIMESTAMP(3),
          "landingVisits" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "MigrationUser_pkey" PRIMARY KEY ("id")
      );
    `)

    console.log('   ✅ MigrationUser table created')

    // Create MigrationEmail table
    console.log('   Creating MigrationEmail table...')

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MigrationEmail" (
          "id" TEXT NOT NULL,
          "migrationUserId" TEXT NOT NULL,
          "emailType" "MigrationEmailType" NOT NULL,
          "subject" TEXT NOT NULL,
          "abVariant" TEXT,
          "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "deliveredAt" TIMESTAMP(3),
          "openedAt" TIMESTAMP(3),
          "clickedAt" TIMESTAMP(3),
          "bouncedAt" TIMESTAMP(3),
          "openCount" INTEGER NOT NULL DEFAULT 0,
          "clickCount" INTEGER NOT NULL DEFAULT 0,
          "resendId" TEXT,
          "errorMessage" TEXT,
          "retryCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "MigrationEmail_pkey" PRIMARY KEY ("id")
      );
    `)

    console.log('   ✅ MigrationEmail table created')

    // Create indexes
    console.log('   Creating indexes...')

    const indexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_oldUserId_key" ON "MigrationUser"("oldUserId")',
      'CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_newUserId_key" ON "MigrationUser"("newUserId")',
      'CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_couponCode_key" ON "MigrationUser"("couponCode")',
      'CREATE UNIQUE INDEX IF NOT EXISTS "MigrationUser_claimToken_key" ON "MigrationUser"("claimToken")',
      'CREATE INDEX IF NOT EXISTS "MigrationUser_oldEmail_idx" ON "MigrationUser"("oldEmail")',
      'CREATE INDEX IF NOT EXISTS "MigrationUser_segment_idx" ON "MigrationUser"("segment")',
      'CREATE INDEX IF NOT EXISTS "MigrationUser_status_idx" ON "MigrationUser"("status")',
      'CREATE INDEX IF NOT EXISTS "MigrationUser_lastEmailSentAt_idx" ON "MigrationUser"("lastEmailSentAt")',
      'CREATE INDEX IF NOT EXISTS "MigrationEmail_migrationUserId_idx" ON "MigrationEmail"("migrationUserId")',
      'CREATE INDEX IF NOT EXISTS "MigrationEmail_emailType_idx" ON "MigrationEmail"("emailType")',
      'CREATE INDEX IF NOT EXISTS "MigrationEmail_sentAt_idx" ON "MigrationEmail"("sentAt")',
      'CREATE INDEX IF NOT EXISTS "MigrationEmail_openedAt_idx" ON "MigrationEmail"("openedAt")'
    ]

    for (const idx of indexes) {
      await prisma.$executeRawUnsafe(idx)
    }

    console.log('   ✅ Indexes created')

    // Add foreign key
    console.log('   Adding foreign key...')

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "MigrationEmail"
        ADD CONSTRAINT "MigrationEmail_migrationUserId_fkey"
        FOREIGN KEY ("migrationUserId") REFERENCES "MigrationUser"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    console.log('   ✅ Foreign key added')

    console.log('\n✅ Migration tables setup complete!\n')

    // Verify tables exist
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name LIKE 'Migration%'
    `

    console.log('   Tables created:')
    tables.forEach(t => console.log(`      - ${t.table_name}`))
    console.log()

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupMigrationTables()
