/**
 * WERELDKLASSE Health Monitoring API
 *
 * Real-time system health metrics including:
 * - Email system status
 * - Registration funnel metrics
 * - Spam detection stats
 * - System errors
 * - Performance indicators
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface HealthMetrics {
  timestamp: string
  overall: 'healthy' | 'degraded' | 'critical'
  email: {
    status: 'operational' | 'degraded' | 'down'
    last24h: {
      sent: number
      delivered: number
      failed: number
      deliveryRate: number
    }
    verificationEmails: {
      sent: number
      deliveryRate: number
    }
  }
  registration: {
    last24h: number
    last7d: number
    verificationRate: number
    onboardingCompletionRate: number
    profileCompleteRate: number
  }
  spam: {
    detectedLast24h: number
    blockedLast24h: number
    failedLoginsLast24h: number
    spamRate: number
  }
  errors: {
    last24h: number
    last7d: number
    critical: number
  }
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical'
    message: string
    metric?: string
    value?: number
    threshold?: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const metrics: HealthMetrics = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      email: {
        status: 'operational',
        last24h: { sent: 0, delivered: 0, failed: 0, deliveryRate: 0 },
        verificationEmails: { sent: 0, deliveryRate: 0 }
      },
      registration: {
        last24h: 0,
        last7d: 0,
        verificationRate: 0,
        onboardingCompletionRate: 0,
        profileCompleteRate: 0
      },
      spam: {
        detectedLast24h: 0,
        blockedLast24h: 0,
        failedLoginsLast24h: 0,
        spamRate: 0
      },
      errors: {
        last24h: 0,
        last7d: 0,
        critical: 0
      },
      alerts: []
    }

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Parallel queries for performance
    const [
      emailStats,
      verificationEmails,
      registrations24h,
      registrations7d,
      verifiedUsers7d,
      onboardedUsers7d,
      profileCompleteUsers7d,
      spamDetected24h,
      failedLogins24h,
      systemErrors24h,
      systemErrors7d
    ] = await Promise.all([
      // Email stats
      prisma.emailLog.groupBy({
        by: ['status'],
        where: { sentAt: { gte: last24h } },
        _count: true
      }),

      // Verification emails
      prisma.emailLog.groupBy({
        by: ['status'],
        where: {
          category: 'VERIFICATION',
          sentAt: { gte: last24h }
        },
        _count: true
      }),

      // Registrations last 24h
      prisma.user.count({
        where: { createdAt: { gte: last24h } }
      }),

      // Registrations last 7d
      prisma.user.count({
        where: { createdAt: { gte: last7d } }
      }),

      // Verified users (last 7d registrations)
      prisma.user.count({
        where: {
          createdAt: { gte: last7d },
          emailVerified: { not: null }
        }
      }),

      // Onboarded users (last 7d registrations)
      prisma.user.count({
        where: {
          createdAt: { gte: last7d },
          isOnboarded: true
        }
      }),

      // Profile complete users (last 7d registrations)
      prisma.user.count({
        where: {
          createdAt: { gte: last7d },
          profileComplete: true
        }
      }),

      // Spam detected
      prisma.auditLog.count({
        where: {
          action: {
            in: [
              'REGISTER_HONEYPOT_TRIGGERED',
              'REGISTER_SPAM_DETECTED',
              'REGISTER_BLOCKED_EMAIL',
              'REGISTER_BOT_TIMING'
            ]
          },
          createdAt: { gte: last24h }
        }
      }),

      // Failed logins
      prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          createdAt: { gte: last24h }
        }
      }),

      // System errors (last 24h)
      prisma.auditLog.count({
        where: {
          success: false,
          action: {
            notIn: [
              'LOGIN_FAILED',
              'REGISTER_HONEYPOT_TRIGGERED',
              'REGISTER_SPAM_DETECTED',
              'REGISTER_BLOCKED_EMAIL',
              'REGISTER_BOT_TIMING',
              'PASSWORD_RESET_INVALID_TOKEN',
              'EMAIL_VERIFICATION_FAILED'
            ]
          },
          createdAt: { gte: last24h }
        }
      }),

      // System errors (last 7d)
      prisma.auditLog.count({
        where: {
          success: false,
          action: {
            notIn: [
              'LOGIN_FAILED',
              'REGISTER_HONEYPOT_TRIGGERED',
              'REGISTER_SPAM_DETECTED',
              'REGISTER_BLOCKED_EMAIL',
              'REGISTER_BOT_TIMING',
              'PASSWORD_RESET_INVALID_TOKEN',
              'EMAIL_VERIFICATION_FAILED'
            ]
          },
          createdAt: { gte: last7d }
        }
      })
    ])

    // Email metrics
    const emailSent = emailStats.reduce((acc, s) => acc + s._count, 0)
    const emailDelivered = emailStats.find(s => s.status === 'delivered')?._count || 0
    const emailFailed = emailStats.find(s => s.status === 'failed')?._count || 0
    const emailDeliveryRate = emailSent > 0 ? (emailDelivered / emailSent * 100) : 0

    metrics.email.last24h = {
      sent: emailSent,
      delivered: emailDelivered,
      failed: emailFailed,
      deliveryRate: parseFloat(emailDeliveryRate.toFixed(1))
    }

    // Verification emails
    const verificationSent = verificationEmails.reduce((acc, s) => acc + s._count, 0)
    const verificationDelivered = verificationEmails.find(s => s.status === 'delivered')?._count || 0
    const verificationRate = verificationSent > 0 ? (verificationDelivered / verificationSent * 100) : 0

    metrics.email.verificationEmails = {
      sent: verificationSent,
      deliveryRate: parseFloat(verificationRate.toFixed(1))
    }

    // Email status
    if (emailSent === 0) {
      metrics.email.status = 'down'
      metrics.alerts.push({
        severity: 'critical',
        message: 'Email system inactive - no emails sent in last 24 hours',
        metric: 'email.sent',
        value: 0,
        threshold: 1
      })
    } else if (emailDeliveryRate < 80) {
      metrics.email.status = 'degraded'
      metrics.alerts.push({
        severity: 'warning',
        message: `Email delivery rate below 80% (${emailDeliveryRate.toFixed(1)}%)`,
        metric: 'email.deliveryRate',
        value: emailDeliveryRate,
        threshold: 80
      })
    }

    // Registration metrics
    metrics.registration.last24h = registrations24h
    metrics.registration.last7d = registrations7d
    metrics.registration.verificationRate = registrations7d > 0
      ? parseFloat((verifiedUsers7d / registrations7d * 100).toFixed(1))
      : 0
    metrics.registration.onboardingCompletionRate = registrations7d > 0
      ? parseFloat((onboardedUsers7d / registrations7d * 100).toFixed(1))
      : 0
    metrics.registration.profileCompleteRate = registrations7d > 0
      ? parseFloat((profileCompleteUsers7d / registrations7d * 100).toFixed(1))
      : 0

    // Registration alerts
    if (metrics.registration.verificationRate < 50) {
      metrics.alerts.push({
        severity: 'critical',
        message: `Email verification rate critically low (${metrics.registration.verificationRate}%)`,
        metric: 'registration.verificationRate',
        value: metrics.registration.verificationRate,
        threshold: 50
      })
    } else if (metrics.registration.verificationRate < 80) {
      metrics.alerts.push({
        severity: 'warning',
        message: `Email verification rate below target (${metrics.registration.verificationRate}%)`,
        metric: 'registration.verificationRate',
        value: metrics.registration.verificationRate,
        threshold: 80
      })
    }

    if (metrics.registration.onboardingCompletionRate < 50) {
      metrics.alerts.push({
        severity: 'warning',
        message: `Onboarding completion rate low (${metrics.registration.onboardingCompletionRate}%)`,
        metric: 'registration.onboardingCompletionRate',
        value: metrics.registration.onboardingCompletionRate,
        threshold: 50
      })
    }

    // Spam metrics
    metrics.spam.detectedLast24h = spamDetected24h
    metrics.spam.blockedLast24h = spamDetected24h // Same for now
    metrics.spam.failedLoginsLast24h = failedLogins24h
    metrics.spam.spamRate = registrations24h > 0
      ? parseFloat((spamDetected24h / registrations24h * 100).toFixed(1))
      : 0

    // Spam alerts
    if (metrics.spam.spamRate > 30) {
      metrics.alerts.push({
        severity: 'warning',
        message: `High spam rate detected (${metrics.spam.spamRate}%)`,
        metric: 'spam.spamRate',
        value: metrics.spam.spamRate,
        threshold: 30
      })
    }

    if (failedLogins24h > 50) {
      metrics.alerts.push({
        severity: 'warning',
        message: `Unusual number of failed login attempts (${failedLogins24h})`,
        metric: 'spam.failedLoginsLast24h',
        value: failedLogins24h,
        threshold: 50
      })
    }

    // Error metrics
    metrics.errors.last24h = systemErrors24h
    metrics.errors.last7d = systemErrors7d
    metrics.errors.critical = systemErrors24h // Treat all as critical for now

    // Error alerts
    if (systemErrors24h > 10) {
      metrics.alerts.push({
        severity: 'critical',
        message: `High number of system errors (${systemErrors24h} in last 24h)`,
        metric: 'errors.last24h',
        value: systemErrors24h,
        threshold: 10
      })
    } else if (systemErrors24h > 5) {
      metrics.alerts.push({
        severity: 'warning',
        message: `System errors detected (${systemErrors24h} in last 24h)`,
        metric: 'errors.last24h',
        value: systemErrors24h,
        threshold: 5
      })
    }

    // Overall health status
    const criticalAlerts = metrics.alerts.filter(a => a.severity === 'critical').length
    const warningAlerts = metrics.alerts.filter(a => a.severity === 'warning').length

    if (criticalAlerts > 0) {
      metrics.overall = 'critical'
    } else if (warningAlerts > 0) {
      metrics.overall = 'degraded'
    } else {
      metrics.overall = 'healthy'
      metrics.alerts.push({
        severity: 'info',
        message: 'All systems operational'
      })
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('[Health] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch health metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
