/**
 * Demo Account Creator
 *
 * Creates 10 realistic demo accounts with complete profiles
 */

import { PrismaClient, Gender } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface DemoUser {
  name: string
  email: string
  password: string
  birthDate: Date
  gender: Gender
  city: string
  bio: string
  interests: string[]
}

const demoUsers: DemoUser[] = [
  {
    name: 'Sophie',
    email: 'sophie.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1995-03-15'),
    gender: Gender.FEMALE,
    city: 'Amsterdam',
    bio: 'Kunstliefhebber, yogafanaat en koffieliefhebber. Altijd op zoek naar nieuwe avonturen en interessante gesprekken. Houd van reizen en goede boeken.',
    interests: ['Yoga', 'Kunst', 'Reizen', 'Lezen', 'Koffie', 'Fotografie']
  },
  {
    name: 'Thomas',
    email: 'thomas.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1992-07-22'),
    gender: Gender.MALE,
    city: 'Rotterdam',
    bio: 'Software developer die houdt van fitness en gamen. In het weekend graag naar buiten voor een wandeling of fietstocht. Zoek iemand om mee te lachen.',
    interests: ['Fitness', 'Gaming', 'Fietsen', 'Wandelen', 'Tech', 'Films']
  },
  {
    name: 'Emma',
    email: 'emma.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1998-11-08'),
    gender: Gender.FEMALE,
    city: 'Utrecht',
    bio: 'Student psychologie met een passie voor muziek en festivals. Hou van spontane uitjes en nieuwe mensen ontmoeten. Vegetariër en dierenliefhebber.',
    interests: ['Muziek', 'Festivals', 'Dieren', 'Vegetarisch koken', 'Psychologie', 'Uitgaan']
  },
  {
    name: 'Lars',
    email: 'lars.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1990-05-30'),
    gender: Gender.MALE,
    city: 'Den Haag',
    bio: 'Architect met een voorliefde voor moderne kunst en design. Hou van goede gesprekken bij een glas wijn. Weekenden graag aan het strand.',
    interests: ['Architectuur', 'Design', 'Kunst', 'Wijn', 'Strand', 'Reizen']
  },
  {
    name: 'Lisa',
    email: 'lisa.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1994-09-12'),
    gender: Gender.FEMALE,
    city: 'Eindhoven',
    bio: 'Marketing professional die houdt van fotograferen en nieuwe plekken ontdekken. Foodie en altijd op zoek naar de beste restaurants. Liefde voor reizen.',
    interests: ['Fotografie', 'Eten', 'Reizen', 'Marketing', 'Restaurants', 'Instagram']
  },
  {
    name: 'Max',
    email: 'max.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1996-01-25'),
    gender: Gender.MALE,
    city: 'Groningen',
    bio: 'Sportschoolhouder en personal trainer. Passie voor gezond leven en anderen helpen hun doelen te bereiken. Hou van hardlopen en mountainbiken.',
    interests: ['Fitness', 'Hardlopen', 'Mountainbiken', 'Gezond leven', 'Coachen', 'Sport']
  },
  {
    name: 'Sarah',
    email: 'sarah.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1993-12-03'),
    gender: Gender.FEMALE,
    city: 'Haarlem',
    bio: 'Lerares die houdt van dansen en theater. Creatief en enthousiast. Houd van gezellige etentjes met vrienden en culturele uitjes. Zoek iemand met humor.',
    interests: ['Dansen', 'Theater', 'Onderwijs', 'Cultuur', 'Vrienden', 'Eten']
  },
  {
    name: 'Daan',
    email: 'daan.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1991-06-18'),
    gender: Gender.MALE,
    city: 'Maastricht',
    bio: 'Journalist met een passie voor schrijven en storytelling. Nieuwsgierig naar de wereld en graag op reis. Hou van goede muziek en live concerten.',
    interests: ['Schrijven', 'Journalistiek', 'Reizen', 'Muziek', 'Concerten', 'Lezen']
  },
  {
    name: 'Nina',
    email: 'nina.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1997-04-09'),
    gender: Gender.FEMALE,
    city: 'Breda',
    bio: 'Grafisch ontwerper en illustrator. Creatieve ziel die houdt van kunst, natuur en avontuur. Hond als beste vriend. Zoek iemand om mee te wandelen.',
    interests: ['Design', 'Illustratie', 'Kunst', 'Natuur', 'Honden', 'Wandelen']
  },
  {
    name: 'Robin',
    email: 'robin.demo@liefdevooriedereen.nl',
    password: 'Demo123!',
    birthDate: new Date('1995-08-14'),
    gender: Gender.MALE,
    city: 'Nijmegen',
    bio: 'Arts in opleiding met een groot hart. Hou van hardlopen, koken en nieuwe dingen leren. Zoek iemand om mee te groeien en avonturen te beleven.',
    interests: ['Geneeskunde', 'Hardlopen', 'Koken', 'Leren', 'Wetenschappen', 'Reizen']
  }
]

async function createDemoAccounts() {
  console.log('🚀 Starting demo account creation...\n')

  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      })

      if (existingUser) {
        console.log(`⏭️  ${user.name} (${user.email}) already exists, skipping...`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 12)

      // Create user
      const createdUser = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordHash: hashedPassword,
          birthDate: user.birthDate,
          gender: user.gender,
          city: user.city,
          bio: user.bio,
          interests: JSON.stringify(user.interests),
          isVerified: true, // Auto-verify demo accounts
          emailVerified: new Date(),
          hasAcceptedTerms: true,
          profileComplete: true,
          lookingFor: user.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
          // Random preferences
          minAgePreference: 22 + Math.floor(Math.random() * 5),
          maxAgePreference: 35 + Math.floor(Math.random() * 10),
        }
      })

      console.log(`✅ Created ${user.name} (${user.email})`)
      console.log(`   - Age: ${calculateAge(user.birthDate)} years`)
      console.log(`   - City: ${user.city}`)
      console.log(`   - Interests: ${user.interests.slice(0, 3).join(', ')}...\n`)

    } catch (error) {
      console.error(`❌ Error creating ${user.name}:`, error)
    }
  }

  console.log('✨ Demo account creation complete!\n')
  console.log('📝 Login credentials for all accounts:')
  console.log('   Password: Demo123!\n')

  await prisma.$disconnect()
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// Run the script
createDemoAccounts()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
