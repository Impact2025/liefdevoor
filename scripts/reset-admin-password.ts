/**
 * Reset admin password
 */

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function resetAdminPassword() {
  const email = 'admin@liefdevooriedereen.nl'
  const newPassword = 'Admin123!' // Change this to your desired password

  console.log(`🔄 Resetting password for ${email}...\n`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log(`❌ User ${email} not found!`)
    return
  }

  // Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 12)

  // Update password
  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      emailVerified: new Date() // Ensure email is verified
    }
  })

  console.log('✅ Password reset successfully!\n')
  console.log('Login credentials:')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${newPassword}`)
  console.log('\n⚠️  Change this password after first login!\n')

  await prisma.$disconnect()
}

resetAdminPassword().catch(console.error)
