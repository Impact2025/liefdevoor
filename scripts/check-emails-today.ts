/**
 * Check emails sent today
 */

import { prisma } from '../lib/prisma'

async function checkEmailsToday() {
  console.log('\n📧 Emails Sent Today\n')
  console.log('═'.repeat(60))

  // Get today's emails
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const emails = await prisma.$queryRaw<any[]>`
    SELECT
      DATE_TRUNC('hour', "sentAt") as hour,
      "emailType",
      COUNT(*) as count
    FROM "MigrationEmail"
    WHERE "sentAt" >= ${today}
    GROUP BY DATE_TRUNC('hour', "sentAt"), "emailType"
    ORDER BY hour DESC
  `

  const totalToday = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as total
    FROM "MigrationEmail"
    WHERE "sentAt" >= ${today}
  `

  const total = Number(totalToday[0]?.total || 0)

  console.log(`\n📊 Total emails today: ${total}`)

  if (emails.length > 0) {
    console.log('\nBreakdown by hour and type:')
    console.log('─'.repeat(60))

    emails.forEach(row => {
      const hour = new Date(row.hour).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
      })
      console.log(`  ${hour} - ${row.emailType}: ${row.count} emails`)
    })
  } else {
    console.log('\n✅ No emails sent today')
  }

  // Also check last 7 days
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  const weekTotal = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as total
    FROM "MigrationEmail"
    WHERE "sentAt" >= ${last7Days}
  `

  console.log('\n📈 Last 7 days:')
  console.log(`   Total: ${weekTotal[0]?.total || 0} emails`)

  // Check by day
  const byDay = await prisma.$queryRaw<any[]>`
    SELECT
      DATE_TRUNC('day', "sentAt") as day,
      COUNT(*) as count
    FROM "MigrationEmail"
    WHERE "sentAt" >= ${last7Days}
    GROUP BY DATE_TRUNC('day', "sentAt")
    ORDER BY day DESC
  `

  if (byDay.length > 0) {
    console.log('\n   By day:')
    byDay.forEach(row => {
      const date = new Date(row.day).toLocaleDateString('nl-NL', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit'
      })
      console.log(`   ${date}: ${row.count} emails`)
    })
  }

  console.log('\n' + '═'.repeat(60))

  await prisma.$disconnect()
}

checkEmailsToday()
