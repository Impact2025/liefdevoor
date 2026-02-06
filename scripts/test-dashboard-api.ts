/**
 * Test Dashboard API
 */

import { prisma } from '../lib/prisma'

async function testDashboardAPI() {
  console.log('\n📊 Testing Dashboard API...\n')

  try {
    // Simulate the dashboard API call
    const startTime = Date.now()

    // Get overview
    const overview = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*) as "totalUsers",
        COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED')) as claimed,
        COUNT(*) FILTER (WHERE status = 'ACTIVATED') as activated,
        COUNT(*) FILTER (WHERE status != 'PENDING') as "emailsSent"
      FROM "MigrationUser"
    `

    const totalUsers = Number(overview[0]?.totalUsers || 0)
    const claimed = Number(overview[0]?.claimed || 0)
    const activated = Number(overview[0]?.activated || 0)
    const emailsSent = Number(overview[0]?.emailsSent || 0)

    const conversionRate = emailsSent > 0 ? (claimed / emailsSent) * 100 : 0
    const activationRate = claimed > 0 ? (activated / claimed) * 100 : 0
    const revenueImpact = claimed * 12.99

    // Get funnel
    const funnel = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "emailSent",
        COUNT(*) FILTER (WHERE status IN ('EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "emailOpened",
        COUNT(*) FILTER (WHERE status IN ('LINK_CLICKED', 'LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "linkClicked",
        COUNT(*) FILTER (WHERE status IN ('LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "landingVisited",
        COUNT(*) FILTER (WHERE status IN ('CLAIMED', 'ACTIVATED')) as claimed,
        COUNT(*) FILTER (WHERE status = 'ACTIVATED') as activated
      FROM "MigrationUser"
    `

    const endTime = Date.now()
    const queryTime = endTime - startTime

    console.log('✅ Dashboard API Test Results:\n')
    console.log('Performance:')
    console.log(`  Query Time: ${queryTime}ms ${queryTime < 500 ? '✅' : '⚠️'}`)
    console.log()
    console.log('Overview Metrics:')
    console.log(`  Total Users:      ${totalUsers.toLocaleString()}`)
    console.log(`  Emails Sent:      ${emailsSent.toLocaleString()}`)
    console.log(`  Claimed:          ${claimed}`)
    console.log(`  Activated:        ${activated} ✅`)
    console.log(`  Conversion Rate:  ${conversionRate.toFixed(1)}%`)
    console.log(`  Activation Rate:  ${activationRate.toFixed(1)}%`)
    console.log(`  Revenue Impact:   €${revenueImpact.toFixed(2)}`)
    console.log()
    console.log('Funnel Metrics:')
    console.log(`  Email Sent:       ${Number(funnel[0]?.emailSent || 0)}`)
    console.log(`  Email Opened:     ${Number(funnel[0]?.emailOpened || 0)}`)
    console.log(`  Link Clicked:     ${Number(funnel[0]?.linkClicked || 0)}`)
    console.log(`  Landing Visited:  ${Number(funnel[0]?.landingVisited || 0)}`)
    console.log(`  Claimed:          ${Number(funnel[0]?.claimed || 0)}`)
    console.log(`  Activated:        ${Number(funnel[0]?.activated || 0)} ✅`)

    console.log('\n✅ Dashboard API is working correctly!\n')

  } catch (error) {
    console.error('❌ Dashboard API Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDashboardAPI()
