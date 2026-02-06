import { prisma } from '../lib/prisma'

async function checkInactivePending() {
  const pending = await prisma.migrationUser.count({
    where: {
      segment: 'INACTIVE',
      status: 'PENDING'
    }
  })

  const sent = await prisma.migrationUser.count({
    where: {
      segment: 'INACTIVE',
      status: { not: 'PENDING' }
    }
  })

  console.log('📊 INACTIVE segment status:')
  console.log(`- Pending (no email yet): ${pending}`)
  console.log(`- Already sent: ${sent}`)
  console.log(`- Total: ${pending + sent}`)
  console.log(`\n✅ Ready to send to next ${Math.min(pending, 1000)} users!`)

  await prisma.$disconnect()
}

checkInactivePending()
