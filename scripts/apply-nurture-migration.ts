/**
 * Apply nurture migration - add required fields to MigrationUser
 */

import { prisma } from '@/lib/prisma'

async function applyMigration() {
  console.log('🔧 Applying nurture migration...\n')

  try {
    // Add columns if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "MigrationUser"
      ADD COLUMN IF NOT EXISTS "nurtureEmailsSent" TEXT;
    `)
    console.log('✅ Added nurtureEmailsSent column')

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "MigrationUser"
      ADD COLUMN IF NOT EXISTS "premiumMonths" INTEGER DEFAULT 1;
    `)
    console.log('✅ Added premiumMonths column')

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "MigrationUser"
      ADD COLUMN IF NOT EXISTS "superMessages" INTEGER DEFAULT 0;
    `)
    console.log('✅ Added superMessages column')

    // Update existing users based on their segment
    const result = await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        "premiumMonths" = CASE
          WHEN segment = 'VIP' THEN 3
          WHEN segment = 'GOLD' THEN 2
          WHEN segment = 'ACTIVE' THEN 1
          WHEN segment = 'DORMANT' THEN 1
          WHEN segment = 'INACTIVE' THEN 0
          ELSE 1
        END,
        "superMessages" = CASE
          WHEN segment = 'VIP' THEN 10
          WHEN segment = 'GOLD' THEN 5
          WHEN segment = 'ACTIVE' THEN 3
          WHEN segment = 'DORMANT' THEN 5
          WHEN segment = 'INACTIVE' THEN 0
          ELSE 0
        END
      WHERE "premiumMonths" IS NULL OR "superMessages" IS NULL;
    `

    console.log(`✅ Updated ${result} users with segment-based incentives\n`)

    // Verify
    const sample = await prisma.$queryRaw`
      SELECT segment, "premiumMonths", "superMessages", COUNT(*) as count
      FROM "MigrationUser"
      GROUP BY segment, "premiumMonths", "superMessages"
      ORDER BY segment;
    `

    console.log('📊 Incentives per segment:')
    console.table(sample)

    console.log('\n✅ Migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

applyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
