/**
 * Email Notification Service - Central Hub
 *
 * Handles sending all types of transactional emails
 */

import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { sendEmail } from './send'

// Email Templates
import MatchNotificationEmail from './templates/transactional/match-notification'
import MessageNotificationEmail from './templates/transactional/message-notification'
import PasswordResetEmail from './templates/transactional/password-reset'
import PaymentConfirmationEmail from './templates/transactional/payment-confirmation'
import SubscriptionRenewedEmail from './templates/transactional/subscription-renewed'
import PaymentFailedEmail from './templates/transactional/payment-failed'
import SubscriptionExpiringEmail from './templates/transactional/subscription-expiring'
import SubscriptionExpiredEmail from './templates/transactional/subscription-expired'

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Get default avatar URL based on name
 */
function getDefaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff`
}

/**
 * Get base URL for the application
 */
function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3004'
}

/**
 * Send Match Notification Email
 *
 * Sent when two users match
 */
export async function sendMatchNotification(params: {
  userId: string
  matchUserId: string
  matchId: string
}) {
  try {
    console.log(`[Email] Sending match notification to user ${params.userId}`)

    // Get user details
    const [user, matchUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true
        }
      }),
      prisma.user.findUnique({
        where: { id: params.matchUserId },
        select: {
          id: true,
          name: true,
          birthDate: true,
          profileImage: true,
          city: true,
          bio: true
        }
      })
    ])

    if (!user || !user.email || !user.emailVerified) {
      console.log(`[Email] User ${params.userId} has no verified email`)
      return
    }

    if (!matchUser) {
      console.log(`[Email] Match user ${params.matchUserId} not found`)
      return
    }

    // Render email template
    const html = await render(
      MatchNotificationEmail({
        userName: user.name || 'daar',
        matchName: matchUser.name || 'Someone special',
        matchAge: matchUser.birthDate ? calculateAge(matchUser.birthDate) : 25,
        matchPhoto: matchUser.profileImage || getDefaultAvatar(matchUser.name || 'User'),
        matchCity: matchUser.city || 'Nederland',
        matchBio: matchUser.bio || undefined,
        chatUrl: `${getBaseUrl()}/matches/${params.matchId}`
      })
    )

    const text = `
Het is een Match!

${matchUser.name || 'Someone'} vindt jou ook leuk!

${matchUser.bio ? `"${matchUser.bio}"` : ''}

Begin met chatten: ${getBaseUrl()}/matches/${params.matchId}

