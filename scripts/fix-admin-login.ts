/**
 * Fix admin login - reset password and verify
 */

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function fixAdminLogin() {
  const email = 'admin@liefdevooriedereen.nl'
  const newPassword = 'Admin123!'

  console.log(`🔄 Fixing admin login for ${email}...\n`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log(`❌ User ${email} not found!`)
    return
  }

  // Hash the new password
  console.log('🔐 Hashing new password...')
  const passwordHash = await bcrypt.hash(newPassword, 12)
  console.log(`   Hash: ${passwordHash.substring(0, 20)}...`)

  // Update user
  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      emailVerified: new Date(),
      isVerified: true, // Ensure this is also true
      role: 'ADMIN',
      profileComplete: true,
      isOnboarded: true
    }
  })

  console.log('✅ Admin account updated!\n')

  // Verify the password works
  const verifyUser = await prisma.user.findUnique({
    where: { email },
    select: { passwordHash: true, role: true }
  })

  if (verifyUser?.passwordHash) {
    const isValid = await bcrypt.compare(newPassword, verifyUser.passwordHash)
    console.log(`🧪 Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`)
  }

  console.log('\n📋 Login credentials:')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${newPassword}`)
  console.log('\n⚠️  BELANGRIJK: Gebruik exact deze credentials (hoofdlettergevoelig!):\n')
  console.log(`   • Email in kleine letters: admin@liefdevooriedereen.nl`)
  console.log(`   • Wachtwoord exact: Admin123!`)
  console.log(`   • Let op hoofdletter A en uitroepteken aan het eind\n`)

  await prisma.$disconnect()
}

fixAdminLogin().catch(console.error)
