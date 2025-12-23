/**
 * AI-Powered Email Personalization Engine
 *
 * Personalizes email content based on:
 * - User behavior patterns
 * - Profile data
 * - Engagement history
 * - Time of day
 * - Device preferences
 */

import { prisma } from '@/lib/prisma'

interface PersonalizationContext {
  userId: string
  emailType: string
  userData?: any
}

interface PersonalizedContent {
  subjectLine: string
  greeting: string
  contentVariant: string
  ctaText: string
  sendTime?: Date
}

/**
 * Generate personalized subject lines using AI patterns
 */
export function personalizeSubjectLine(
  baseSubject: string,
  context: PersonalizationContext
): string {
  const { userId, emailType, userData } = context

  // Time-based personalization
  const hour = new Date().getHours()
  const timeOfDay =
    hour < 12 ? 'goedemorgen' : hour < 18 ? 'goedemiddag' : 'goedenavond'

  // Name personalization
  const name = userData?.name || 'daar'

  // Subject line variants based on email type
  const variants: Record<string, string[]> = {
    daily_digest: [
      `${name}, je hebt nieuwe bezoekers! 👀`,
      `Goed nieuws ${name}! Er is interesse in je profiel`,
      `${name}, iemand keek vandaag naar je profiel`,
      `Nieuw! ${name}, check je matches vandaag`,
    ],
    profile_nudge: [
      `${name}, je profiel is bijna klaar! 🎯`,
      `Nog een paar stappen ${name}...`,
      `${name}, help anderen jou te vinden`,
      `Maak je profiel compleet en vind liefde, ${name}`,
    ],
    perfect_match: [
      `${name}, we vonden iemand speciaal! ✨`,
      `Dit moet je zien ${name}...`,
      `${name}, een perfecte match wacht op je`,
      `Bijzonder nieuws voor jou, ${name}!`,
    ],
    re_engagement: [
      `We missen je, ${name}! 💙`,
      `${name}, er is veel veranderd sinds je weg was`,
      `Kom terug ${name}, er zijn nieuwe matches`,
      `${name}, je account wacht op je`,
    ],
  }

  // Select variant based on user engagement history
  const options = variants[emailType] || [baseSubject]
  const variantIndex = Math.floor(Math.random() * options.length)

  return options[variantIndex]
}

/**
 * Personalize email greeting based on time and user data
 */
export function personalizeGreeting(userData: any): string {
  const hour = new Date().getHours()
  const name = userData?.name || 'daar'

  if (hour < 12) {
    return `Goedemorgen ${name}`
  } else if (hour < 18) {
    return `Hoi ${name}`
  } else {
    return `Goedenavond ${name}`
  }
}

/**
 * Personalize CTA button text based on user behavior
 */
export function personalizeCTA(emailType: string, userData: any): string {
  const ctaVariants: Record<string, string[]> = {
    daily_digest: [
      'Bekijk wie het is',
      'Kijk nu',
      'Zie je nieuwe matches',
      'Ontdek je bezoekers',
    ],
    profile_nudge: [
      'Maak mijn profiel af',
      'Profiel compleet maken',
      'Help me starten',
      'Laat me zien hoe',
    ],
    perfect_match: [
      'Bekijk profiel',
      'Leer hem/haar kennen',
      'Stuur een bericht',
      'Zie de match',
    ],
  }

  const options = ctaVariants[emailType] || ['Klik hier']
  return options[0] // Use first variant by default, can be A/B tested
}

/**
 * Calculate optimal send time for a user
 * Based on historical open rates
 */
export async function calculateOptimalSendTime(
  userId: string
): Promise<Date | null> {
  try {
    // Get user's send time optimization data
    const optimization = await prisma.emailSendTimeOptimization.findUnique({
      where: { userId },
    })

    if (!optimization || !optimization.optimalSendHour) {
      // Default to 19:00 (7 PM) if no data
      const defaultTime = new Date()
      defaultTime.setHours(19, 0, 0, 0)
      return defaultTime
    }

    // Use ML-calculated optimal hour
    const optimalTime = new Date()
    optimalTime.setHours(optimization.optimalSendHour, 0, 0, 0)

    // If optimal time already passed today, schedule for tomorrow
    if (optimalTime < new Date()) {
      optimalTime.setDate(optimalTime.getDate() + 1)
    }

    return optimalTime
  } catch (error) {
    console.error('[Personalization] Error calculating send time:', error)
    return null
  }
}

