/**
 * Growing Compatibility Score
 *
 * Tracks milestones in a match relationship and updates the compatibility score
 * Score grows as users interact more and hit milestones
 */

import { prisma } from '@/lib/prisma'

// Milestone definitions with score bonuses
export const MILESTONES = {
  // Message milestones
  first_message: { bonus: 2, label: 'Eerste bericht' },
  messages_10: { bonus: 3, label: '10 berichten' },
  messages_50: { bonus: 5, label: '50 berichten' },
  messages_100: { bonus: 5, label: '100 berichten' },

  // Engagement milestones
  voice_note_sent: { bonus: 5, label: 'Voice note gedeeld' },
  voice_note_received: { bonus: 2, label: 'Voice note ontvangen' },
  gif_exchanged: { bonus: 1, label: 'GIF gedeeld' },
  image_shared: { bonus: 3, label: 'Foto gedeeld' },

  // Vibe Check milestones
  vibe_check_started: { bonus: 2, label: 'Vibe Check gestart' },
  vibe_check_completed: { bonus: 5, label: 'Vibe Check voltooid' },
  both_want_date: { bonus: 10, label: 'Match wil date!' },

  // Real-world milestones
  phone_number_shared: { bonus: 8, label: 'Nummer gedeeld' },
  date_planned: { bonus: 10, label: 'Date gepland' },
  date_confirmed: { bonus: 5, label: 'Date bevestigd' },

  // Time-based milestones
  active_7_days: { bonus: 3, label: '7 dagen actief' },
  active_30_days: { bonus: 5, label: '30 dagen actief' },
} as const

export type MilestoneKey = keyof typeof MILESTONES

export interface MatchMilestones {
  [key: string]: string | boolean | number // milestone key -> timestamp or count
}

export interface JourneyProgress {
  currentScore: number
  initialScore: number
  growth: number
  growthPercentage: number
  milestones: {
    key: MilestoneKey
    label: string
    achieved: boolean
    achievedAt?: string
    bonus: number
  }[]
  nextMilestone?: {
    key: MilestoneKey
    label: string
    bonus: number
    progress?: number // 0-100 percentage towards milestone
  }
}

/**
 * Record a milestone for a match
 */
export async function recordMilestone(
  matchId: string,
  milestone: MilestoneKey,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; newScore?: number; milestone?: string }> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        initialCompatibility: true,
        currentCompatibility: true,
        milestones: true,
      },
    })

    if (!match) {
      return { success: false }
    }

    const currentMilestones = (match.milestones as MatchMilestones) || {}

    // Check if milestone already achieved
    if (currentMilestones[milestone]) {
      return { success: true, newScore: match.currentCompatibility || 0 }
    }

    // Record milestone
    const now = new Date().toISOString()
    const milestoneValue = metadata?.count ? Number(metadata.count) : now
    const updatedMilestones: MatchMilestones = {
      ...currentMilestones,
      [milestone]: milestoneValue,
    }

    // Calculate new score
    const milestoneBonus = MILESTONES[milestone].bonus
    const baseScore = match.initialCompatibility || 50
    const currentScore = match.currentCompatibility || baseScore

    // Cap at 100
    const newScore = Math.min(100, currentScore + milestoneBonus)

    // Update match
    await prisma.match.update({
      where: { id: matchId },
      data: {
        currentCompatibility: newScore,
        milestones: updatedMilestones,
      },
    })

    return {
      success: true,
      newScore,
      milestone: MILESTONES[milestone].label,
    }
  } catch (error) {
    console.error('Error recording milestone:', error)
    return { success: false }
  }
}

/**
 * Check and record message count milestones
 */
