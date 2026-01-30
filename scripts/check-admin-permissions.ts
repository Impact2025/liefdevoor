/**
 * Check and Fix Admin Permissions
 *
 * This script checks if your admin account has the necessary permissions
 * to ban/unban users and other actions
 */

import { prisma } from '../lib/prisma'

async function checkAdminPermissions() {
  try {
    console.log('🔍 Checking admin permissions...\n')

    // Get all ADMIN users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    console.log(`Found ${adminUsers.length} admin users:\n`)

    for (const user of adminUsers) {
      console.log(`\n👤 User: ${user.name || 'Unknown'} (${user.email})`)
      console.log(`   ID: ${user.id}`)

      // Check if admin record exists
      const adminRecord = await prisma.admin.findUnique({
        where: { userId: user.id },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              permissions: true,
            }
          }
        }
      })

      if (!adminRecord) {
        console.log('   ❌ No Admin record found!')
        console.log('   Creating Admin record with SuperAdmin role...')

        // Create or get SuperAdmin role
        let superAdminRole = await prisma.adminRole.findFirst({
          where: { name: 'SuperAdmin' }
        })

        if (!superAdminRole) {
          console.log('   Creating SuperAdmin role...')
          superAdminRole = await prisma.adminRole.create({
            data: {
              name: 'SuperAdmin',
              description: 'Full access to all admin features',
              permissions: [
                'VIEW_USERS',
                'BAN_USERS',
                'UNBAN_USERS',
                'DELETE_USERS',
                'EDIT_USER_PROFILES',
                'VIEW_USER_ACTIVITY',
                'VIEW_REPORTS',
                'RESOLVE_REPORTS',
                'MODERATE_MESSAGES',
                'MODERATE_PHOTOS',
                'APPROVE_VERIFICATIONS',
                'MANAGE_ADMINS',
                'VIEW_ANALYTICS',
                'MANAGE_SUBSCRIPTIONS',
                'MANAGE_PAYMENTS',
                'VIEW_AUDIT_LOGS',
                'EXPORT_DATA',
                'CREATE_BLOG_POSTS',
                'EDIT_BLOG_POSTS',
                'DELETE_BLOG_POSTS',
                'PUBLISH_BLOG_POSTS',
                'SEND_NOTIFICATIONS',
                'MANAGE_EMAIL_TEMPLATES',
                'VIEW_EMAIL_LOGS',
                'MANAGE_SETTINGS',
                'MANAGE_COUPONS',
                'ACCESS_HELPDESK',
                'CREATE_KB_ARTICLES',
                'EDIT_KB_ARTICLES',
                'DELETE_KB_ARTICLES',
                'PUBLISH_KB_ARTICLES',
                'MANAGE_KB_CATEGORIES',
                'MANAGE_KB_TOOLS',
                'MANAGE_PROFESSIONALS',
                'VERIFY_PROFESSIONALS'
              ]
            }
          })
        }

        // Create admin record
        await prisma.admin.create({
          data: {
            userId: user.id,
            roleId: superAdminRole.id,
            canManageAdmins: true,
            canViewAuditLogs: true,
          }
        })

        console.log('   ✅ Admin record created with SuperAdmin role!')
      } else {
        console.log(`   ✅ Admin record exists`)
        console.log(`   Role: ${adminRecord.role.name}`)
        console.log(`   Permissions (${adminRecord.role.permissions.length}):`)

        const criticalPermissions = ['BAN_USERS', 'UNBAN_USERS', 'DELETE_USERS']
        const missingCritical = criticalPermissions.filter(
          p => !adminRecord.role.permissions.includes(p as any)
        )

        if (missingCritical.length > 0) {
          console.log(`   ⚠️  Missing critical permissions: ${missingCritical.join(', ')}`)
          console.log('   Adding missing permissions to role...')

          await prisma.adminRole.update({
            where: { id: adminRecord.roleId },
            data: {
              permissions: {
                push: missingCritical
              }
            }
          })

          console.log('   ✅ Permissions added!')
        } else {
          console.log('   ✅ Has all critical permissions')
        }

        // Show first 10 permissions
        adminRecord.role.permissions.slice(0, 10).forEach(p => {
          console.log(`     - ${p}`)
        })
        if (adminRecord.role.permissions.length > 10) {
          console.log(`     ... and ${adminRecord.role.permissions.length - 10} more`)
        }
      }
    }

    console.log('\n✅ Permission check complete!')

  } catch (error) {
    console.error('❌ Error checking permissions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminPermissions()
