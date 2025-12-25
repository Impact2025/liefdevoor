/**
 * Upgrade admin user to COMPLETE tier for testing Passport
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upgradeAdmin() {
  console.log('🔧 Upgrading admin to COMPLETE tier...')

  try {
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    })

    if (!admin) {
      console.log('❌ No admin user found')
      return
    }

    // Upgrade to COMPLETE (just update tier, subscription is separate)
    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: {
        subscriptionTier: 'COMPLETE',
      },
    })

    console.log(`✅ Upgraded ${updated.email} to COMPLETE tier!`)
    console.log(`   Now you can test Passport features!`)

    // Create some passport history for this user
    const cities = [
      { city: 'Amsterdam', latitude: 52.3676, longitude: 4.9041 },
      { city: 'Rotterdam', latitude: 51.9244, longitude: 4.4777 },
      { city: 'Utrecht', latitude: 52.0907, longitude: 5.1214 },
    ]

    for (const cityData of cities) {
      await prisma.passportHistory.create({
        data: {
          userId: updated.id,
          city: cityData.city,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          duration: 24,
          usedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      })
    }

    console.log(`✅ Created passport history for trending tab`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

upgradeAdmin()
