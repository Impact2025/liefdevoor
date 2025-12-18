/**
 * Quick script to verify a user's email
 * Usage: npx tsx scripts/verify-user-email.ts info@365ways.nl
 */

import { prisma } from '../lib/prisma'

async function verifyUserEmail(email: string) {
  try {
    // Update user to mark email as verified
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        isVerified: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        birthDate: true
      }
    })

    console.log('✅ Email verified successfully!')
    console.log('\nUser Details:')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Verified: ${user.emailVerified?.toISOString()}`)
    console.log(`  Birth Date: ${user.birthDate?.toISOString().split('T')[0]}`)

    if (user.birthDate) {
      const age = new Date().getFullYear() - user.birthDate.getFullYear()
      console.log(`  Age: ${age}`)
    }

    console.log('\nYou can now test the birthday email:')
    console.log(`  http://localhost:3004/api/test/birthday-email?email=${email}`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.error('Usage: npx tsx scripts/verify-user-email.ts <email>')
  process.exit(1)
}

verifyUserEmail(email)