/**
 * Update send time optimization based on user behavior
 */
export async function updateSendTimeOptimization(
  userId: string,
  emailLogId: string,
  openedAt?: Date
): Promise<void> {
  try {
    if (!openedAt) return

    const sentEmail = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    })

    if (!sentEmail) return

    const sentHour = sentEmail.sentAt.getHours()
    const openHour = openedAt.getHours()

    // Get or create optimization record
    let optimization = await prisma.emailSendTimeOptimization.findUnique({
      where: { userId },
    })

    if (!optimization) {
      optimization = await prisma.emailSendTimeOptimization.create({
        data: {
          userId,
          openRateByHour: {},
          clickRateByHour: {},
          dataPoints: 0,
        },
      })
    }

    // Update open rate for this hour
    const openRates = (optimization.openRateByHour as any) || {}
    const currentRate = openRates[sentHour.toString()] || 0
    const currentCount = optimization.dataPoints || 0

    // Weighted average
    openRates[sentHour.toString()] =
      (currentRate * currentCount + 1) / (currentCount + 1)

    // Find optimal hour (highest open rate)
    let maxRate = 0
    let optimalHour = 19 // Default

    Object.entries(openRates).forEach(([hour, rate]) => {
      if ((rate as number) > maxRate) {
        maxRate = rate as number
        optimalHour = parseInt(hour)
      }
    })

    // Update optimization
    await prisma.emailSendTimeOptimization.update({
      where: { userId },
      data: {
        openRateByHour: openRates,
        optimalSendHour: optimalHour,
        dataPoints: currentCount + 1,
        confidenceScore: Math.min(currentCount / 20, 1), // Max confidence after 20 emails
        lastCalculatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[Personalization] Error updating send time:', error)
  }
}

/**
 * Get personalized content for an email
 */
export async function getPersonalizedContent(
  context: PersonalizationContext
): Promise<PersonalizedContent> {
  const { userId, emailType, userData } = context

  // Get user preference and optimization data
  const [preference, optimization] = await Promise.all([
    prisma.emailPreference.findUnique({ where: { userId } }),
    prisma.emailSendTimeOptimization.findUnique({ where: { userId } }),
  ])

  return {
    subjectLine: personalizeSubjectLine('Default Subject', context),
    greeting: personalizeGreeting(userData),
    contentVariant: 'default', // Can be extended with content variants
    ctaText: personalizeCTA(emailType, userData),
    sendTime: optimization?.optimalSendHour
      ? (() => {
          const time = new Date()
          time.setHours(optimization.optimalSendHour, 0, 0, 0)
          return time
        })()
      : undefined,
  }
}

/**
 * Check if user has reached email frequency limit
 */
export async function checkFrequencyLimit(userId: string): Promise<boolean> {
  try {
    const preference = await prisma.emailPreference.findUnique({
      where: { userId },
    })

    if (!preference) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    thisWeek.setHours(0, 0, 0, 0)

    // Count emails sent today and this week
    const [todayCount, weekCount] = await Promise.all([
      prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: today },
        },
      }),
      prisma.emailLog.count({
        where: {
          userId,
          sentAt: { gte: thisWeek },
        },
      }),
    ])

    // Check limits
    if (todayCount >= (preference.maxEmailsPerDay || 2)) {
      console.log(`[Personalization] User ${userId} reached daily limit`)
      return true
    }

    if (weekCount >= (preference.maxEmailsPerWeek || 7)) {
      console.log(`[Personalization] User ${userId} reached weekly limit`)
      return true
    }

    return false
  } catch (error) {
    console.error('[Personalization] Error checking frequency limit:', error)
    return false
  }
}
