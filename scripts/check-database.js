/**
 * Check Database Configuration
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database configuration...\n')

    // Check database connection
    const databaseUrl = process.env.DATABASE_URL
    if (databaseUrl) {
      // Extract host from URL (hide credentials)
      const urlMatch = databaseUrl.match(/@([^/]+)/)
      const host = urlMatch ? urlMatch[1] : 'unknown'
      console.log('📊 Database Host:', host)
      console.log('   Type: PostgreSQL (Neon)\n')
    }

    // Count total users
    const totalUsers = await prisma.user.count()
    console.log('👥 Total Users:', totalUsers)

    // Count admin users
    const adminUsers = await prisma.user.count({
      where: { role: 'ADMIN' }
    })
    console.log('🔐 Admin Users:', adminUsers)

    // Check for admin@liefdevooriedereen.nl
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@liefdevooriedereen.nl' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    })

    console.log('\n📧 admin@liefdevooriedereen.nl:')
    if (adminUser) {
      console.log('   ✅ EXISTS')
      console.log('   Name:', adminUser.name)
      console.log('   Role:', adminUser.role)
      console.log('   Verified:', adminUser.isVerified)
      console.log('   Created:', adminUser.createdAt.toLocaleDateString())

      if (adminUser.role !== 'ADMIN') {
        console.log('\n   ⚠️  WARNING: Role is not ADMIN!')
        console.log('   Current role:', adminUser.role)
      }
    } else {
      console.log('   ❌ NOT FOUND')
      console.log('   This user does not exist in the database.')
    }

    // List all users with their roles
    console.log('\n📋 All Users:')
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        isVerified: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (allUsers.length === 0) {
      console.log('   No users found in database')
    } else {
      allUsers.forEach((user, index) => {
        const roleIcon = user.role === 'ADMIN' ? '👑' : '👤'
        const verifiedIcon = user.isVerified ? '✅' : '⏳'
        console.log(`   ${index + 1}. ${roleIcon} ${user.email} (${user.role}) ${verifiedIcon}`)
      })
    }

    console.log('\n✅ Database check complete!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