Veel succes!

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    // Send email
    await sendEmail({
      to: user.email,
      subject: `Nieuwe match: ${matchUser.name || 'Someone'} vindt jou ook leuk`,
      html,
      text
    })

    console.log(`[Email] ✅ Match notification sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send match notification:', error)
    throw error
  }
}

/**
 * Send New Message Notification Email
 *
 * Sent when user receives a new message
 */
export async function sendMessageNotification(params: {
  userId: string
  senderId: string
  messageId: string
  messageContent: string
  matchId: string
}) {
  try {
    console.log(`[Email] Sending message notification to user ${params.userId}`)

    // Get user details
    const [user, sender] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true
        }
      }),
      prisma.user.findUnique({
        where: { id: params.senderId },
        select: {
          id: true,
          name: true,
          birthDate: true,
          profileImage: true
        }
      })
    ])

    if (!user || !user.email || !user.emailVerified) {
      console.log(`[Email] User ${params.userId} has no verified email`)
      return
    }

    if (!sender) {
      console.log(`[Email] Sender ${params.senderId} not found`)
      return
    }

    // Get unread count for this match
    const unreadCount = await prisma.message.count({
      where: {
        matchId: params.matchId,
        senderId: params.senderId,
        read: false
      }
    })

    // Truncate message preview
    const messagePreview = params.messageContent.length > 100
      ? params.messageContent.substring(0, 100) + '...'
      : params.messageContent

    // Render email template
    const html = await render(
      MessageNotificationEmail({
        userName: user.name || 'daar',
        senderName: sender.name || 'Someone',
        senderAge: sender.birthDate ? calculateAge(sender.birthDate) : 25,
        senderPhoto: sender.profileImage || getDefaultAvatar(sender.name || 'User'),
        messagePreview,
        replyUrl: `${getBaseUrl()}/matches/${params.matchId}`,
        unreadCount
      })
    )

    const text = `
Nieuw Bericht!

${sender.name || 'Someone'} heeft je een bericht gestuurd:

"${messagePreview}"

Antwoord nu: ${getBaseUrl()}/matches/${params.matchId}

Veel plezier met chatten!

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    // Send email
    await sendEmail({
      to: user.email,
      subject: `Nieuw bericht van ${sender.name || 'Someone'}`,
      html,
      text
    })

    console.log(`[Email] ✅ Message notification sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send message notification:', error)
    throw error
  }
}

/**
 * Send Password Reset Email
 *
 * Sent when user requests password reset
 */
export async function sendPasswordResetEmail(params: {
  email: string
  resetToken: string
  expiresIn?: string
}) {
  try {
    console.log(`[Email] Sending password reset to ${params.email}`)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: params.email },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!user) {
      console.log(`[Email] User with email ${params.email} not found`)
      // Don't reveal if email exists or not (security)
      return
    }

    const resetUrl = `${getBaseUrl()}/reset-password?token=${params.resetToken}`

    // Render email template
    const html = await render(
      PasswordResetEmail({
        userName: user.name || 'daar',
        resetUrl,
        expiresIn: params.expiresIn || '1 uur'
      })
    )

    const text = `
Wachtwoord Resetten

Hoi ${user.name || 'daar'},

Je hebt gevraagd om je wachtwoord te resetten.

Klik op deze link om een nieuw wachtwoord in te stellen:
${resetUrl}

Deze link vervalt over ${params.expiresIn || '1 uur'}.

Heb je deze reset NIET aangevraagd? Negeer deze email dan.

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    // Send email
    await sendEmail({
      to: user.email!,
      subject: 'Wachtwoord herstellen - Liefde Voor Iedereen',
      html,
      text
    })

    console.log(`[Email] ✅ Password reset email sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error)
    throw error
  }
}

/**
 * Send Payment Confirmation Email
 *
 * Sent immediately after successful subscription payment
 */
export async function sendPaymentConfirmationEmail(params: {
  userId: string
  planName: string
  amount: number
  transactionId: string
  renewalDate?: Date
}) {
  try {
    console.log(`[Email] Sending payment confirmation to user ${params.userId}`)

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user || !user.email || !user.emailVerified) {
      console.log(`[Email] User ${params.userId} has no verified email`)
      return
    }

    // Format renewal date
    const renewalDateStr = params.renewalDate
      ? new Intl.DateTimeFormat('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(params.renewalDate)
      : undefined

    // Render email template
    const html = await render(
      PaymentConfirmationEmail({
        userName: user.name || 'daar',
        planName: params.planName,
        amount: `€${params.amount.toFixed(2)}`,
        transactionId: params.transactionId,
        renewalDate: renewalDateStr,
        discoverUrl: `${getBaseUrl()}/discover`
      })
    )

    const text = `
Betaling gelukt!

Hoi ${user.name || 'daar'},

Bedankt voor je aankoop! Je ${params.planName} abonnement is nu actief.

Bedrag: €${params.amount.toFixed(2)}
Transactie ID: ${params.transactionId}
${renewalDateStr ? `Verlengt op: ${renewalDateStr}` : ''}

Begin met daten: ${getBaseUrl()}/discover

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    await sendEmail({
      to: user.email,
      subject: '🎉 Betaling gelukt - Je premium abonnement is actief!',
      html,
      text
    })

    console.log(`[Email] ✅ Payment confirmation sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send payment confirmation:', error)
    throw error
  }
}

/**
 * Send Subscription Renewed Email
 *
 * Sent after successful automatic renewal
 */
export async function sendSubscriptionRenewedEmail(params: {
  userId: string
  planName: string
  amount: number
  nextRenewalDate: Date
}) {
  try {
    console.log(`[Email] Sending subscription renewed to user ${params.userId}`)

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user || !user.email || !user.emailVerified) {
      console.log(`[Email] User ${params.userId} has no verified email`)
      return
    }

    // Format next renewal date
    const nextRenewalDateStr = new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(params.nextRenewalDate)

    // Render email template
    const html = await render(
      SubscriptionRenewedEmail({
        userName: user.name || 'daar',
        planName: params.planName,
        amount: `€${params.amount.toFixed(2)}`,
        nextRenewalDate: nextRenewalDateStr,
        manageUrl: `${getBaseUrl()}/settings/subscription`
      })
    )

    const text = `
Abonnement Verlengd

Hoi ${user.name || 'daar'},

Je ${params.planName} abonnement is automatisch verlengd voor een nieuwe maand.

Bedrag: €${params.amount.toFixed(2)}
Volgende verlenging: ${nextRenewalDateStr}

Abonnement beheren: ${getBaseUrl()}/settings/subscription

Bedankt dat je lid blijft! ❤️

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    await sendEmail({
      to: user.email,
      subject: '✅ Abonnement verlengd - Liefde Voor Iedereen',
      html,
      text
    })

    console.log(`[Email] ✅ Subscription renewed email sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send subscription renewed email:', error)
    throw error
  }
}

/**
 * Send Payment Failed Email
 *
 * Sent when automatic renewal payment fails
 */
export async function sendPaymentFailedEmail(params: {
  userId: string
  planName: string
  amount: number
  reason?: string
}) {
  try {
    console.log(`[Email] Sending payment failed to user ${params.userId}`)

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user || !user.email || !user.emailVerified) {
      console.log(`[Email] User ${params.userId} has no verified email`)
      return
    }

    // Render email template
    const html = await render(
      PaymentFailedEmail({
        userName: user.name || 'daar',
        planName: params.planName,
        amount: `€${params.amount.toFixed(2)}`,
        reason: params.reason || 'Betaling kon niet worden verwerkt',
        updateUrl: `${getBaseUrl()}/settings/subscription`
      })
    )

    const text = `
Betaling Mislukt

Hoi ${user.name || 'daar'},

Helaas is de automatische verlenging van je ${params.planName} abonnement (€${params.amount.toFixed(2)}) mislukt.

Reden: ${params.reason || 'Betaling kon niet worden verwerkt'}

Werk je betaalmethode bij: ${getBaseUrl()}/settings/subscription

Je hebt nog 7 dagen om je betaalgegevens bij te werken.

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    await sendEmail({
      to: user.email,
      subject: '⚠️ Betaling mislukt - Actie vereist',
      html,
      text
    })

    console.log(`[Email] ✅ Payment failed email sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send payment failed email:', error)
    throw error
  }
}

/**
 * Send Subscription Expiring Email
 *
 * Sent 7 days before subscription expires
 */
export async function sendSubscriptionExpiringEmail(params: {
  userId: string
  planName: string
  expiryDate: Date
  daysRemaining: number
}) {
  try {
    console.log(`[Email] Sending subscription expiring to user ${params.userId}`)

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user || !user.email || !user.emailVerified) {
      console.log(`[Email] User ${params.userId} has no verified email`)
      return
    }

    // Format expiry date
    const expiryDateStr = new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(params.expiryDate)

    // Render email template
    const html = await render(
      SubscriptionExpiringEmail({
        userName: user.name || 'daar',
        planName: params.planName,
        expiryDate: expiryDateStr,
        daysRemaining: params.daysRemaining,
        renewUrl: `${getBaseUrl()}/subscription`
      })
    )

    const text = `
Je abonnement verloopt binnenkort

Hoi ${user.name || 'daar'},

Je ${params.planName} abonnement verloopt over ${params.daysRemaining} dagen (op ${expiryDateStr}).

Verleng nu om je premium functies te behouden:
${getBaseUrl()}/subscription

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    await sendEmail({
      to: user.email,
      subject: `⏰ Je abonnement verloopt over ${params.daysRemaining} dagen`,
      html,
      text
    })

    console.log(`[Email] ✅ Subscription expiring email sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send subscription expiring email:', error)
    throw error
  }
}

/**
 * Send Subscription Expired Email
 *
 * Sent when subscription has expired
 */
export async function sendSubscriptionExpiredEmail(params: {
  userId: string
  planName: string
  expiredDate: Date
}) {
  try {
    console.log(`[Email] Sending subscription expired to user ${params.userId}`)

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user || !user.email || !user.emailVerified) {
      console.log(`[Email] User ${params.userId} has no verified email`)
      return
    }

    // Format expired date
    const expiredDateStr = new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(params.expiredDate)

    // Render email template
    const html = await render(
      SubscriptionExpiredEmail({
        userName: user.name || 'daar',
        planName: params.planName,
        expiredDate: expiredDateStr,
        renewUrl: `${getBaseUrl()}/subscription`
      })
    )

    const text = `
Je abonnement is verlopen

Hoi ${user.name || 'daar'},

Je ${params.planName} abonnement is op ${expiredDateStr} verlopen.

Je account is teruggezet naar het gratis plan, maar al je matches blijven behouden!

Kom terug en activeer premium opnieuw:
${getBaseUrl()}/subscription

We missen je! ❤️

Met liefde,
Het Liefde Voor Iedereen Team
    `.trim()

    await sendEmail({
      to: user.email,
      subject: 'Je abonnement is verlopen - Kom terug! 💕',
      html,
      text
    })

    console.log(`[Email] ✅ Subscription expired email sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send subscription expired email:', error)
    throw error
  }
}
