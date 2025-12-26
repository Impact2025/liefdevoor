/**
 * Admin Notification Service
 *
 * Centralized service for sending admin email notifications
 * Handles all admin alerts: payments, registrations, safety, support
 */

import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { sendEmail } from './send'

// Admin Email Templates
import NewPaymentAdminEmail from './templates/admin/new-payment'
import NewRegistrationAdminEmail from './templates/admin/new-registration'
import SafetyAlertAdminEmail from './templates/admin/safety-alert'
import PaymentFailedAdminEmail from './templates/admin/payment-failed-admin'
import { sendNewTicketToAdminEmail, sendNewTicketReplyToAdminEmail } from './helpdesk-templates'

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

/**
 * Get base URL for links
 */
function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3004'
}

/**
 * Send New Payment Alert to Admins
 *
 * Sent immediately when a payment is successfully processed
 */
export async function sendNewPaymentAdminAlert(params: {
  userId: string
  planName: string
  amount: number
  transactionId: string
  isNewCustomer?: boolean
}) {
  try {
    console.log(`[Admin Alert] Sending new payment notification for user ${params.userId}`)

    const adminEmails = await getAdminEmails()
    if (adminEmails.length === 0) {
      console.warn('[Admin Alert] No admin emails configured')
      return
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        name: true,
        email: true,
        createdAt: true
      }
    })

    if (!user) {
      console.error(`[Admin Alert] User ${params.userId} not found`)
      return
    }

    // Determine if new customer (registered < 1 hour ago)
    const isNewCustomer = params.isNewCustomer ??
      (Date.now() - user.createdAt.getTime() < 60 * 60 * 1000)

    // Render email template
    const html = await render(
      NewPaymentAdminEmail({
        userName: user.name || 'Unknown',
        userEmail: user.email!,
        userId: params.userId,
        planName: params.planName,
        amount: params.amount,
        transactionId: params.transactionId,
        paymentDate: new Date(),
        isNewCustomer
      })
    )

    // Send to all admins
    await Promise.all(
      adminEmails.map(email =>
        sendEmail({
          to: email,
          subject: `💰 Nieuwe Betaling: €${params.amount.toFixed(2)} - ${params.planName}${isNewCustomer ? ' (NIEUWE KLANT!)' : ''}`,
          html,
          text: `Nieuwe betaling ontvangen: ${user.name || 'Unknown'} (${user.email}) heeft €${params.amount.toFixed(2)} betaald voor ${params.planName}.${isNewCustomer ? ' NIEUWE KLANT!' : ''}`
        })
      )
    )

    console.log(`[Admin Alert] ✅ Payment notification sent to ${adminEmails.length} admins`)
  } catch (error) {
    console.error('[Admin Alert] Failed to send payment notification:', error)
    // Don't throw - admin notifications should never block user flow
  }
}

/**
 * Send New Registration Alert to Admins
 */
export async function sendNewRegistrationAdminAlert(params: {
  userId: string
}) {
  try {
    console.log(`[Admin Alert] Sending new registration notification for user ${params.userId}`)

    const adminEmails = await getAdminEmails()
    if (adminEmails.length === 0) return

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        name: true,
        email: true,
        gender: true,
        birthDate: true,
        city: true,
        createdAt: true
      }
    })

    if (!user) return

    const age = user.birthDate
      ? new Date().getFullYear() - new Date(user.birthDate).getFullYear()
      : 0

    const html = await render(
      NewRegistrationAdminEmail({
        userName: user.name || 'Unknown',
        userEmail: user.email!,
        userId: params.userId,
        gender: user.gender || 'Unknown',
        age,
        city: user.city || 'Unknown',
        registrationDate: user.createdAt
      })
    )

    await Promise.all(
      adminEmails.map(email =>
        sendEmail({
          to: email,
          subject: `👤 Nieuwe Registratie: ${user.name || 'Unknown User'}`,
          html,
          text: `Nieuwe gebruiker geregistreerd: ${user.name || 'Unknown'} (${user.email}), ${user.gender || 'Unknown'}, ${age} jaar, ${user.city || 'Unknown'}`
        })
      )
    )

    console.log(`[Admin Alert] ✅ Registration notification sent to ${adminEmails.length} admins`)
  } catch (error) {
    console.error('[Admin Alert] Failed to send registration notification:', error)
  }
}

/**
 * Send Safety Alert to Admins
 *
 * Sent when a user receives 3+ reports (URGENT)
 */
