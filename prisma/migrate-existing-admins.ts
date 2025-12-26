/**
 * Migrate Existing Admin Users to New Permission System
 *
 * Converts all users with role='ADMIN' to Admin records with Super Admin role
 * Run with: npx ts-node prisma/migrate-existing-admins.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingAdmins() {
  console.log('🔄 Migrating existing admin users to new permission system...\n')

  // 1. Find Super Admin role
  const superAdminRole = await prisma.adminRole.findUnique({
    where: { name: 'Super Admin' },
  })

  if (!superAdminRole) {
    console.error('❌ Super Admin role not found. Run seed-admin-roles.ts first!')
    process.exit(1)
  }

  console.log(`✅ Found Super Admin role (ID: ${superAdminRole.id})\n`)

  // 2. Find all users with role='ADMIN'
  const adminUsers = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  console.log(`📊 Found ${adminUsers.length} admin users:\n`)

  for (const user of adminUsers) {
    console.log(`  - ${user.name || 'No name'} (${user.email})`)
  }

  console.log('\n🚀 Creating Admin records with Super Admin role...\n')

  let migrated = 0
  let skipped = 0

  for (const user of adminUsers) {
    // Check if Admin record already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { userId: user.id },
    })

    if (existingAdmin) {
      console.log(`  ⏭️  Skipped ${user.email} (already migrated)`)
      skipped++
      continue
    }

    // Create Admin record
    await prisma.admin.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,
        canAccessProduction: true, // Existing admins get production access
        lastAdminActivity: new Date(),
      },
    })

    console.log(`  ✅ Migrated ${user.email} → Super Admin`)
    migrated++
  }

  console.log(`\n📊 Migration Summary:`)
  console.log(`  - Migrated: ${migrated}`)
  console.log(`  - Skipped: ${skipped}`)
  console.log(`  - Total: ${adminUsers.length}`)

  // 3. Verify migration
  const totalAdmins = await prisma.admin.count()
  console.log(`\n✅ Total Admin records in database: ${totalAdmins}`)

  console.log('\n✅ Migration complete!')
}

migrateExistingAdmins()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
