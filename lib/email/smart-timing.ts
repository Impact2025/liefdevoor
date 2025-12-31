/**
 * Smart Email Timing - ML-based optimal send time calculation
 *
 * Features:
 * - Per-user optimal send hour based on historical engagement
 * - Time zone awareness
 * - Quiet hours respect
 * - Batch send scheduling
 */

import { prisma } from '@/lib/prisma'

interface OptimalSendTime {
  hour: number // 0-23
  confidence: number // 0-100
  timezone: string
}

interface UserSendWindow {
  userId: string
  email: string
  optimalHour: number
  quietHoursStart: number | null
  quietHoursEnd: number | null
  timezone: string
}

/**
 * Get optimal send time for a specific user
 */
export async function getOptimalSendTime(userId: string): Promise<OptimalSendTime> {
  try {
    const [optimization, preference] = await Promise.all([
      prisma.emailSendTimeOptimization.findUnique({
        where: { userId },
      }),
      prisma.emailPreference.findUnique({
        where: { userId },
      }),
    ])

    const timezone = preference?.timezone || 'Europe/Amsterdam'
    const defaultHour = 10 // 10 AM default

    if (!optimization || optimization.confidenceScore < 30) {
      // Not enough data, use preference or default
      return {
        hour: preference?.preferredSendTime || defaultHour,
        confidence: 0,
        timezone,
      }
    }

    // Check quiet hours
    if (preference?.quietHoursStart != null && preference?.quietHoursEnd != null) {
      let optimalHour = optimization.optimalSendHour || defaultHour

      // Adjust if optimal hour falls in quiet hours
      if (isInQuietHours(optimalHour, preference.quietHoursStart, preference.quietHoursEnd)) {
        // Move to just after quiet hours end
        optimalHour = preference.quietHoursEnd
      }

      return {
        hour: optimalHour,
        confidence: optimization.confidenceScore,
        timezone,
      }
    }

    return {
      hour: optimization.optimalSendHour || defaultHour,
      confidence: optimization.confidenceScore,
      timezone,
    }
  } catch (error) {
    console.error('[Smart Timing] Error getting optimal send time:', error)
    return {
      hour: 10,
      confidence: 0,
      timezone: 'Europe/Amsterdam',
    }
  }
}

/**
 * Check if hour is within quiet hours
 */
function isInQuietHours(hour: number, start: number, end: number): boolean {
  if (start < end) {
    // Simple case: quiet hours don't cross midnight
    return hour >= start && hour < end
  } else {
    // Quiet hours cross midnight (e.g., 22:00 - 08:00)
    return hour >= start || hour < end
  }
}

/**
 * Get the best time to send an email right now, considering user preferences
 */
export async function shouldSendNow(userId: string): Promise<boolean> {
  try {
    const optimal = await getOptimalSendTime(userId)
    const now = new Date()

    // Get current hour in user's timezone
    const userHour = getCurrentHourInTimezone(optimal.timezone)

    // Allow a 2-hour window around optimal time
    const hourDiff = Math.abs(userHour - optimal.hour)
    const isWithinWindow = hourDiff <= 2 || hourDiff >= 22 // Handle midnight crossing

    return isWithinWindow
  } catch {
    return true // Default to allowing send
  }
}

/**
 * Get current hour in a specific timezone
 */
function getCurrentHourInTimezone(timezone: string): number {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    })
    return parseInt(formatter.format(now))
  } catch {
    return new Date().getHours()
  }
}

/**
 * Update send time optimization after email engagement
 */
export async function recordEmailEngagement(
  userId: string,
  action: 'send' | 'open' | 'click',
  hour: number
): Promise<void> {
  try {
    const existing = await prisma.emailSendTimeOptimization.findUnique({
      where: { userId },
    })

    if (existing) {
      const openRates = (existing.openRateByHour as Record<string, number>) || {}
      const clickRates = (existing.clickRateByHour as Record<string, number>) || {}

      // Update rates based on action
      if (action === 'open') {
        openRates[hour.toString()] = (openRates[hour.toString()] || 0) + 1
      } else if (action === 'click') {
        clickRates[hour.toString()] = (clickRates[hour.toString()] || 0) + 1
      }

      // Calculate new optimal hour using weighted scoring
      const optimalHour = calculateOptimalHour(openRates, clickRates)

      // Calculate confidence (more data = higher confidence)
      const totalDataPoints = existing.dataPoints + 1
      const confidence = Math.min(100, totalDataPoints * 5)

      await prisma.emailSendTimeOptimization.update({
        where: { userId },
        data: {
          openRateByHour: openRates,
          clickRateByHour: clickRates,
          dataPoints: totalDataPoints,
          optimalSendHour: optimalHour,
          confidenceScore: confidence,
          lastCalculatedAt: new Date(),
        },
      })
    } else {
      // Create new optimization record
      const initialRates = { [hour.toString()]: 1 }

      await prisma.emailSendTimeOptimization.create({
        data: {
          userId,
          openRateByHour: action === 'open' ? initialRates : {},
          clickRateByHour: action === 'click' ? initialRates : {},
          dataPoints: 1,
          optimalSendHour: hour,
          confidenceScore: 5,
          lastCalculatedAt: new Date(),
        },
      })
    }
  } catch (error) {
    console.error('[Smart Timing] Error recording engagement:', error)
  }
}

