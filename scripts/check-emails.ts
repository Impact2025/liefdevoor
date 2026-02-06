import { prisma } from '../lib/prisma'

async function checkEmails() {
  // Check recent email logs
  const emails = await prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 30,
    select: {
      id: true,
      email: true,
      subject: true,
      category: true,
      status: true,
      sentAt: true
    }
  })

  console.log('=== RECENTE EMAILS (laatste 30) ===\n')
  for (const e of emails) {
    const date = new Date(e.sentAt).toLocaleString('nl-NL')
    const subj = e.subject?.substring(0, 45) || '-'
    console.log(`[${e.status?.padEnd(7) || 'unknown'}] ${date} | ${(e.category || '-').padEnd(12)} | ${subj}`)
  }

  // Count by category for different periods
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const todayCounts = await prisma.emailLog.groupBy({
    by: ['category'],
    where: {
      sentAt: { gte: today }
    },
    _count: true
  })

  const yesterdayCounts = await prisma.emailLog.groupBy({
    by: ['category'],
    where: {
      sentAt: { gte: yesterday, lt: today }
    },
    _count: true
  })

  const twoDaysAgoCounts = await prisma.emailLog.groupBy({
    by: ['category'],
    where: {
      sentAt: { gte: twoDaysAgo, lt: yesterday }
    },
    _count: true
  })

  console.log('\n=== EMAIL COUNTS PER DAG ===\n')
  console.log('Vandaag (27 jan):')
  todayCounts.forEach(c => console.log(`  ${c.category}: ${c._count}`))
  if (todayCounts.length === 0) console.log('  (geen emails)')

  console.log('\nGisteren (26 jan):')
  yesterdayCounts.forEach(c => console.log(`  ${c.category}: ${c._count}`))
  if (yesterdayCounts.length === 0) console.log('  (geen emails)')

  console.log('\nEergisteren (25 jan):')
  twoDaysAgoCounts.forEach(c => console.log(`  ${c.category}: ${c._count}`))
  if (twoDaysAgoCounts.length === 0) console.log('  (geen emails)')

  // Check for specific cron email types
  console.log('\n=== CRON/AUTOMATED EMAILS CHECK ===\n')

  const cronCategories = ['daily-report', 'admin', 'weekly-matches', 'reminder', 'notification']

  for (const cat of cronCategories) {
    const count = await prisma.emailLog.count({
      where: {
        category: cat,
        sentAt: { gte: twoDaysAgo }
      }
    })
    console.log(`${cat}: ${count} (laatste 2 dagen)`)
  }

  await prisma.$disconnect()
}

checkEmails().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
