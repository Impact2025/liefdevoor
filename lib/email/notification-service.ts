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
      subject: `💖 Het is een Match! ${matchUser.name || 'Someone'} vindt jou ook leuk!`,
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
      subject: `💬 ${sender.name || 'Someone'} heeft je een bericht gestuurd`,
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
      subject: '🔐 Reset je wachtwoord - Liefde Voor Iedereen',
      html,
      text
    })

    console.log(`[Email] ✅ Password reset email sent to ${user.email}`)
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error)
    throw error
  }
}