/**
 * Calculate optimal send hour using weighted scoring
 * Opens count as 1x, clicks count as 3x (more valuable)
 */
function calculateOptimalHour(
  openRates: Record<string, number>,
  clickRates: Record<string, number>
): number {
  const scores: Record<string, number> = {}

  // Add open scores
  for (const [hour, count] of Object.entries(openRates)) {
    scores[hour] = (scores[hour] || 0) + count
  }

  // Add click scores (weighted 3x)
  for (const [hour, count] of Object.entries(clickRates)) {
    scores[hour] = (scores[hour] || 0) + count * 3
  }

  // Find hour with highest score
  let maxScore = 0
  let optimalHour = 10 // Default

  for (const [hour, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      optimalHour = parseInt(hour)
    }
  }

  return optimalHour
}

/**
 * Get users grouped by optimal send hour for batch sending
 */
export async function getUsersByOptimalHour(
  userIds: string[]
): Promise<Map<number, UserSendWindow[]>> {
  const result = new Map<number, UserSendWindow[]>()

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        email: { not: null },
        marketingEmailsConsent: true,
      },
      select: {
        id: true,
        email: true,
        emailPreference: true,
      },
    })

    const optimizations = await prisma.emailSendTimeOptimization.findMany({
      where: { userId: { in: userIds } },
    })

    const optimizationMap = new Map(optimizations.map(o => [o.userId, o]))

    for (const user of users) {
      if (!user.email) continue

      const optimization = optimizationMap.get(user.id)
      const preference = user.emailPreference

      let optimalHour = preference?.preferredSendTime || 10

      if (optimization && optimization.confidenceScore > 30) {
        optimalHour = optimization.optimalSendHour || optimalHour
      }

      const sendWindow: UserSendWindow = {
        userId: user.id,
        email: user.email,
        optimalHour,
        quietHoursStart: preference?.quietHoursStart || null,
        quietHoursEnd: preference?.quietHoursEnd || null,
        timezone: preference?.timezone || 'Europe/Amsterdam',
      }

      if (!result.has(optimalHour)) {
        result.set(optimalHour, [])
      }
      result.get(optimalHour)!.push(sendWindow)
    }
  } catch (error) {
    console.error('[Smart Timing] Error grouping users by optimal hour:', error)
  }

  return result
}

/**
 * Get email send statistics for analytics
 */
export async function getEmailTimingStats(): Promise<{
  avgOptimalHour: number
  confidenceDistribution: Record<string, number>
  hourDistribution: Record<string, number>
}> {
  try {
    const optimizations = await prisma.emailSendTimeOptimization.findMany({
      where: { confidenceScore: { gt: 0 } },
    })

    if (optimizations.length === 0) {
      return {
        avgOptimalHour: 10,
        confidenceDistribution: {},
        hourDistribution: {},
      }
    }

    // Calculate average optimal hour
    const avgOptimalHour = Math.round(
      optimizations.reduce((sum, o) => sum + (o.optimalSendHour || 10), 0) /
        optimizations.length
    )

    // Confidence distribution
    const confidenceDistribution: Record<string, number> = {
      'low (0-30)': 0,
      'medium (30-70)': 0,
      'high (70-100)': 0,
    }

    // Hour distribution
    const hourDistribution: Record<string, number> = {}

    for (const opt of optimizations) {
      // Confidence
      if (opt.confidenceScore < 30) {
        confidenceDistribution['low (0-30)']++
      } else if (opt.confidenceScore < 70) {
        confidenceDistribution['medium (30-70)']++
      } else {
        confidenceDistribution['high (70-100)']++
      }

      // Hour
      const hour = opt.optimalSendHour?.toString() || '10'
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1
    }

    return {
      avgOptimalHour,
      confidenceDistribution,
      hourDistribution,
    }
  } catch (error) {
    console.error('[Smart Timing] Error getting stats:', error)
    return {
      avgOptimalHour: 10,
      confidenceDistribution: {},
      hourDistribution: {},
    }
  }
}
