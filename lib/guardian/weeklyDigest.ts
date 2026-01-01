/**
 * Weekly Digest for Guardians (Begeleiders)
 *
 * Stuurt wekelijks een samenvatting naar begeleiders met:
 * - Aantal nieuwe matches
 * - Aantal gesprekken
 * - Veiligheidswaarschuwingen (geen inhoud!)
 * - Algemene activiteit niveau
 *
 * Privacy-first: Begeleider ziet NOOIT chatinhoud
 */

import { prisma } from '@/lib/prisma'
import { sendGuardianWeeklyDigest, sendGuardianSafetyAlert } from '@/lib/email/guardian-emails'

interface UserDigestData {
  userId: string
  userName: string
  guardianEmail: string
  guardianName: string
  weekData: {
    newMatchesCount: number
    conversationsCount: number
    messagesReceivedCount: number
    safetyFlagsCount: number
    lastActiveAt: Date | null
    activityLevel: 'low' | 'medium' | 'high'
  }
}

/**
 * Get digest data for a single user
 */
async function getUserDigestData(userId: string): Promise<UserDigestData | null> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Get user with guardian info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      guardianEmail: true,
      guardianName: true,
      guardianEnabled: true,
      guardianConfirmed: true,
      lastSeen: true,
    },
  })

  if (!user || !user.guardianEnabled || !user.guardianConfirmed || !user.guardianEmail) {
    return null
  }

  // Count new matches this week
  const newMatchesCount = await prisma.match.count({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      createdAt: { gte: weekAgo },
    },
  })

  // Count unique conversations (matches with messages)
  const conversationsCount = await prisma.match.count({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      messages: {
        some: {
          createdAt: { gte: weekAgo },
        },
      },
    },
  })

  // Count messages received
  const messagesReceivedCount = await prisma.message.count({
    where: {
      match: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      senderId: { not: userId },
      createdAt: { gte: weekAgo },
    },
  })

  // Count safety flags
  const safetyFlagsCount = await prisma.guardianAlert.count({
    where: {
      userId,
      type: 'SAFETY_FLAG',
      createdAt: { gte: weekAgo },
    },
  })

  // Calculate activity level
  let activityLevel: 'low' | 'medium' | 'high' = 'low'
  const totalActivity = newMatchesCount + conversationsCount + messagesReceivedCount
  if (totalActivity > 20) activityLevel = 'high'
  else if (totalActivity > 5) activityLevel = 'medium'

  return {
    userId: user.id,
    userName: user.name || 'Onbekend',
    guardianEmail: user.guardianEmail,
    guardianName: user.guardianName || 'Begeleider',
    weekData: {
      newMatchesCount,
      conversationsCount,
      messagesReceivedCount,
      safetyFlagsCount,
      lastActiveAt: user.lastSeen,
      activityLevel,
    },
  }
}

/**
 * Get all users who need a weekly digest
 */
export async function getUsersForWeeklyDigest(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      lvbMode: true,
      guardianEnabled: true,
      guardianConfirmed: true,
      guardianEmail: { not: null },
    },
    select: { id: true },
  })

  return users.map((u) => u.id)
}

/**
 * Send weekly digest for a single user
 */
export async function sendUserWeeklyDigest(userId: string): Promise<boolean> {
  try {
    const digestData = await getUserDigestData(userId)

    if (!digestData) {
      console.log(`[Guardian Digest] Skipping user ${userId} - no guardian configured`)
      return false
    }

    // Send the email
    await sendGuardianWeeklyDigest(digestData)

    // Log that we sent the digest
    await prisma.guardianAlert.create({
      data: {
        userId,
        type: 'WEEKLY_SUMMARY',
        content: {
          sentAt: new Date().toISOString(),
          newMatches: digestData.weekData.newMatchesCount,
          conversations: digestData.weekData.conversationsCount,
          safetyFlags: digestData.weekData.safetyFlagsCount,
        },
        sentAt: new Date(),
      },
    })

    // Update last notified timestamp
    await prisma.user.update({
      where: { id: userId },
      data: { guardianLastNotified: new Date() },
    })

    console.log(`[Guardian Digest] Sent weekly digest for user ${userId} to ${digestData.guardianEmail}`)
    return true
  } catch (error) {
    console.error(`[Guardian Digest] Failed to send digest for user ${userId}:`, error)
    return false
  }
}

/**
 * Send all weekly digests
 * Called by cron job every week (Sunday evening)
 */
export async function sendAllWeeklyDigests(): Promise<{
  total: number
  sent: number
  failed: number
}> {
  const userIds = await getUsersForWeeklyDigest()
  let sent = 0
  let failed = 0

  console.log(`[Guardian Digest] Starting weekly digest for ${userIds.length} users`)

  for (const userId of userIds) {
    const success = await sendUserWeeklyDigest(userId)
    if (success) {
      sent++
    } else {
      failed++
    }

    // Rate limit: 1 email per 100ms to avoid overwhelming email service
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(`[Guardian Digest] Completed: ${sent} sent, ${failed} failed`)

  return {
    total: userIds.length,
    sent,
    failed,
  }
}

/**
 * Send immediate safety alert to guardian
 * Called when a critical safety flag is detected
 */
export async function sendImmediateSafetyAlert(
  userId: string,
  alertType: 'iban_shared' | 'phone_shared' | 'scam_detected'
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        guardianEmail: true,
        guardianName: true,
        guardianEnabled: true,
        guardianConfirmed: true,
      },
    })

    if (!user?.guardianEnabled || !user?.guardianConfirmed || !user?.guardianEmail) {
      return false
    }

    await sendGuardianSafetyAlert({
      userId,
      userName: user.name || 'Onbekend',
      guardianEmail: user.guardianEmail,
      guardianName: user.guardianName || 'Begeleider',
      alertType,
    })

    // Log the alert
    await prisma.guardianAlert.create({
      data: {
        userId,
        type: 'SAFETY_FLAG',
        content: {
          alertType,
          sentAt: new Date().toISOString(),
        },
        sentAt: new Date(),
      },
    })

    return true
  } catch (error) {
    console.error(`[Guardian Alert] Failed to send safety alert for user ${userId}:`, error)
    return false
  }
}

export default sendAllWeeklyDigests
