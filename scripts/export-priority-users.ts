/**
 * EXPORT PRIORITY USERS FOR RESEND CAMPAIGN
 *
 * Exports VIP and GOLD users who haven't claimed yet
 * for immediate targeted re-engagement campaign
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function exportPriorityUsers() {
  console.log('\n📤 EXPORTING PRIORITY USERS FOR RESEND CAMPAIGN\n')
  console.log('═'.repeat(70))

  // Get VIP + GOLD users who haven't claimed
  const priorityUsers = await prisma.migrationUser.findMany({
    where: {
      segment: {
        in: ['VIP', 'GOLD']
      },
      status: {
        notIn: ['CLAIMED', 'ACTIVATED']
      }
    },
    orderBy: [
      { segment: 'asc' },
      { lastActiveOld: 'desc' }
    ]
  })

  console.log(`\nFound ${priorityUsers.length} priority users:\n`)

  // Stats by segment
  const vipCount = priorityUsers.filter(u => u.segment === 'VIP').length
  const goldCount = priorityUsers.filter(u => u.segment === 'GOLD').length

  console.log(`  VIP:  ${vipCount} users`)
  console.log(`  GOLD: ${goldCount} users`)

  // Group by status to understand where they are in funnel
  const byStatus: Record<string, number> = {}
  priorityUsers.forEach(u => {
    byStatus[u.status] = (byStatus[u.status] || 0) + 1
  })

  console.log('\n  Status breakdown:')
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`    ${status}: ${count}`)
  })

  // Calculate days since last email
  const now = new Date()
  const usersWithEmailData = priorityUsers.filter(u => u.lastEmailSentAt)

  if (usersWithEmailData.length > 0) {
    const avgDaysSinceEmail = usersWithEmailData.reduce((sum, u) => {
      const days = Math.floor((now.getTime() - u.lastEmailSentAt!.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0) / usersWithEmailData.length

    console.log(`\n  Average days since last email: ${avgDaysSinceEmail.toFixed(1)} days`)
  }

  // Export to JSON for batch sending
  const exportData = priorityUsers.map(user => ({
    id: user.id,
    oldUserId: user.oldUserId,
    email: user.oldEmail,
    firstName: user.firstName,
    lastName: user.lastName,
    segment: user.segment,
    status: user.status,
    lastEmailSent: user.lastEmailSentAt,
    lastActive: user.lastActiveOld,
    couponCode: user.couponCode,
    hadGold: user.hadGoldMembership,
    photoCount: user.photoCount,
    matchCount: user.matchCount,

    // Recommended incentive
    recommendedPremiumMonths: user.segment === 'VIP' ? 6 : 4,
    recommendedSuperMessages: user.segment === 'VIP' ? 20 : 15,

    // Personalization data
    daysSinceActive: user.lastActiveOld ?
      Math.floor((now.getTime() - user.lastActiveOld.getTime()) / (1000 * 60 * 60 * 24)) : null,
    memberForYears: Math.floor(
      (now.getTime() - user.memberSince.getTime()) / (1000 * 60 * 60 * 24 * 365)
    )
  }))

  // Save to file
  const filename = `priority-users-resend-${new Date().toISOString().split('T')[0]}.json`
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2))

  console.log(`\n✅ Exported to: ${filename}`)

  // Generate campaign recommendations
  console.log('\n\n📋 CAMPAIGN RECOMMENDATIONS\n')
  console.log('═'.repeat(70))

  console.log('\n1️⃣  SUBJECT LINE VARIANTS:\n')
  console.log('   A: 🎁 [Naam], je 6 maanden gratis Premium wacht!')
  console.log('   B: [Naam], we missen je - Speciale comeback aanbieding')
  console.log('   C: Je OogvoorLiefde account + 6 maanden Premium → Claim nu!\n')

  console.log('2️⃣  NEW INCENTIVES:\n')
  console.log('   VIP:  6 maanden Premium + 20 SuperBerichten (was: 3m)')
  console.log('   GOLD: 4 maanden Premium + 15 SuperBerichten (was: 2m)\n')

  console.log('3️⃣  URGENCY ELEMENTS:\n')
  console.log('   • Deadline: Claim binnen 7 dagen (eindigt op DD MMM)')
  console.log('   • Social proof: "127 oud-gebruikers al actief"')
  console.log('   • Scarcity: "Laatste kans - verhoogde aanbieding"')
  console.log('   • FOMO: "Mis geen nieuwe matches"\n')

  console.log('4️⃣  PERSONALIZATION:\n')
  const sampleUser = exportData[0]
  if (sampleUser) {
    console.log(`   Example for ${sampleUser.firstName}:`)
    console.log(`   • "Je was ${sampleUser.memberForYears} jaar lid"`)
    if (sampleUser.matchCount > 0) {
      console.log(`   • "Je had ${sampleUser.matchCount} matches"`)
    }
    if (sampleUser.photoCount > 0) {
      console.log(`   • "Je ${sampleUser.photoCount} foto's zijn veilig overgezet"`)
    }
  }

  console.log('\n5️⃣  FOLLOW-UP SEQUENCE:\n')
  console.log('   Day 0: Initial email (new subject + increased incentive)')
  console.log('   Day 2: SMS to non-openers (VIP only)')
  console.log('   Day 5: Reminder email ("3 dagen nog")')
  console.log('   Day 7: Last chance email ("Vandaag laatste dag")\n')

  // Identify users who need immediate follow-up
  const needsImmediateFollowup = priorityUsers.filter(u =>
    u.lastEmailSentAt &&
    (now.getTime() - u.lastEmailSentAt.getTime()) > 7 * 24 * 60 * 60 * 1000 && // >7 days ago
    u.status === 'EMAIL_SENT'
  )

  if (needsImmediateFollowup.length > 0) {
    console.log(`⚡ IMMEDIATE ACTION NEEDED:\n`)
    console.log(`   ${needsImmediateFollowup.length} users received email >7 days ago but haven't responded`)
    console.log(`   → Send follow-up TODAY with increased incentive\n`)
  }

  // Export CSV for email service
  const csvRows = [
    'Email,FirstName,Segment,PremiumMonths,SuperMessages,CouponCode',
    ...exportData.map(u =>
      `${u.email},"${u.firstName}",${u.segment},${u.recommendedPremiumMonths},${u.recommendedSuperMessages},${u.couponCode}`
    )
  ]

  const csvFilename = `priority-users-resend-${new Date().toISOString().split('T')[0]}.csv`
  fs.writeFileSync(csvFilename, csvRows.join('\n'))

  console.log(`✅ CSV exported to: ${csvFilename}`)
  console.log('\n' + '═'.repeat(70) + '\n')

  return exportData
}

async function main() {
  try {
    const users = await exportPriorityUsers()

    console.log('📊 QUICK STATS:\n')
    console.log(`Total priority users:     ${users.length}`)
    console.log(`Expected conversion (40%): ${Math.round(users.length * 0.4)}`)
    console.log(`Current claims:           ${users.filter(u => u.status === 'CLAIMED').length}`)
    console.log(`Potential gain:           +${Math.round(users.length * 0.4)} users\n`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
