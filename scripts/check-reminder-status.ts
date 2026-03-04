import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkReminderStatus() {
  console.log('🔍 CHECKING REMINDER EMAIL STATUS\n')

  // Count reminder emails
  const reminderCount = await prisma.migrationEmail.count({
    where: { emailType: 'REMINDER' }
  })

  console.log(`Total REMINDER emails in database: ${reminderCount}`)

  // Check emails sent around Feb 10
  const feb10Count = await prisma.migrationUser.count({
    where: {
      lastEmailSentAt: {
        gte: new Date('2026-02-09T00:00:00Z'),
        lte: new Date('2026-02-11T23:59:59Z')
      }
    }
  })

  console.log(`Emails sent Feb 9-11: ${feb10Count}`)

  // Get all email types
  const emailsByType = await prisma.migrationEmail.groupBy({
    by: ['emailType'],
    _count: { id: true }
  })

  console.log('\nAll emails by type:')
  emailsByType.forEach(row => {
    console.log(`  ${row.emailType}: ${row._count.id}`)
  })

  // Check for any reminder emails
  const anyReminders = await prisma.migrationEmail.findMany({
    where: { emailType: 'REMINDER' },
    take: 5,
    orderBy: { sentAt: 'desc' },
    select: {
      sentAt: true,
      subject: true
    }
  })

  if (anyReminders.length > 0) {
    console.log('\nMost recent reminder emails:')
    anyReminders.forEach(email => {
      console.log(`  → ${email.sentAt.toLocaleDateString('nl-NL')} - ${email.subject}`)
    })
  }

  // Check non-converters
  const nonConverters = await prisma.migrationUser.count({
    where: {
      status: {
        in: ['EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED']
      },
      segment: { in: ['VIP', 'GOLD', 'ACTIVE', 'DORMANT'] }
    }
  })

  console.log(`\n📊 Non-converters ready for reminder: ${nonConverters}`)

  await prisma.$disconnect()
}

checkReminderStatus().catch(console.error)
