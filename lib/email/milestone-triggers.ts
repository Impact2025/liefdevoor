/**
 * Milestone Triggers - Automatically detect and send milestone emails
 *
 * Call these functions after relevant actions to check if a milestone was reached
 */

import { prisma } from '@/lib/prisma'
import { checkAndSendMilestoneEmail } from '@/lib/cron/engagement-engine'

/**
 * Check match milestones after a new match is created
 */
export async function checkMatchMilestones(userId: string): Promise<void> {
  try {
    const matchCount = await prisma.match.count({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    })

    // Check specific milestones
    if (matchCount === 1) {
      await checkAndSendMilestoneEmail(userId, 'first_match')
    } else if (matchCount === 5) {
      await checkAndSendMilestoneEmail(userId, 'five_matches')
    } else if (matchCount === 10) {
      await checkAndSendMilestoneEmail(userId, 'ten_matches')
    } else if (matchCount === 25) {
      await checkAndSendMilestoneEmail(userId, 'twentyfive_matches')
    } else if (matchCount === 50) {
      await checkAndSendMilestoneEmail(userId, 'fifty_matches')
    }
  } catch (error) {
    console.error('[Milestone] Error checking match milestones:', error)
  }
}

/**
 * Check message milestones after sending a message
 */
export async function checkMessageMilestones(userId: string): Promise<void> {
  try {
    const messageCount = await prisma.message.count({
      where: { senderId: userId },
    })

    if (messageCount === 1) {
      await checkAndSendMilestoneEmail(userId, 'first_message_sent')
    }
  } catch (error) {
    console.error('[Milestone] Error checking message milestones:', error)
  }
}

/**
 * Check message received milestone
 */
export async function checkMessageReceivedMilestone(userId: string): Promise<void> {
  try {
    // Check if this is the first message ever received
    const receivedCount = await prisma.message.count({
      where: {
        match: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        senderId: { not: userId },
      },
    })

    if (receivedCount === 1) {
      await checkAndSendMilestoneEmail(userId, 'first_message_received')
    }
  } catch (error) {
    console.error('[Milestone] Error checking message received milestone:', error)
  }
}

/**
 * Check profile completion milestone
 */
export async function checkProfileCompleteMilestone(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileComplete: true,
        name: true,
        bio: true,
        birthDate: true,
        gender: true,
        city: true,
        profileImage: true,
        photos: { select: { id: true } },
      },
    })

    if (!user) return

    // Check if profile is now complete
    const hasAllRequired =
      user.name &&
      user.bio &&
      user.birthDate &&
      user.gender &&
      user.city &&
      user.profileImage

    if (hasAllRequired && !user.profileComplete) {
      // Update profile complete status
      await prisma.user.update({
        where: { id: userId },
        data: { profileComplete: true },
      })

      await checkAndSendMilestoneEmail(userId, 'profile_complete')
    }
  } catch (error) {
    console.error('[Milestone] Error checking profile complete milestone:', error)
  }
}

/**
 * Check Super Like received milestone
 */
export async function checkSuperLikeMilestone(userId: string): Promise<void> {
  try {
    const superLikeCount = await prisma.swipe.count({
      where: {
        swipedId: userId,
        isSuperLike: true,
      },
    })

    if (superLikeCount === 1) {
      await checkAndSendMilestoneEmail(userId, 'first_super_like')
    }
  } catch (error) {
    console.error('[Milestone] Error checking super like milestone:', error)
  }
}

/**
 * Check verification milestone
 */
export async function checkVerificationMilestone(userId: string): Promise<void> {
  try {
    await checkAndSendMilestoneEmail(userId, 'verified_profile')
  } catch (error) {
    console.error('[Milestone] Error checking verification milestone:', error)
  }
}

/**
 * Check activity milestones (call daily via cron)
 */
export async function checkActivityMilestones(): Promise<{
  oneWeek: number
  oneMonth: number
}> {
  let oneWeek = 0
  let oneMonth = 0

  try {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Users who joined exactly 7 days ago (within 24 hour window)
    const oneWeekUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(oneWeekAgo.getTime() - 24 * 60 * 60 * 1000),
          lte: oneWeekAgo,
        },
        isOnboarded: true,
        marketingEmailsConsent: true,
      },
      select: { id: true },
    })

    for (const user of oneWeekUsers) {
      const sent = await checkAndSendMilestoneEmail(user.id, 'one_week_active')
      if (sent) oneWeek++
    }

    // Users who joined exactly 30 days ago (within 24 hour window)
    const oneMonthUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(oneMonthAgo.getTime() - 24 * 60 * 60 * 1000),
          lte: oneMonthAgo,
        },
        isOnboarded: true,
        marketingEmailsConsent: true,
      },
      select: { id: true },
    })

    for (const user of oneMonthUsers) {
      const sent = await checkAndSendMilestoneEmail(user.id, 'one_month_active')
      if (sent) oneMonth++
    }
  } catch (error) {
    console.error('[Milestone] Error checking activity milestones:', error)
  }

  return { oneWeek, oneMonth }
}
