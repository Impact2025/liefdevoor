/**
 * Reset Admin Password Script
 *
 * Usage: node scripts/reset-admin-password.js <email> <new-password>
 */

const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    const email = process.argv[2]
    const newPassword = process.argv[3]

    if (!email || !newPassword) {
      console.error('❌ Usage: node scripts/reset-admin-password.js <email> <new-password>')
      console.error('Example: node scripts/reset-admin-password.js admin@liefdevooriedereen.nl MyNewPassword123')
      process.exit(1)
    }

    // Validate password strength
    if (newPassword.length < 8) {
      console.error('❌ Password must be at least 8 characters long')
      process.exit(1)
    }

    if (!/[A-Z]/.test(newPassword)) {
      console.error('❌ Password must contain at least one uppercase letter')
      process.exit(1)
    }

    if (!/[a-z]/.test(newPassword)) {
      console.error('❌ Password must contain at least one lowercase letter')
      process.exit(1)
    }

    if (!/[0-9]/.test(newPassword)) {
      console.error('❌ Password must contain at least one number')
      process.exit(1)
    }

    console.log(`🔍 Looking for user: ${email}`)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.name || user.email} (${user.role})`)
    console.log('🔐 Hashing new password...')

    // Hash password with 12 rounds (same as registration)
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    console.log('💾 Updating password in database...')

    // Update password
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash: hashedPassword }
    })

    console.log('✅ Password updated successfully!')
    console.log('')
    console.log('You can now login with:')
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${newPassword}`)
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
