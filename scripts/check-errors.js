const { PrismaClient } = require('@prisma/client')

async function checkErrors() {
  const prisma = new PrismaClient()

  try {
    // Get errors from the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const errors = await prisma.auditLog.findMany({
      where: {
        success: false,
        createdAt: { gte: yesterday }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        action: true,
        userId: true,
        targetUserId: true,
        ipAddress: true,
        details: true,
        createdAt: true
      }
    })

    console.log(`\n⚠️  Gevonden: ${errors.length} errors in de afgelopen 24 uur\n`)

    if (errors.length === 0) {
      console.log('✅ Geen errors gevonden!\n')
      return
    }

    errors.forEach((error, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`Error #${index + 1}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`🕐 Tijdstip: ${error.createdAt.toLocaleString('nl-NL')}`)
      console.log(`🔴 Action: ${error.action}`)
      console.log(`👤 User ID: ${error.userId || 'N/A'}`)
      console.log(`🎯 Target User ID: ${error.targetUserId || 'N/A'}`)
      console.log(`🌐 IP Address: ${error.ipAddress || 'N/A'}`)

      if (error.details) {
        try {
          const details = JSON.parse(error.details)
          console.log(`📝 Details:`)
          console.log(JSON.stringify(details, null, 2))
        } catch {
          console.log(`📝 Details: ${error.details}`)
        }
      }
      console.log('')
    })

    // Group errors by action type
    const errorsByAction = errors.reduce((acc, error) => {
      acc[error.action] = (acc[error.action] || 0) + 1
      return acc
    }, {})

    console.log(`\n📊 Samenvatting per action type:`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    Object.entries(errorsByAction).forEach(([action, count]) => {
      console.log(`  ${action}: ${count}x`)
    })
    console.log('')

  } catch (error) {
    console.error('❌ Fout bij het ophalen van errors:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkErrors()
