import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      city: true,
      bio: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  console.log('📊 Gemigreerde gebruikers:\n')

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`)
    console.log(`   Geslacht: ${user.gender}`)
    console.log(`   Geboortedatum: ${user.birthDate ? user.birthDate.toISOString().split('T')[0] : 'Niet ingesteld'}`)
    console.log(`   Stad: ${user.city || 'Niet ingesteld'}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Verified: ${user.isVerified}`)
    console.log(`   Geregistreerd: ${user.createdAt.toISOString().split('T')[0]}`)
    if (user.bio) {
      console.log(`   Bio: ${user.bio.substring(0, 100)}${user.bio.length > 100 ? '...' : ''}`)
    }
    console.log('')
  })

  const totalCount = await prisma.user.count()
  console.log(`\n📈 Totaal aantal gebruikers in database: ${totalCount}`)

  await prisma.$disconnect()
}

checkUsers()
