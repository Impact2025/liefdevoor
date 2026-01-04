/**
 * Check recent audit logs for login attempts
 */

import { prisma } from '../lib/prisma'

async function checkAuditLogs() {
  console.log('📋 Checking recent login attempts...\n')

  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { action: 'LOGIN_FAILED' },
        { action: 'LOGIN_SUCCESS' },
        { action: 'LOGIN_RATE_LIMITED' },
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  if (logs.length === 0) {
    console.log('No login attempts found in audit logs.\n')
    return
  }

  console.log(`Found ${logs.length} recent login attempts:\n`)

  for (const log of logs) {
    const timestamp = new Date(log.createdAt).toLocaleString()
    const action = log.action
    const success = log.success ? '✅' : '❌'

    // Parse details if it's a JSON string
    let parsedDetails: any = {}
    if (log.details) {
      try {
        parsedDetails = JSON.parse(log.details)
      } catch {
        parsedDetails = { raw: log.details }
      }
    }

    const email = parsedDetails?.email || 'unknown'
    const details = JSON.stringify(parsedDetails, null, 2)

    console.log(`${success} ${action}`)
    console.log(`   Time: ${timestamp}`)
    console.log(`   UserId: ${log.userId || 'N/A'}`)
    console.log(`   Email: ${email}`)
    if (log.details) {
      console.log(`   Details: ${details}`)
    }
    console.log('')
  }

  await prisma.$disconnect()
}

checkAuditLogs().catch(console.error)
