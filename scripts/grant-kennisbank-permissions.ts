/**
 * Grant Kennisbank Permissions to Admin Users
 *
 * Run with: npx tsx scripts/grant-kennisbank-permissions.ts
 */

import { PrismaClient, AdminPermission } from '@prisma/client'

const prisma = new PrismaClient()

const kennisbankPermissions = [
  AdminPermission.CREATE_KB_ARTICLES,
  AdminPermission.EDIT_KB_ARTICLES,
  AdminPermission.DELETE_KB_ARTICLES,
  AdminPermission.PUBLISH_KB_ARTICLES,
  AdminPermission.MANAGE_KB_CATEGORIES,
  AdminPermission.MANAGE_KB_TOOLS,
]

async function main() {
  console.log('🔧 Granting Kennisbank permissions to admin users...\n')

  // Find all admin records
  const admins = await prisma.admin.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      role: {
        select: {
          name: true,
          permissions: true,
        },
      },
    },
  })

  if (admins.length === 0) {
    console.log('❌ No admin records found!')
    console.log('ℹ️  Looking for users with ADMIN role...\n')

    // Find ADMIN users without Admin record
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (adminUsers.length === 0) {
      console.log('❌ No ADMIN users found!')
      return
    }

    // Find or create "Super Admin" role
    let superAdminRole = await prisma.adminRole.findUnique({
      where: { name: 'Super Admin' },
    })

    if (!superAdminRole) {
      console.log('Creating "Super Admin" role with all permissions...')
      const allPermissions = Object.values(AdminPermission)
      superAdminRole = await prisma.adminRole.create({
        data: {
          name: 'Super Admin',
          description: 'Full access to all admin features',
          permissions: allPermissions,
          isSystem: true,
        },
      })
      console.log('✓ Created Super Admin role\n')
    }

    // Create Admin records for ADMIN users
    for (const user of adminUsers) {
      console.log(`👤 ${user.name} (${user.email})`)
      await prisma.admin.create({
        data: {
          userId: user.id,
          roleId: superAdminRole.id,
          canAccessProduction: true,
        },
      })
      console.log(`  ✓ Created Admin record with Super Admin role\n`)
    }

    console.log('✅ Done!')
    return
  }

  // Update existing admin roles
  console.log(`Found ${admins.length} admin(s):\n`)

  for (const admin of admins) {
    console.log(`👤 ${admin.user.name} (${admin.user.email})`)
    console.log(`  Role: ${admin.role.name}`)

    const currentRolePermissions = admin.role.permissions as AdminPermission[]
    const missingPermissions = kennisbankPermissions.filter(
      (p) => !currentRolePermissions.includes(p)
    )

    if (missingPermissions.length > 0) {
      // Update role with missing permissions
      await prisma.adminRole.update({
        where: { id: admin.roleId },
        data: {
          permissions: [...currentRolePermissions, ...missingPermissions],
        },
      })
      console.log(`  ✓ Added ${missingPermissions.length} permission(s) to role:`)
      missingPermissions.forEach((p) => console.log(`    - ${p}`))
    } else {
      console.log(`  ✓ Already has all kennisbank permissions`)
    }

    console.log()
  }

  console.log('✅ Done!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
