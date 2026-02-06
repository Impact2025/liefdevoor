/**
 * Check VIP users that were never emailed
 */

import { prisma } from '../lib/prisma'

async function checkVIPUsers() {
  console.log('\n🔍 Checking VIP users never emailed...\n')

  const users = await prisma.migrationUser.findMany({
    where: {
      segment: 'VIP',
      lastEmailSentAt: null
    },
    select: {
      id: true,
      firstName: true,
      oldEmail: true,
      status: true,
      claimTokenExpiresAt: true
    }
  })

  console.log(`Found ${users.length} VIP users:\n`)

  users.forEach(user => {
    const expired = user.claimTokenExpiresAt && user.claimTokenExpiresAt < new Date()
    console.log(`- ${user.firstName} (${user.oldEmail})`)
    console.log(`  Status: ${user.status}`)
    console.log(`  Expired: ${expired ? 'YES ❌' : 'NO ✅'}`)
    console.log(`  Token expires: ${user.claimTokenExpiresAt?.toISOString()}\n`)
  })

  await prisma.$disconnect()
}

checkVIPUsers()
