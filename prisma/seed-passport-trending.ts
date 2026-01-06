/**
 * Seed Passport Trending Data
 *
 * Creates realistic passport history to populate the Trending tab
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Popular Dutch cities with coordinates
const TRENDING_CITIES = [
  { city: 'Amsterdam', latitude: 52.3676, longitude: 4.9041 },
  { city: 'Rotterdam', latitude: 51.9244, longitude: 4.4777 },
  { city: 'Utrecht', latitude: 52.0907, longitude: 5.1214 },
  { city: 'Den Haag', latitude: 52.0705, longitude: 4.3007 },
  { city: 'Maastricht', latitude: 50.8514, longitude: 5.6910 },
  { city: 'Groningen', latitude: 53.2194, longitude: 6.5665 },
  { city: 'Eindhoven', latitude: 51.4416, longitude: 5.4697 },
]

async function seedPassportTrending() {
  console.log('🌍 Seeding Passport trending data...')

  try {
    // Get all users with GOLD subscription (can use Passport)
    const users = await prisma.user.findMany({
      where: {
        subscriptionTier: 'GOLD',
      },
      select: {
        id: true,
      },
      take: 20, // Use up to 20 users
    })

    if (users.length === 0) {
      console.log('⚠️  No GOLD users found. Creating demo passport history anyway...')
      // Create dummy user IDs for demonstration
      const dummyUsers = Array.from({ length: 15 }, (_, i) => ({
        id: `demo-user-${i}`
      }))

      // Use dummy users instead
      await seedHistoryForUsers(dummyUsers)
    } else {
      console.log(`✅ Found ${users.length} GOLD users`)
      await seedHistoryForUsers(users)
    }

    console.log('✅ Passport trending data seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding passport trending:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function seedHistoryForUsers(users: { id: string }[]) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Create realistic passport usage patterns
  const historyRecords = []

  for (const user of users) {
    // Each user has 1-3 passport trips in the last 7 days
    const numTrips = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < numTrips; i++) {
      // Pick a random city (bias towards popular ones)
      const cityIndex = Math.random() < 0.7
        ? Math.floor(Math.random() * 3) // 70% chance: top 3 cities
        : Math.floor(Math.random() * TRENDING_CITIES.length) // 30% chance: any city

      const city = TRENDING_CITIES[cityIndex]

      // Random time in last 7 days
      const randomTime = new Date(
        sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())
      )

      // Random duration (24h, 48h, 72h, or 1 week)
      const durations = [24, 48, 72, 168]
      const duration = durations[Math.floor(Math.random() * durations.length)]

      historyRecords.push({
        userId: user.id,
        city: city.city,
        latitude: city.latitude,
        longitude: city.longitude,
        duration,
        usedAt: randomTime,
      })
    }
  }

  // Insert all records
  console.log(`📝 Creating ${historyRecords.length} passport history records...`)

  for (const record of historyRecords) {
    try {
      await prisma.passportHistory.create({
        data: record,
      })
    } catch (error) {
      // Skip if user doesn't exist (dummy users)
      if ((error as any).code !== 'P2003') {
        console.error('Error creating record:', error)
      }
    }
  }

  // Show trending summary
  const trending = await prisma.passportHistory.groupBy({
    by: ['city'],
    where: {
      usedAt: { gte: sevenDaysAgo },
    },
    _count: {
      city: true,
    },
    orderBy: {
      _count: {
        city: 'desc',
      },
    },
    take: 5,
  })

  console.log('\n📊 Trending cities (last 7 days):')
  trending.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.city}: ${t._count.city} travelers 🔥`)
  })
}

// Run the seed
seedPassportTrending()