export async function sendSafetyAlertToAdmins(params: {
  reportedUserId: string
  reportCount: number
}) {
  try {
    console.log(`[Admin Alert] Sending safety alert for user ${params.reportedUserId} (${params.reportCount} reports)`)

    const adminEmails = await getAdminEmails()
    if (adminEmails.length === 0) return

    // Get reported user details
    const user = await prisma.user.findUnique({
      where: { id: params.reportedUserId },
      select: { name: true }
    })

    if (!user) return

    // Get report reasons
    const reports = await prisma.report.findMany({
      where: {
        reportedId: params.reportedUserId,
        status: 'pending'
      },
      select: {
        reason: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const reasons = Array.from(new Set(reports.map(r => r.reason)))
    const latestReportDate = reports[0]?.createdAt || new Date()

    const html = await render(
      SafetyAlertAdminEmail({
        reportedUserName: user.name || 'Unknown',
        reportedUserId: params.reportedUserId,
        reportCount: params.reportCount,
        reasons,
        latestReportDate
      })
    )

    await Promise.all(
      adminEmails.map(email =>
        sendEmail({
          to: email,
          subject: `🚨 URGENT SAFETY ALERT: ${params.reportCount}+ Reports - ${user.name || 'User'}`,
          html,
          text: `URGENT: ${user.name || 'User'} heeft ${params.reportCount} reports ontvangen. Redenen: ${reasons.join(', ')}. Onmiddellijke actie vereist.`
        })
      )
    )

    console.log(`[Admin Alert] ✅ Safety alert sent to ${adminEmails.length} admins`)
  } catch (error) {
    console.error('[Admin Alert] Failed to send safety alert:', error)
  }
}

/**
 * Send Payment Failed Alert to Admins
 */
export async function sendPaymentFailedAdminAlert(params: {
  userId: string
  planName: string
  amount: number
  reason?: string
}) {
  try {
    console.log(`[Admin Alert] Sending payment failed notification for user ${params.userId}`)

    const adminEmails = await getAdminEmails()
    if (adminEmails.length === 0) return

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { name: true, email: true }
    })

    if (!user) return

    const html = await render(
      PaymentFailedAdminEmail({
        userName: user.name || 'Unknown',
        userEmail: user.email!,
        userId: params.userId,
        planName: params.planName,
        amount: params.amount,
        reason: params.reason || 'Unknown',
        failedDate: new Date()
      })
    )

    await Promise.all(
      adminEmails.map(email =>
        sendEmail({
          to: email,
          subject: `⚠️ Betaling Mislukt: ${user.name || 'User'} - €${params.amount.toFixed(2)}`,
          html,
          text: `Betaling mislukt: ${user.name || 'Unknown'} (${user.email}) - €${params.amount.toFixed(2)} voor ${params.planName}. Reden: ${params.reason || 'Unknown'}`
        })
      )
    )

    console.log(`[Admin Alert] ✅ Payment failed notification sent to ${adminEmails.length} admins`)
  } catch (error) {
    console.error('[Admin Alert] Failed to send payment failed notification:', error)
  }
}

/**
 * Send Support Ticket Alert to Admins
 *
 * Uses existing helpdesk template
 */
export async function sendNewTicketAdminAlert(params: {
  ticketId: string
  subject: string
  category: string
  userName: string
}) {
  try {
    console.log(`[Admin Alert] Sending new ticket notification for ticket ${params.ticketId}`)

    const adminEmails = await getAdminEmails()
    if (adminEmails.length === 0) return

    // Send to each admin using existing template
    await Promise.all(
      adminEmails.map(email =>
        sendNewTicketToAdminEmail({
          to: email,
          adminName: 'Admin',
          ticketId: params.ticketId,
          subject: params.subject,
          category: params.category,
          userName: params.userName
        })
      )
    )

    console.log(`[Admin Alert] ✅ Ticket notification sent to ${adminEmails.length} admins`)
  } catch (error) {
    console.error('[Admin Alert] Failed to send ticket notification:', error)
  }
}

/**
 * Send Ticket Reply Alert to Admins
 *
 * Uses existing helpdesk template
 */
export async function sendTicketReplyAdminAlert(params: {
  ticketId: string
  subject: string
  replyMessage: string
  userName: string
}) {
  try {
    console.log(`[Admin Alert] Sending ticket reply notification for ticket ${params.ticketId}`)

    const adminEmails = await getAdminEmails()
    if (adminEmails.length === 0) return

    await Promise.all(
      adminEmails.map(email =>
        sendNewTicketReplyToAdminEmail({
          to: email,
          adminName: 'Admin',
          ticketId: params.ticketId,
          subject: params.subject,
          replyMessage: params.replyMessage,
          userName: params.userName
        })
      )
    )

    console.log(`[Admin Alert] ✅ Ticket reply notification sent to ${adminEmails.length} admins`)
  } catch (error) {
    console.error('[Admin Alert] Failed to send ticket reply notification:', error)
  }
}
