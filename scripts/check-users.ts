import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking database for demo users...\n')

  // Count all users
  const totalUsers = await prisma.user.count()
  console.log(`📊 Total users in database: ${totalUsers}`)

  // Get all demo users
  const demoUsers = await prisma.user.findMany({
    where: {
      email: {
        contains: 'demo.nl',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      city: true,
      birthDate: true,
      preferences: true,
      profileImage: true,
    },
  })

  console.log(`\n✅ Demo users found: ${demoUsers.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  demoUsers.forEach((user, index) => {
    const age = user.birthDate
      ? new Date().getFullYear() - new Date(user.birthDate).getFullYear()
      : 'N/A'

    console.log(`${index + 1}. ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Gender: ${user.gender}`)
    console.log(`   Age: ${age}`)
    console.log(`   City: ${user.city}`)
    console.log(`   Preferences: ${user.preferences || 'Not set'}`)
    console.log(`   Profile Image: ${user.profileImage ? '✅' : '❌'}`)
    console.log()
  })

  // Check Sophie specifically
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 Checking Sophie specifically...\n')

  const sophie = await prisma.user.findUnique({
    where: { email: 'sophie@demo.nl' },
    include: {
      outgoingSwipes: true,
      matches1: true,
      matches2: true,
    },
  })

  if (sophie) {
    console.log(`✅ Sophie found:`)
    console.log(`   ID: ${sophie.id}`)
    console.log(`   Gender: ${sophie.gender}`)
    console.log(`   Preferences: ${sophie.preferences || 'Not set'}`)
    console.log(`   Swipes made: ${sophie.outgoingSwipes.length}`)
    console.log(`   Matches: ${sophie.matches1.length + sophie.matches2.length}`)
  } else {
    console.log('❌ Sophie not found!')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
