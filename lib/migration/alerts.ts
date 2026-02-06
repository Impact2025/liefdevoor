/**
 * Migration Campaign Alert System
 * Monitors health metrics and sends alerts when issues are detected
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'

export interface Alert {
  level: 'critical' | 'error' | 'warning' | 'info'
  type: string
  message: string
  action?: string
}

// Target conversion rates per segment
const SEGMENT_TARGETS: Record<string, number> = {
  VIP: 40,      // Target: 40% conversion
  GOLD: 35,     // Target: 35% conversion
  ACTIVE: 25    // Target: 25% conversion
}

/**
 * Check migration campaign health and generate alerts
 */
export async function checkMigrationHealth(): Promise<Alert[]> {
  const alerts: Alert[] = []

  try {
    // 1. Check overall conversion rate
    const conversionRate = await getOverallConversionRate()
    if (conversionRate < 5) {
      alerts.push({
        level: 'critical',
        type: 'low_conversion',
        message: `Conversion rate critically low: ${conversionRate}%`,
        action: 'Review email deliverability and subject lines'
      })
    }

    // 2. Check email open rate
    const openRate = await getEmailOpenRate()
    if (openRate < 15) {
      alerts.push({
        level: 'warning',
        type: 'low_open_rate',
        message: `Email open rate below target: ${openRate}%`,
        action: 'Check spam folder placement, test subject lines'
      })
    }

    // 3. Check for premium activation failures
    const missingPremium = await getMissingPremiumCount()
    if (missingPremium > 0) {
      alerts.push({
        level: 'error',
        type: 'premium_activation_failure',
        message: `${missingPremium} users claimed but missing premium`,
        action: 'Run premium activation fix script'
      })
    }

    // 4. Check webhook connectivity
    const lastWebhook = await getLastWebhookTimestamp()
    const hoursSinceWebhook = (Date.now() - lastWebhook) / (1000 * 60 * 60)
    if (hoursSinceWebhook > 1) {
      alerts.push({
        level: 'critical',
        type: 'webhook_down',
        message: `No webhooks received in ${hoursSinceWebhook.toFixed(1)} hours`,
        action: 'Check Resend webhook configuration'
      })
    }

    // 5. Segment-specific alerts
    for (const segment of ['VIP', 'GOLD', 'ACTIVE']) {
      const rate = await getSegmentConversionRate(segment)
      const target = SEGMENT_TARGETS[segment]

      if (rate < target * 0.5) {
        alerts.push({
          level: 'warning',
          type: 'segment_underperformance',
          message: `${segment} segment at ${rate.toFixed(1)}% (target: ${target}%)`,
          action: `Review ${segment} email content and incentives`
        })
      }
    }

    // Send alerts to admin if any critical/error alerts
    if (alerts.some(a => a.level === 'critical' || a.level === 'error')) {
      await notifyAdmins(alerts)
    }

    // Store alerts in database
    if (alerts.length > 0) {
      await storeAlerts(alerts)
    }

  } catch (error) {
    console.error('[Alerts] Error checking migration health:', error)
  }

  return alerts
}

/**
 * Get overall conversion rate (claims / emails sent)
 */
async function getOverallConversionRate(): Promise<number> {
  const result = await prisma.$queryRaw<{ emailsSent: bigint; claimed: bigint }[]>`
    SELECT
      (SELECT COUNT(*) FROM "MigrationUser" WHERE status::text IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED', 'CLAIMED', 'ACTIVATED')) as "emailsSent",
      (SELECT COUNT(*) FROM "MigrationUser" WHERE status::text IN ('CLAIMED', 'ACTIVATED')) as claimed
  `

  const emailsSent = Number(result[0]?.emailsSent || 0)
  const claimed = Number(result[0]?.claimed || 0)

  return emailsSent > 0 ? (claimed / emailsSent) * 100 : 0
}

/**
 * Get email open rate
 */
async function getEmailOpenRate(): Promise<number> {
  const result = await prisma.$queryRaw<{ sent: bigint; opened: bigint }[]>`
    SELECT
      COUNT(*) as sent,
      COUNT("openedAt") as opened
    FROM "MigrationEmail"
  `

  const sent = Number(result[0]?.sent || 0)
  const opened = Number(result[0]?.opened || 0)

  return sent > 0 ? (opened / sent) * 100 : 0
}

