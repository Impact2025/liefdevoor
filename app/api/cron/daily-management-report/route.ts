import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { sendEmail } from '@/lib/email/send'
import DailyManagementReport from '@/lib/email/templates/admin/daily-management-report'

/**
 * Daily Management Report Cron Job
 *
 * Sends a comprehensive daily report to all admins every morning at 08:00
 * Contains: user metrics, engagement, revenue, safety, conversion funnel
 *
 * Schedule: 0 8 * * * (daily at 08:00 CET)
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[Daily Report] Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Daily Report] Starting daily management report...')

    // Get admin emails
    const adminEmails = await getAdminEmails()
    if (adminEmails.length === 0) {
      console.warn('[Daily Report] No admin emails configured')
      return NextResponse.json({ message: 'No admin emails configured' })
    }

    // Calculate date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    // Fetch all metrics in parallel
    const [
      // User metrics
      totalUsers,
      newUsersYesterday,
      newUsersThisWeek,
      activeUsersYesterday,
      onlineNow,

      // Match & engagement metrics
      totalMatches,
      newMatchesYesterday,
      messagesYesterday,

      // Subscription metrics
      activeSubscriptions,
      premiumUsers,
      goldUsers,

      // Safety metrics
      pendingReports,
      scamDetectionsYesterday,
      blocksYesterday,
      verificationsYesterday,

      // Error count
      activeErrors,

      // Funnel metrics (last 7 days)
      funnelVisitors,
      funnelRegistrations,
      funnelProfileComplete,
      funnelFirstSwipe,
      funnelFirstMatch,
      funnelFirstMessage
    ] = await Promise.all([
      // User metrics
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: yesterday, lt: today } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: weekAgo } }
      }),
      prisma.user.count({
        where: { lastSeen: { gte: yesterday, lt: today } }
      }),
      prisma.user.count({
        where: { lastSeen: { gte: fiveMinutesAgo } }
      }),

      // Match metrics
      prisma.match.count(),
      prisma.match.count({
        where: { createdAt: { gte: yesterday, lt: today } }
      }),
      prisma.message.count({
        where: { createdAt: { gte: yesterday, lt: today } }
      }),

      // Subscription metrics
      prisma.subscription.count({
        where: { status: 'active' }
      }),
      prisma.subscription.count({
        where: { status: 'active', plan: 'premium' }
      }),
      prisma.subscription.count({
        where: { status: 'active', plan: 'gold' }
      }),

      // Safety metrics
      prisma.report.count({
        where: { status: 'pending' }
      }),
      prisma.report.count({
        where: {
          createdAt: { gte: yesterday, lt: today },
          OR: [
            { reason: { contains: 'scam', mode: 'insensitive' } },
            { reason: { contains: 'fake', mode: 'insensitive' } },
            { reason: { contains: 'nep', mode: 'insensitive' } }
          ]
        }
      }),
      prisma.block.count({
        where: { createdAt: { gte: yesterday, lt: today } }
      }),
      prisma.user.count({
        where: {
          isPhotoVerified: true,
          updatedAt: { gte: yesterday, lt: today }
        }
      }),

      // Error count from audit log (only real system errors, not security events)
      prisma.auditLog.count({
        where: {
          success: false,
          createdAt: { gte: yesterday },
          // Exclude normal security events - these are expected behavior
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
      }),

      // Funnel metrics (7 days)
      prisma.user.count({
        where: { lastSeen: { gte: weekAgo } }
      }).then(count => Math.round(count * 2.5)), // Estimate visitors

      prisma.user.count({
        where: { createdAt: { gte: weekAgo } }
      }),

      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          bio: { not: null },
          photos: { some: {} }
        }
      }),

      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          outgoingSwipes: { some: {} }
        }
      }),

      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          OR: [
            { matches1: { some: {} } },
            { matches2: { some: {} } }
          ]
        }
      }),

      prisma.user.count({
        where: {
          createdAt: { gte: weekAgo },
          messages: { some: {} }
        }
      })
    ])

    // Estimate revenue (based on active subscriptions)
    // In production, you would get this from your payment provider
    const revenueYesterday = (premiumUsers * 14.95 / 30) + (goldUsers * 24.95 / 30)

    // Determine system status (based on real system errors, not security events)
    let systemStatus: 'OK' | 'WARNING' | 'CRITICAL' = 'OK'
    if (activeErrors > 5 || pendingReports > 20) {
      systemStatus = 'CRITICAL'
    } else if (activeErrors > 0 || pendingReports > 10) {
      systemStatus = 'WARNING'
    }

    // Render email
    const html = await render(
      DailyManagementReport({
        reportDate: now,
        totalUsers,
        newUsersYesterday,
        newUsersThisWeek,
        activeUsersYesterday,
        onlineNow,
        totalMatches,
        newMatchesYesterday,
        messagesYesterday,
        activeSubscriptions,
        premiumUsers,
        goldUsers,
        revenueYesterday: Math.round(revenueYesterday * 100) / 100,
        pendingReports,
        scamDetectionsYesterday,
        blocksYesterday,
        verificationsYesterday,
        systemStatus,
        funnelVisitors,
        funnelRegistrations,
        funnelProfileComplete,
        funnelFirstSwipe,
        funnelFirstMatch,
        funnelFirstMessage,
        activeErrors
      })
    )

    // Create plain text version
    const textVersion = `
Dagelijks Management Rapport - ${now.toLocaleDateString('nl-NL')}

SYSTEEM STATUS: ${systemStatus} ${activeErrors > 0 ? `(${activeErrors} systeem errors)` : ''}
${activeErrors === 0 ? '✅ Geen systeem errors (login failures en spam blocks worden niet geteld)' : ''}

GEBRUIKERS
- Totaal: ${totalUsers.toLocaleString()}
- Nieuw gisteren: +${newUsersYesterday}
- Nieuw deze week: +${newUsersThisWeek}
- Actief gisteren: ${activeUsersYesterday}
- Nu online: ${onlineNow}

MATCHES & ENGAGEMENT
- Totaal matches: ${totalMatches.toLocaleString()}
- Nieuwe matches gisteren: +${newMatchesYesterday}
- Berichten gisteren: ${messagesYesterday.toLocaleString()}

ABONNEMENTEN
- Actief: ${activeSubscriptions}
- Premium: ${premiumUsers}
- Gold: ${goldUsers}
- Geschatte omzet gisteren: €${revenueYesterday.toFixed(2)}

VEILIGHEID
- Openstaande reports: ${pendingReports}
- Scam detecties gisteren: ${scamDetectionsYesterday}
- Blokkades gisteren: ${blocksYesterday}
- Verificaties gisteren: ${verificationsYesterday}

CONVERSIE FUNNEL (7 dagen)
- Bezoekers: ${funnelVisitors.toLocaleString()}
- Registraties: ${funnelRegistrations}
- Profiel compleet: ${funnelProfileComplete}
- Eerste swipe: ${funnelFirstSwipe}
- Eerste match: ${funnelFirstMatch}
- Eerste bericht: ${funnelFirstMessage}

Bekijk het volledige dashboard: ${process.env.NEXTAUTH_URL || 'https://liefdevooriedereen.nl'}/admin/dashboard
`

    // Send to all admins
    const results = await Promise.allSettled(
      adminEmails.map(email =>
        sendEmail({
          to: email,
          subject: `📊 Dagelijks Rapport: +${newUsersYesterday} users, +${newMatchesYesterday} matches - ${now.toLocaleDateString('nl-NL')}`,
          html,
          text: textVersion
        })
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`[Daily Report] ✅ Sent to ${successful}/${adminEmails.length} admins${failed > 0 ? ` (${failed} failed)` : ''}`)

    return NextResponse.json({
      success: true,
      message: `Daily report sent to ${successful} admins`,
      stats: {
        totalUsers,
        newUsersYesterday,
        activeSubscriptions,
        pendingReports,
        systemStatus
      }
    })
  } catch (error) {
    console.error('[Daily Report] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to send daily report' },
      { status: 500 }
    )
  }
}

/**
 * Get admin email addresses from environment or database
 */
async function getAdminEmails(): Promise<string[]> {
  // Try environment variable first
  const envAdmins = process.env.ADMIN_EMAILS
  if (envAdmins) {
    return envAdmins.split(',').map(email => email.trim())
  }

  // Fallback: Get from database
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { email: true, emailVerified: true }
  })

  return admins
    .filter(admin => admin.email && admin.emailVerified)
    .map(admin => admin.email!)
}
