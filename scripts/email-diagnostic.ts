/**
 * Email System Diagnostic Tool
 *
 * Checks:
 * 1. Email configuration
 * 2. Recent email logs
 * 3. Failed email deliveries
 * 4. Email provider status
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function emailDiagnostic() {
  console.log('📧 EMAIL SYSTEM DIAGNOSTICS')
  console.log('='.repeat(80))
  console.log()

  try {
    // Check environment variables
    console.log('🔧 CONFIGURATIE CHECK\n')

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpFrom = process.env.SMTP_FROM
    const resendKey = process.env.RESEND_API_KEY

    console.log(`   SMTP Host: ${smtpHost ? '✅ Geconfigureerd' : '❌ Niet geconfigureerd'}`)
    console.log(`   SMTP Port: ${smtpPort || 'Niet geconfigureerd'}`)
    console.log(`   SMTP User: ${smtpUser ? '✅ Geconfigureerd' : '❌ Niet geconfigureerd'}`)
    console.log(`   SMTP From: ${smtpFrom || 'Niet geconfigureerd'}`)
    console.log(`   Resend API: ${resendKey ? '✅ Geconfigureerd' : '❌ Niet geconfigureerd'}`)

    console.log()

    // Email logs analysis
    console.log('📊 EMAIL LOGS (laatste 30 dagen)\n')

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Total emails
    const totalEmails = await prisma.emailLog.count({
      where: { sentAt: { gte: last30Days } }
    })

    // By category
    const byCategory = await prisma.emailLog.groupBy({
      by: ['category'],
      where: { sentAt: { gte: last30Days } },
      _count: true,
      orderBy: { _count: { category: 'desc' } }
    })

    console.log(`   Totaal emails verzonden: ${totalEmails}`)
    console.log(`   \n   Per categorie:`)
    for (const cat of byCategory) {
      console.log(`      ${cat.category}: ${cat._count}`)
    }

    // By status
    const byStatus = await prisma.emailLog.groupBy({
      by: ['status'],
      where: { sentAt: { gte: last30Days } },
      _count: true
    })

    console.log(`   \n   Per status:`)
    for (const status of byStatus) {
      console.log(`      ${status.status}: ${status._count}`)
    }

    console.log()

    // Failed emails details
    console.log('❌ GEFAALDE EMAILS (laatste 7 dagen)\n')

    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const failedEmails = await prisma.emailLog.findMany({
      where: {
        status: 'failed',
        sentAt: { gte: last7Days }
      },
      select: {
        category: true,
        email: true,
        sentAt: true,
        errorMessage: true,
        subject: true
      },
      orderBy: { sentAt: 'desc' },
      take: 10
    })

    if (failedEmails.length > 0) {
      for (const email of failedEmails) {
        console.log(`   ${email.category} → ${email.email}`)
        console.log(`   └─ ${new Date(email.sentAt).toLocaleString('nl-NL')}`)
        console.log(`   └─ Error: ${email.errorMessage || 'Geen error message'}`)
        console.log()
      }
    } else {
      console.log(`   ✅ Geen gefaalde emails`)
    }

    console.log()

    // Verification emails specifically
    console.log('✉️  VERIFICATIE EMAILS\n')

    const verificationEmails = await prisma.emailLog.findMany({
      where: {
        category: 'VERIFICATION',
        sentAt: { gte: last30Days }
      },
      select: {
        email: true,
        status: true,
        sentAt: true,
        deliveredAt: true,
        openedAt: true,
        errorMessage: true
      },
      orderBy: { sentAt: 'desc' },
      take: 10
    })

    console.log(`   Laatste 10 verificatie emails:\n`)
    if (verificationEmails.length > 0) {
      for (const email of verificationEmails) {
        const statusIcon = email.status === 'delivered' ? '✅' :
                          email.status === 'failed' ? '❌' : '⏳'
        console.log(`   ${statusIcon} ${email.email}`)
        console.log(`      Verzonden: ${new Date(email.sentAt).toLocaleString('nl-NL')}`)
        if (email.deliveredAt) {
          console.log(`      Afgeleverd: ${new Date(email.deliveredAt).toLocaleString('nl-NL')}`)
        }
        if (email.openedAt) {
          console.log(`      Geopend: ${new Date(email.openedAt).toLocaleString('nl-NL')}`)
        }
        if (email.errorMessage) {
          console.log(`      Error: ${email.errorMessage}`)
        }
        console.log()
      }
    } else {
      console.log(`   ⚠️  GEEN VERIFICATIE EMAILS GEVONDEN IN LAATSTE 30 DAGEN!`)
      console.log(`   Dit verklaart waarom gebruikers hun email niet kunnen verifiëren.`)
    }

    console.log()

    // Check recent registrations without verification emails
    console.log('🔍 REGISTRATIES ZONDER VERIFICATIE EMAIL (laatste 7 dagen)\n')

    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: last7Days },
        emailVerified: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`   Totaal: ${recentUsers.length} gebruikers\n`)

    for (const user of recentUsers) {
      // Check if verification email was sent
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          email: user.email!,
          category: 'VERIFICATION'
        },
        orderBy: { sentAt: 'desc' }
      })

      const hasEmailLog = emailLog ? '✅' : '❌'
      console.log(`   ${hasEmailLog} ${user.email}`)
      console.log(`      Geregistreerd: ${new Date(user.createdAt).toLocaleString('nl-NL')}`)
      if (emailLog) {
        console.log(`      Email verzonden: ${new Date(emailLog.sentAt).toLocaleString('nl-NL')} (${emailLog.status})`)
      } else {
        console.log(`      ⚠️  GEEN VERIFICATIE EMAIL VERZONDEN!`)
      }
      console.log()
    }

    // Email delivery rates
    console.log('📈 EMAIL DELIVERY METRICS (laatste 30 dagen)\n')

    const deliveryStats = await prisma.emailLog.groupBy({
      by: ['status'],
      where: { sentAt: { gte: last30Days } },
      _count: true
    })

    const totalSent = deliveryStats.reduce((acc, s) => acc + s._count, 0)

    for (const stat of deliveryStats) {
      const percentage = totalSent > 0 ? (stat._count / totalSent * 100).toFixed(1) : '0'
      console.log(`   ${stat.status}: ${stat._count} (${percentage}%)`)
    }

    console.log()

    // Check if Resend is working
    console.log('🔌 EMAIL PROVIDER STATUS\n')

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentEmailsCount = await prisma.emailLog.count({
      where: { sentAt: { gte: last24Hours } }
    })

    if (recentEmailsCount === 0) {
      console.log(`   ❌ KRITIEK: Geen emails verzonden in laatste 24 uur`)
      console.log(`   Mogelijke oorzaken:`)
      console.log(`   - Email provider (Resend) niet geconfigureerd`)
      console.log(`   - SMTP credentials incorrect`)
      console.log(`   - sendEmail() functie faalt silent`)
      console.log(`   - Email logging functionaliteit kapot`)
    } else {
      console.log(`   ✅ Email systeem actief (${recentEmailsCount} emails laatste 24u)`)
    }

    console.log()
    console.log('='.repeat(80))
    console.log('✅ Diagnostic compleet!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

emailDiagnostic().catch(console.error)
