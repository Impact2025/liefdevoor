import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixProfileImages() {
  console.log('🔧 Fixing profile images voor gemigreerde gebruikers...\n')

  // Find all users with placeholder URLs
  const usersWithPlaceholders = await prisma.user.findMany({
    where: {
      profileImage: {
        startsWith: 'https://utfs.io/placeholder-'
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
    }
  })

  console.log(`📊 Gevonden: ${usersWithPlaceholders.length} gebruikers met placeholder foto's\n`)

  if (usersWithPlaceholders.length === 0) {
    console.log('✅ Geen gebruikers om te fixen!')
    await prisma.$disconnect()
    return
  }

  // Update them to null
  const result = await prisma.user.updateMany({
    where: {
      profileImage: {
        startsWith: 'https://utfs.io/placeholder-'
      }
    },
    data: {
      profileImage: null
    }
  })

  console.log(`✅ ${result.count} gebruikers geüpdatet!`)
  console.log('\n📝 Deze gebruikers krijgen nu automatisch een fallback avatar.')
  console.log('💡 Ze kunnen later zelf een echte foto uploaden.\n')

  await prisma.$disconnect()
}

fixProfileImages().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
