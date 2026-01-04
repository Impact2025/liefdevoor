/**
 * Check admin account status
 */

import { prisma } from '../lib/prisma'

async function checkAdmin() {
  const email = 'admin@liefdevooriedereen.nl'

  console.log(`🔍 Checking admin account: ${email}\n`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log('❌ Admin user not found!')
    console.log('Creating admin user...\n')

    // Create admin if doesn't exist
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash('Admin123!', 12)

    const newAdmin = await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        passwordHash,
        role: 'ADMIN',
        emailVerified: new Date(),
        isVerified: true,
        profileComplete: true,
        isOnboarded: true,
        onboardingStep: 10
      }
    })

    console.log('✅ Admin user created!')
    console.log('Login credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: Admin123!`)
  } else {
    console.log('✅ Admin user found!')
    console.log('\nUser details:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Has password: ${!!user.passwordHash}`)
    console.log(`   Email verified: ${user.emailVerified}`)
    console.log(`   Is verified: ${user.isVerified}`)
    console.log(`   Profile complete: ${user.profileComplete}`)
    console.log(`   Onboarded: ${user.isOnboarded}`)
  }

  await prisma.$disconnect()
}

checkAdmin().catch(console.error)
