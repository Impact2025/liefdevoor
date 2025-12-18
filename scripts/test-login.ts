import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  const email = 'sophie@demo.nl'
  const password = 'Demo123!'

  console.log('🔍 Testing login for:', email)
  console.log('📝 Password:', password)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  })

  if (!user) {
    console.log('❌ User not found in database')
    console.log('\nSearching for any users with demo.nl...')
    const demoUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'demo.nl',
        },
      },
      select: {
        email: true,
        name: true,
      },
      take: 5,
    })
    console.log('Found:', demoUsers)
    return
  }

  console.log('✅ User found:')
  console.log('   ID:', user.id)
  console.log('   Name:', user.name)
  console.log('   Email:', user.email)
  console.log('   Role:', user.role)
  console.log('   Has password hash:', !!user.passwordHash)
  console.log()

  if (!user.passwordHash) {
    console.log('❌ No password hash stored!')
    return
  }

  // Test password
  console.log('🔐 Testing password comparison...')
  const isValid = await bcrypt.compare(password, user.passwordHash)

  if (isValid) {
    console.log('✅ PASSWORD IS VALID! Login should work.')
  } else {
    console.log('❌ PASSWORD IS INVALID!')
    console.log('\nTesting if hash format is correct...')
    const testHash = await bcrypt.hash(password, 12)
    const testValid = await bcrypt.compare(password, testHash)
    console.log('Test hash works:', testValid)
  }
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
