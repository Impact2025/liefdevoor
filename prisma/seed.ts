import { PrismaClient, Gender } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'Demo123!' // Same password for all demo accounts

interface DemoUser {
  name: string
  email: string
  gender: Gender
  birthDate: Date
  city: string
  postcode: string
  latitude: number
  longitude: number
  bio: string
  interests: string
  profileImage?: string
}

const demoUsers: DemoUser[] = [
  {
    name: 'Sophie van den Berg',
    email: 'sophie@demo.nl',
    gender: Gender.FEMALE,
    birthDate: new Date('1995-03-15'),
    city: 'Amsterdam',
    postcode: '1012',
    latitude: 52.3676,
    longitude: 4.9041,
    bio: 'Avonturierlijke ziel met een passie voor reizen en fotografie 📸 Op zoek naar iemand om de wereld mee te ontdekken! Liefhebber van goede koffie en diepe gesprekken.',
    interests: 'Reizen, Fotografie, Yoga, Koken, Wandelen',
    profileImage: 'https://i.pravatar.cc/400?img=1',
  },
  {
    name: 'Liam de Vries',
    email: 'liam@demo.nl',
    gender: Gender.MALE,
    birthDate: new Date('1992-07-22'),
    city: 'Rotterdam',
    postcode: '3011',
    latitude: 51.9244,
    longitude: 4.4777,
    bio: 'Software engineer bij dag, drummer bij nacht 🥁 Zoek iemand die van festivals en spontane roadtrips houdt. Kan een killer pasta maken!',
    interests: 'Muziek, Programmeren, Festivals, Fitness, Gaming',
    profileImage: 'https://i.pravatar.cc/400?img=12',
  },
  {
    name: 'Emma Bakker',
    email: 'emma@demo.nl',
    gender: Gender.FEMALE,
    birthDate: new Date('1997-11-08'),
    city: 'Utrecht',
    postcode: '3511',
    latitude: 52.0907,
    longitude: 5.1214,
    bio: 'Grafisch ontwerper met een zwak voor vintage markten en plantjes 🌿 Zoek een partner in crime voor museums en brunch dates. Bonus points voor hondenmensen!',
    interests: 'Design, Kunst, Vintage, Planten, Honden',
    profileImage: 'https://i.pravatar.cc/400?img=5',
  },
  {
    name: 'Noah Jansen',
    email: 'noah@demo.nl',
    gender: Gender.MALE,
    birthDate: new Date('1990-05-30'),
    city: 'Den Haag',
    postcode: '2511',
    latitude: 52.0705,
    longitude: 4.3007,
    bio: 'Advocaat die graag hardloopt langs het strand 🏃‍♂️ Fan van goede wijn, betere gesprekken en spontane weekendjes weg. Zoek iemand ambitieus maar down-to-earth.',
    interests: 'Hardlopen, Wijn, Reizen, Lezen, Politiek',
    profileImage: 'https://i.pravatar.cc/400?img=13',
  },
  {
    name: 'Lisa Smit',
    email: 'lisa@demo.nl',
    gender: Gender.FEMALE,
    birthDate: new Date('1994-09-17'),
    city: 'Eindhoven',
    postcode: '5611',
    latitude: 51.4416,
    longitude: 5.4697,
    bio: 'Verpleegkundige met een groot hart ❤️ Hou van netflixen, koken en quality time. Zoek iemand lief en grappig voor een serieuze relatie. Ben jij dat?',
    interests: 'Koken, Series, Wandelen, Familie, Vrienden',
    profileImage: 'https://i.pravatar.cc/400?img=9',
  },
  {
    name: 'Daan Peters',
    email: 'daan@demo.nl',
    gender: Gender.MALE,
    birthDate: new Date('1993-02-14'),
    city: 'Amsterdam',
    postcode: '1017',
    latitude: 52.3555,
    longitude: 4.8838,
    bio: 'Architect en foodie 🍕 Altijd op zoek naar de beste restaurants in de stad. Hou van fietsen, design en goede muziek. Swipe right voor foodie dates!',
    interests: 'Architectuur, Eten, Fietsen, Design, Muziek',
    profileImage: 'https://i.pravatar.cc/400?img=14',
  },
  {
    name: 'Julia Hendriks',
    email: 'julia@demo.nl',
    gender: Gender.FEMALE,
    birthDate: new Date('1996-12-03'),
    city: 'Groningen',
    postcode: '9711',
    latitude: 53.2194,
    longitude: 6.5665,
    bio: 'PhD student en koffieverslaafde ☕ Passie voor wetenschap, boeken en katten. Zoek iemand intelligent en grappig. Geen oneliners please, echt gesprek!',
    interests: 'Wetenschap, Lezen, Katten, Koffie, Reizen',
    profileImage: 'https://i.pravatar.cc/400?img=10',
  },
  {
    name: 'Thijs van Dijk',
    email: 'thijs@demo.nl',
    gender: Gender.MALE,
    birthDate: new Date('1991-08-25'),
    city: 'Haarlem',
    postcode: '2011',
    latitude: 52.3874,
    longitude: 4.6462,
    bio: 'Marketing manager en sportfanaat ⚽ Voetbal op zondag, borrelen op vrijdag. Zoek iemand spontaan en sociaal voor leuke dates en avonturen.',
    interests: 'Voetbal, Marketing, Fitness, Uitgaan, Vrienden',
    profileImage: 'https://i.pravatar.cc/400?img=15',
  },
  {
    name: 'Mila Visser',
    email: 'mila@demo.nl',
    gender: Gender.FEMALE,
    birthDate: new Date('1998-04-19'),
    city: 'Leiden',
    postcode: '2311',
    latitude: 52.1601,
    longitude: 4.4970,
    bio: 'Student psychologie met een passie voor theater en dans 💃 Hou van diepe gesprekken en lachen tot je buikpijn hebt. Zoek een creatieve ziel!',
    interests: 'Psychologie, Theater, Dansen, Muziek, Festivals',
    profileImage: 'https://i.pravatar.cc/400?img=16',
  },
  {
    name: 'Max de Jong',
    email: 'max@demo.nl',
    gender: Gender.MALE,
    birthDate: new Date('1989-10-11'),
    city: 'Maastricht',
    postcode: '6211',
    latitude: 50.8514,
    longitude: 5.6909,
    bio: 'Ondernemer en reislover 🌍 Al 30 landen gezien en counting! Hou van goede gesprekken, nieuwe ervaringen en mensen die buiten hun comfort zone durven. Jij ook?',
    interests: 'Reizen, Ondernemen, Fotografie, Cultuur, Avontuur',
    profileImage: 'https://i.pravatar.cc/400?img=17',
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Hash the demo password once
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)

  // Create demo users
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        passwordHash,
        emailVerified: new Date(),
        isVerified: true,
        hasAcceptedTerms: true,
        safetyScore: 100,
        role: 'USER',
      },
    })

    console.log(`✅ Created/verified user: ${user.name} (${user.email})`)

    // Add profile photo
    if (userData.profileImage) {
      const existingPhoto = await prisma.photo.findFirst({
        where: { userId: user.id },
      })

      if (!existingPhoto) {
        await prisma.photo.create({
          data: {
            userId: user.id,
            url: userData.profileImage,
            order: 0,
          },
        })
      }
    }
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Demo Account Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Password for ALL accounts: Demo123!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  demoUsers.forEach((user) => {
    console.log(`📧 ${user.email.padEnd(20)} | ${user.name} (${user.city})`)
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
