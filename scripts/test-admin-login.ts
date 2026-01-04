/**
 * Test admin login credentials
 */

import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function testAdminLogin() {
  const email = 'admin@liefdevooriedereen.nl'
  const password = 'Admin123!'

  console.log('🧪 Testing admin login credentials...\n')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}\n`)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      role: true,
      emailVerified: true,
      isVerified: true,
      profileComplete: true,
      onboardingStep: true,
      isOnboarded: true,
    }
  })

  if (!user) {
    console.log('❌ User not found!')
    return
  }

  console.log('✅ User found:')
  console.log(`   ID: ${user.id}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Email Verified: ${user.emailVerified}`)
  console.log(`   Is Verified: ${user.isVerified}`)
  console.log(`   Profile Complete: ${user.profileComplete}`)
  console.log(`   Onboarded: ${user.isOnboarded}\n`)

  if (!user.passwordHash) {
    console.log('❌ No password hash found!')
    return
  }

  // Test password
  console.log('🔑 Testing password...')
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (isPasswordValid) {
    console.log('✅ PASSWORD IS CORRECT!\n')

    // Check role-based checks
    const isAdmin = user.role === 'ADMIN'
    console.log(`Admin check: ${isAdmin ? '✅ IS ADMIN' : '❌ NOT ADMIN'}`)

    if (user.role === 'BANNED') {
      console.log('❌ Account is BANNED')
    } else {
      console.log('✅ Account not banned')
    }

    if (!isAdmin && !user.emailVerified && !user.isVerified) {
      console.log('❌ Email not verified (would block non-admin login)')
    } else {
      console.log('✅ Email verification check passed')
    }

    console.log('\n✅ ALL CHECKS PASSED - LOGIN SHOULD WORK!')
    console.log('\n📝 Try logging in with:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n💡 Make sure to:')
    console.log('   - Use the exact email (lowercase)')
    console.log('   - Use the exact password (case-sensitive)')
    console.log('   - Clear browser cache/cookies if needed')
    console.log('   - Try incognito/private browsing mode')

  } else {
    console.log('❌ PASSWORD IS INCORRECT!\n')
    console.log('The password in the database does not match.')
  }

  await prisma.$disconnect()
}

testAdminLogin().catch(console.error)
