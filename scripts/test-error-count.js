const { PrismaClient } = require('@prisma/client')

async function testErrorCount() {
  const prisma = new PrismaClient()

  try {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    console.log('\n🔍 Testing error counting logic...\n')

    // OLD logic: All failures
    const allErrors = await prisma.auditLog.count({
      where: {
        success: false,
        createdAt: { gte: yesterday }
      }
    })

    // NEW logic: Only real system errors (excluding security events)
    const systemErrors = await prisma.auditLog.count({
      where: {
        success: false,
        createdAt: { gte: yesterday },
        action: {
          notIn: [
            'LOGIN_FAILED',
            'REGISTER_HONEYPOT_TRIGGERED',
            'REGISTER_BLOCKED_EMAIL',
            'REGISTER_SPAM_DETECTED',
            'REGISTER_BLOCKED_DOMAIN',
            'PASSWORD_RESET_INVALID_TOKEN',
            'EMAIL_VERIFICATION_FAILED',
            'SUSPICIOUS_ACTIVITY_BLOCKED'
          ]
        }
      }
    })

    // Get the excluded security events
    const securityEvents = await prisma.auditLog.findMany({
      where: {
        success: false,
        createdAt: { gte: yesterday },
        action: {
          in: [
            'LOGIN_FAILED',
            'REGISTER_HONEYPOT_TRIGGERED',
            'REGISTER_BLOCKED_EMAIL',
            'REGISTER_SPAM_DETECTED',
            'REGISTER_BLOCKED_DOMAIN',
            'PASSWORD_RESET_INVALID_TOKEN',
            'EMAIL_VERIFICATION_FAILED',
            'SUSPICIOUS_ACTIVITY_BLOCKED'
          ]
        }
      },
      select: {
        action: true,
        createdAt: true
      }
    })

    console.log('📊 RESULTATEN')
    console.log('═'.repeat(60))
    console.log(`❌ Oude telling (alle failures):        ${allErrors}`)
    console.log(`✅ Nieuwe telling (systeem errors):     ${systemErrors}`)
    console.log(`🛡️  Beveiligingsgebeurtenissen:         ${securityEvents.length}`)
    console.log('═'.repeat(60))

    if (securityEvents.length > 0) {
      console.log('\n🛡️  Uitgesloten beveiligingsgebeurtenissen:')
      const grouped = securityEvents.reduce((acc, event) => {
        acc[event.action] = (acc[event.action] || 0) + 1
        return acc
      }, {})
      Object.entries(grouped).forEach(([action, count]) => {
        console.log(`   • ${action}: ${count}x`)
      })
    }

    // Determine system status with new logic
    let systemStatus = 'OK'
    if (systemErrors > 5) {
      systemStatus = 'CRITICAL'
    } else if (systemErrors > 0) {
      systemStatus = 'WARNING'
    }

    console.log('\n📧 Email status met nieuwe logica:')
    console.log('═'.repeat(60))
    console.log(`Systeem Status: ${systemStatus}`)
    if (systemErrors === 0) {
      console.log('✅ Geen systeem errors (login failures en spam blocks worden niet geteld)')
    } else {
      console.log(`⚠️  ${systemErrors} systeem errors gevonden`)
    }
    console.log('═'.repeat(60))
    console.log('')

  } catch (error) {
    console.error('❌ Fout:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testErrorCount()