/**
 * Get count of users who claimed but don't have premium
 */
async function getMissingPremiumCount(): Promise<number> {
  const result = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM "MigrationUser" mu
    JOIN "User" u ON mu."newUserId" = u.id
    WHERE mu.status::text IN ('CLAIMED', 'ACTIVATED')
    AND u."subscriptionTier"::text != 'PREMIUM'
  `

  return Number(result[0]?.count || 0)
}

/**
 * Get timestamp of last webhook received
 */
async function getLastWebhookTimestamp(): Promise<number> {
  const result = await prisma.$queryRaw<{ lastWebhook: Date | null }[]>`
    SELECT MAX("openedAt") as "lastWebhook"
    FROM "MigrationEmail"
    WHERE "openedAt" IS NOT NULL
  `

  const lastWebhook = result[0]?.lastWebhook
  return lastWebhook ? new Date(lastWebhook).getTime() : Date.now() - (24 * 60 * 60 * 1000)
}

/**
 * Get conversion rate for specific segment
 */
async function getSegmentConversionRate(segment: string): Promise<number> {
  const result = await prisma.$queryRaw<{ sent: bigint; claimed: bigint }[]>`
    SELECT
      COUNT(*) as sent,
      SUM(CASE WHEN status::text IN ('CLAIMED', 'ACTIVATED') THEN 1 ELSE 0 END) as claimed
    FROM "MigrationUser"
    WHERE segment::text = ${segment}
    AND status::text != 'PENDING'
  `

  const sent = Number(result[0]?.sent || 0)
  const claimed = Number(result[0]?.claimed || 0)

  return sent > 0 ? (claimed / sent) * 100 : 0
}

/**
 * Notify admins via email
 */
async function notifyAdmins(alerts: Alert[]): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@liefdevooriedereen.nl'

  const criticalAlerts = alerts.filter(a => a.level === 'critical')
  const errorAlerts = alerts.filter(a => a.level === 'error')

  const html = `
    <h1>🚨 Migration Campaign Alert</h1>
    <p>Detected ${alerts.length} issues that require attention:</p>

    ${criticalAlerts.length > 0 ? `
      <h2 style="color: #dc2626;">Critical Issues:</h2>
      <ul>
        ${criticalAlerts.map(a => `
          <li>
            <strong>${a.message}</strong><br>
            <em>Action: ${a.action}</em>
          </li>
        `).join('')}
      </ul>
    ` : ''}

    ${errorAlerts.length > 0 ? `
      <h2 style="color: #ea580c;">Errors:</h2>
      <ul>
        ${errorAlerts.map(a => `
          <li>
            <strong>${a.message}</strong><br>
            <em>Action: ${a.action}</em>
          </li>
        `).join('')}
      </ul>
    ` : ''}

    <p>
      <a href="https://liefdevooriedereen.nl/admin/migration/dashboard">
        View Migration Dashboard →
      </a>
    </p>
  `

  await sendEmail({
    to: adminEmail,
    subject: `🚨 Migration Campaign Alert: ${alerts.length} issues detected`,
    html,
    text: alerts.map(a => `${a.severity}: ${a.message}`).join('\n'),
    category: 'admin'
  })
}

/**
 * Store alerts in database
 */
async function storeAlerts(alerts: Alert[]): Promise<void> {
  for (const alert of alerts) {
    await prisma.migrationAlert.create({
      data: {
        level: alert.level,
        type: alert.type,
        message: alert.message,
        action: alert.action,
        createdAt: new Date()
      }
    })
  }
}

/**
 * Get recent alerts
 */
export async function getRecentAlerts(hours: number = 24): Promise<Alert[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const alerts = await prisma.migrationAlert.findMany({
    where: {
      createdAt: { gte: since },
      resolvedAt: null
    },
    orderBy: { createdAt: 'desc' }
  })

  return alerts.map(a => ({
    level: a.level as Alert['level'],
    type: a.type,
    message: a.message,
    action: a.action || undefined
  }))
}
