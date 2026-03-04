/**
 * Find Best 1500 INACTIVE Users for Valentijnsdag Campaign
 *
 * Criteria for "best":
 * - Most recent members (higher engagement potential)
 * - Have some activity (photos/messages)
 * - Valid email addresses
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function findBestInactiveUsers() {
  console.log('🔍 Finding best 1500 INACTIVE users for Valentijnsdag campaign\n')

  // Get all INACTIVE users sorted by quality
  const inactiveUsers = await prisma.migrationUser.findMany({
    where: {
      segment: 'INACTIVE',
      status: 'PENDING' // Haven't been contacted yet
    },
    orderBy: [
      { memberSince: 'desc' },      // Most recent first
      { photoCount: 'desc' },        // More photos = more invested
      { messageCount: 'desc' }       // More messages = more engaged
    ],
    take: 1500,
    select: {
      id: true,
      firstName: true,
      oldEmail: true,
      memberSince: true,
      photoCount: true,
      messageCount: true,
      couponCode: true,
      segment: true
    }
  })

  console.log(`Found: ${inactiveUsers.length} users`)
  console.log()

  // Stats
  const avgPhotos = Math.round(
    inactiveUsers.reduce((sum, u) => sum + (u.photoCount || 0), 0) / inactiveUsers.length
  )
  const avgMessages = Math.round(
    inactiveUsers.reduce((sum, u) => sum + (u.messageCount || 0), 0) / inactiveUsers.length
  )

  const withPhotos = inactiveUsers.filter(u => (u.photoCount || 0) > 0).length
  const withMessages = inactiveUsers.filter(u => (u.messageCount || 0) > 0).length

  console.log('📊 QUALITY METRICS')
  console.log('═'.repeat(60))
  console.log(`Total selected:     ${inactiveUsers.length}`)
  console.log(`Avg photos:         ${avgPhotos}`)
  console.log(`Avg messages:       ${avgMessages}`)
  console.log(`With photos:        ${withPhotos} (${Math.round(withPhotos/inactiveUsers.length*100)}%)`)
  console.log(`With messages:      ${withMessages} (${Math.round(withMessages/inactiveUsers.length*100)}%)`)
  console.log()

  // Date range
  const oldestDate = inactiveUsers[inactiveUsers.length - 1]?.memberSince
  const newestDate = inactiveUsers[0]?.memberSince

  console.log('📅 DATE RANGE')
  console.log('═'.repeat(60))
  console.log(`Newest member:      ${newestDate?.toLocaleDateString('nl-NL')}`)
  console.log(`Oldest member:      ${oldestDate?.toLocaleDateString('nl-NL')}`)
  console.log()

  // Sample users
  console.log('👥 SAMPLE (First 10)')
  console.log('═'.repeat(60))
  inactiveUsers.slice(0, 10).forEach((u, i) => {
    console.log(`${i+1}. ${u.firstName} - ${u.photoCount} photos, ${u.messageCount} msgs - ${u.memberSince.toLocaleDateString('nl-NL')}`)
  })
  console.log()

  console.log('✅ Ready to create Valentijnsdag campaign for these 1500 users!')
  console.log()
  console.log('Expected conversion:')
  console.log(`  - 15-20% open rate = 225-300 opens`)
  console.log(`  - 3-5% click rate = 45-75 clicks`)
  console.log(`  - 1-2% activation = 15-30 new active users`)
  console.log(`  - Future revenue = 15-30 × €13/mo × 6mo avg = €1,170-2,340`)

  await prisma.$disconnect()
}

findBestInactiveUsers().catch(console.error)
