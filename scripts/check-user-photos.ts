/**
 * Script om foto's van een gebruiker te checken
 *
 * Gebruik: npx tsx scripts/check-user-photos.ts <email>
 */

import { prisma } from '../lib/prisma'

async function checkUserPhotos(email: string) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      }
    })

    if (!user) {
      console.log(`❌ Gebruiker niet gevonden: ${email}`)
      return
    }

    console.log(`\n✅ Gebruiker gevonden:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Naam: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Profielfoto: ${user.profileImage || 'Geen'}`)

    // Find all photos
    const photos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' }
    })

    console.log(`\n📸 Foto's in database: ${photos.length}`)

    if (photos.length > 0) {
      console.log('\nFoto details:')
      photos.forEach((photo, index) => {
        console.log(`\n${index + 1}. ID: ${photo.id}`)
        console.log(`   URL: ${photo.url}`)
        console.log(`   Order: ${photo.order}`)
        console.log(`   Aangemaakt: ${photo.createdAt}`)
        console.log(`   Is profielfoto: ${photo.url === user.profileImage ? 'JA' : 'Nee'}`)
      })
    } else {
      console.log('\n⚠️  Geen foto\'s gevonden in de database')
    }

  } catch (error) {
    console.error('❌ Fout:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.log('Gebruik: npx tsx scripts/check-user-photos.ts <email>')
  process.exit(1)
}

checkUserPhotos(email)
