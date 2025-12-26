/**
 * Seed Default Admin Roles
 *
 * Run with: npx ts-node prisma/seed-admin-roles.ts
 */

import { PrismaClient, AdminPermission } from '@prisma/client'

const prisma = new PrismaClient()

const defaultRoles = [
  {
    name: 'Super Admin',
    description: 'Full access to all admin features. Use with extreme caution.',
    isSystem: true,
    permissions: Object.values(AdminPermission), // ALL permissions
  },
  {
    name: 'Moderator',
    description: 'Content moderation and user safety management.',
    isSystem: true,
    permissions: [
      AdminPermission.VIEW_USERS,
      AdminPermission.BAN_USERS,
      AdminPermission.UNBAN_USERS,
      AdminPermission.VIEW_USER_ACTIVITY,
      AdminPermission.VIEW_REPORTS,
      AdminPermission.RESOLVE_REPORTS,
      AdminPermission.MODERATE_MESSAGES,
      AdminPermission.MODERATE_PHOTOS,
      AdminPermission.APPROVE_VERIFICATIONS,
    ],
  },
  {
    name: 'Support Agent',
    description: 'Customer support and helpdesk management.',
    isSystem: true,
    permissions: [
      AdminPermission.VIEW_USERS,
      AdminPermission.VIEW_USER_ACTIVITY,
      AdminPermission.VIEW_REPORTS,
      AdminPermission.ACCESS_HELPDESK,
      AdminPermission.SEND_NOTIFICATIONS,
      AdminPermission.VIEW_EMAIL_LOGS,
    ],
  },
  {
    name: 'Content Manager',
    description: 'Blog and content management.',
    isSystem: true,
    permissions: [
      AdminPermission.CREATE_BLOG_POSTS,
      AdminPermission.EDIT_BLOG_POSTS,
      AdminPermission.DELETE_BLOG_POSTS,
      AdminPermission.PUBLISH_BLOG_POSTS,
      AdminPermission.MANAGE_EMAIL_TEMPLATES,
      AdminPermission.SEND_NOTIFICATIONS,
    ],
  },
  {
    name: 'Finance Manager',
    description: 'Subscription and payment management.',
    isSystem: true,
    permissions: [
      AdminPermission.VIEW_USERS,
      AdminPermission.MANAGE_SUBSCRIPTIONS,
      AdminPermission.MANAGE_PAYMENTS,
      AdminPermission.VIEW_ANALYTICS,
      AdminPermission.MANAGE_COUPONS,
      AdminPermission.EXPORT_DATA,
    ],
  },
]

async function seedAdminRoles() {
  console.log('🌱 Seeding default admin roles...')

  for (const roleData of defaultRoles) {
    const existing = await prisma.adminRole.findUnique({
      where: { name: roleData.name },
    })

    if (existing) {
      // Update existing role
      await prisma.adminRole.update({
        where: { name: roleData.name },
        data: {
          description: roleData.description,
          permissions: roleData.permissions,
          isSystem: roleData.isSystem,
        },
      })
      console.log(`✅ Updated role: ${roleData.name}`)
    } else {
      // Create new role
      await prisma.adminRole.create({
        data: roleData,
      })
      console.log(`✅ Created role: ${roleData.name}`)
    }
  }

  console.log('\n📊 Admin Roles Summary:')
  const roles = await prisma.adminRole.findMany({
    orderBy: { name: 'asc' },
  })

  for (const role of roles) {
    console.log(`\n  ${role.name}:`)
    console.log(`    - ${role.permissions.length} permissions`)
    console.log(`    - System role: ${role.isSystem ? 'Yes' : 'No'}`)
  }

  console.log('\n✅ Seed complete!')
}

seedAdminRoles()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