export async function checkMessageMilestones(matchId: string): Promise<void> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        milestones: true,
        _count: {
          select: { messages: true },
        },
      },
    })

    if (!match) return

    const messageCount = match._count.messages
    const milestones = (match.milestones as MatchMilestones) || {}

    // Check each milestone
    if (messageCount >= 1 && !milestones.first_message) {
      await recordMilestone(matchId, 'first_message')
    }
    if (messageCount >= 10 && !milestones.messages_10) {
      await recordMilestone(matchId, 'messages_10', { count: messageCount })
    }
    if (messageCount >= 50 && !milestones.messages_50) {
      await recordMilestone(matchId, 'messages_50', { count: messageCount })
    }
    if (messageCount >= 100 && !milestones.messages_100) {
      await recordMilestone(matchId, 'messages_100', { count: messageCount })
    }
  } catch (error) {
    console.error('Error checking message milestones:', error)
  }
}

/**
 * Get journey progress for a match
 */
export async function getJourneyProgress(matchId: string): Promise<JourneyProgress | null> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        initialCompatibility: true,
        currentCompatibility: true,
        milestones: true,
        createdAt: true,
        _count: {
          select: { messages: true },
        },
      },
    })

    if (!match) return null

    const initialScore = match.initialCompatibility || 50
    const currentScore = match.currentCompatibility || initialScore
    const growth = currentScore - initialScore
    const growthPercentage = initialScore > 0 ? Math.round((growth / initialScore) * 100) : 0
    const milestones = (match.milestones as MatchMilestones) || {}

    // Build milestones array
    const milestoneList = Object.entries(MILESTONES).map(([key, value]) => ({
      key: key as MilestoneKey,
      label: value.label,
      achieved: !!milestones[key],
      achievedAt: milestones[key] ? String(milestones[key]) : undefined,
      bonus: value.bonus,
    }))

    // Find next milestone
    const messageCount = match._count.messages
    let nextMilestone: JourneyProgress['nextMilestone'] = undefined

    // Determine next message milestone
    if (!milestones.first_message) {
      nextMilestone = {
        key: 'first_message',
        label: MILESTONES.first_message.label,
        bonus: MILESTONES.first_message.bonus,
        progress: 0,
      }
    } else if (!milestones.messages_10) {
      nextMilestone = {
        key: 'messages_10',
        label: MILESTONES.messages_10.label,
        bonus: MILESTONES.messages_10.bonus,
        progress: Math.min(100, (messageCount / 10) * 100),
      }
    } else if (!milestones.messages_50) {
      nextMilestone = {
        key: 'messages_50',
        label: MILESTONES.messages_50.label,
        bonus: MILESTONES.messages_50.bonus,
        progress: Math.min(100, (messageCount / 50) * 100),
      }
    } else if (!milestones.vibe_check_completed) {
      nextMilestone = {
        key: 'vibe_check_completed',
        label: MILESTONES.vibe_check_completed.label,
        bonus: MILESTONES.vibe_check_completed.bonus,
      }
    }

    return {
      currentScore,
      initialScore,
      growth,
      growthPercentage,
      milestones: milestoneList,
      nextMilestone,
    }
  } catch (error) {
    console.error('Error getting journey progress:', error)
    return null
  }
}

/**
 * Calculate activity-based milestone (7 days, 30 days active)
 */
export async function checkActivityMilestones(matchId: string): Promise<void> {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        createdAt: true,
        milestones: true,
        messages: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!match || match.messages.length === 0) return

    const milestones = (match.milestones as MatchMilestones) || {}
    const lastMessageDate = match.messages[0].createdAt
    const matchCreatedAt = match.createdAt
    const daysSinceMatch = Math.floor(
      (Date.now() - matchCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysSinceLastMessage = Math.floor(
      (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Only count if recently active (within 3 days)
    if (daysSinceLastMessage > 3) return

    if (daysSinceMatch >= 7 && !milestones.active_7_days) {
      await recordMilestone(matchId, 'active_7_days')
    }
    if (daysSinceMatch >= 30 && !milestones.active_30_days) {
      await recordMilestone(matchId, 'active_30_days')
    }
  } catch (error) {
    console.error('Error checking activity milestones:', error)
  }
}
