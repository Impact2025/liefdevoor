/**
 * Direct user verification script
 * For testing purposes - bypasses email verification
 */

import { prisma } from '../lib/prisma'

async function verifyUser(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    })

    console.log('✅ User verified successfully!')
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`ID: ${user.id}`)
    console.log(`Verified at: ${user.emailVerified}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]
if (!email) {
  console.error('Usage: tsx scripts/verify-user.ts <email>')
  process.exit(1)
}

verifyUser(email)
