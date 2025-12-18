/**
 * Check which users have ADMIN role
 */

import { prisma } from '../lib/prisma'

async function checkAdmins() {
  console.log('🔍 Checking for admin users...\n')

  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN'
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true
    }
  })

  if (admins.length === 0) {
    console.log('❌ No admin users found!\n')
    console.log('To create an admin user, use:')
    console.log('  npx tsx scripts/make-admin.ts <email>\n')
  } else {
    console.log(`✅ Found ${admins.length} admin user(s):\n`)
    admins.forEach((admin, i) => {
      console.log(`${i + 1}. ${admin.name || 'No name'}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   ID: ${admin.id}`)
      console.log(`   2FA: ${admin.twoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}`)
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}\n`)
    })
  }

  // Also check all users
  const totalUsers = await prisma.user.count()
  console.log(`Total users in database: ${totalUsers}`)

  await prisma.$disconnect()
}

checkAdmins().catch(console.error)
