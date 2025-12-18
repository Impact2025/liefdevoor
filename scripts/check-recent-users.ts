import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  // Get users created in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const recentUsers = await prisma.user.findMany({
    where: {
      createdAt: { gte: oneHourAgo }
    },
    select: {
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      city: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`📊 Gebruikers van het laatste uur (${recentUsers.length}):\n`)

  recentUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`)
    console.log(`   Geslacht: ${user.gender}`)
    console.log(`   Geboren: ${user.birthDate ? user.birthDate.toISOString().split('T')[0] : 'Niet ingesteld'}`)
    console.log(`   Stad: ${user.city || 'Niet ingesteld'}`)
    console.log(`   Aangemaakt: ${user.createdAt.toISOString()}`)
    if (user.bio) {
      console.log(`   Bio preview: ${user.bio.substring(0, 80)}...`)
    }
    console.log('')
  })

  // Also check users with old registration dates (from migration)
  const oldUsers = await prisma.user.findMany({
    where: {
      createdAt: { lt: new Date('2025-01-01') }
    },
    select: {
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
    take: 10
  })

  if (oldUsers.length > 0) {
    console.log(`\n📜 Oudste gebruikers (gemigreerd, ${oldUsers.length}):\n`)
    oldUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.email} (${user.createdAt.toISOString().split('T')[0]})`)
    })
  }

  const totalCount = await prisma.user.count()
  console.log(`\n📈 Totaal: ${totalCount} gebruikers`)

  await prisma.$disconnect()
}

checkUsers()
