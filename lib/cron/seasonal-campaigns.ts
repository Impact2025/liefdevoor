/**
 * Seasonal & Event-Based Campaigns
 *
 * Smart campaigns for holidays and special events
 * - Valentine's Day (Feb 14)
 * - Summer Love (Jun-Aug)
 * - New Year Fresh Start (Jan 1-7)
 * - Weekend Boost (Fri-Sun)
 */

import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import ValentinesSpecialEmail from '@/lib/email/templates/engagement/valentines-special'
import { sendEmail } from '@/lib/email/send'
import { checkFrequencyLimit } from '@/lib/email/personalization'

/**
 * Check if today is within a date range
 */
function isWithinDateRange(startMonth: number, startDay: number, endMonth: number, endDay: number): boolean {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  // Simple range check (doesn't handle year boundaries)
  if (startMonth === endMonth) {
    return month === startMonth && day >= startDay && day <= endDay
  }

  return (
    (month === startMonth && day >= startDay) ||
    (month === endMonth && day <= endDay) ||
    (month > startMonth && month < endMonth)
  )
}

/**
 * Valentine's Day Campaign (Feb 10-14)
 */
export async function sendValentinesCampaign(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  console.log('[Seasonal] Starting Valentine\'s Day campaign...')

  // Only run Feb 10-14
  if (!isWithinDateRange(2, 10, 2, 14)) {
    console.log('[Seasonal] Not Valentine\'s season, skipping')
    return { sent: 0, skipped: 0, errors: 0 }
  }

  let sent = 0
  let skipped = 0
  let errors = 0

  // Get active users
  const activeUsers = await prisma.user.findMany({
    where: {
      AND: [
        { email: { not: null } },
        { role: 'USER' },
        { isOnboarded: true },
        { marketingEmailsConsent: true },
        {
          // Active in last 30 days
          lastSeen: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
    take: 100, // Limit batch
  })

  for (const user of activeUsers) {
    try {
      // Check if already received Valentine's email this year
      const alreadySent = await prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'valentines_special',
          sentAt: {
            gte: new Date(new Date().getFullYear(), 1, 1), // This year Feb 1
          },
        },
      })

      if (alreadySent) {
        skipped++
        continue
      }

      // Check frequency limit
      const reachedLimit = await checkFrequencyLimit(user.id)
      if (reachedLimit) {
        skipped++
        continue
      }

      // Get suggested matches
      const matches = await prisma.matchScore.findMany({
        where: {
          userId: user.id,
          overallScore: { gte: 0.7 }, // High-quality matches
        },
        include: {
          targetUser: {
            select: {
              name: true,
              birthDate: true,
              city: true,
              profileImage: true,
              interests: true,
            },
          },
        },
        orderBy: {
          overallScore: 'desc',
        },
        take: 3,
      })

      const suggestedMatches = matches.map((match) => {
        const target = match.targetUser
        const age = target.birthDate
          ? new Date().getFullYear() - new Date(target.birthDate).getFullYear()
          : 0

        // Get shared interest
        const userInterests = user.interests?.split(',').map((i) => i.trim()) || []
        const targetInterests = target.interests?.split(',').map((i) => i.trim()) || []
        const sharedInterest = userInterests.find((interest) =>
          targetInterests.some((ti) => ti.toLowerCase() === interest.toLowerCase())
        )

        return {
          name: target.name || 'Iemand',
          age,
          photo: target.profileImage || 'https://via.placeholder.com/150',
          city: target.city || 'Nederland',
          sharedInterest,
        }
      })

      // Render email
      const emailHtml = await render(
        ValentinesSpecialEmail({
          userName: user.name || 'daar',
          suggestedMatches,
        })
      )

      const emailText = `
De liefde is in de lucht, ${user.name || 'daar'}!

Valentijnsdag komt eraan. Dit is het perfecte moment om iemand speciaal te leren kennen.

${suggestedMatches.length > 0 ? `We hebben deze bijzondere mensen voor je uitgezocht:` : ''}
${suggestedMatches.map((m) => `- ${m.name}, ${m.age} uit ${m.city}`).join('\n')}

Vind jouw Valentine: ${process.env.NEXT_PUBLIC_APP_URL}/discover

Liefde Voor Iedereen
      `.trim()

      await sendEmail({
        to: user.email!,
        subject: '💕 Valentijnsdag Special - Vind jouw perfecte match',
        html: emailHtml,
        text: emailText,
      })

      await prisma.emailLog.create({
        data: {
          userId: user.id,
          email: user.email!,
          type: 'valentines_special',
          category: 'seasonal',
          subject: 'Valentine\'s Day Special',
          status: 'sent',
        },
      })

      sent++
      console.log(`[Seasonal] ✓ Sent Valentine's email to ${user.email}`)

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`[Seasonal] ✗ Error sending to ${user.email}:`, error)
      errors++
    }
  }

  console.log(`[Seasonal] Valentine's complete: ${sent} sent, ${skipped} skipped, ${errors} errors`)

  return { sent, skipped, errors }
}

/**
 * Weekend Boost Campaign (Friday evenings)
 * Encourage users to be active over the weekend
 */
export async function sendWeekendBoost(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  console.log('[Seasonal] Starting Weekend Boost campaign...')

  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 5 = Friday

  // Only run on Friday
  if (dayOfWeek !== 5) {
    console.log('[Seasonal] Not Friday, skipping Weekend Boost')
    return { sent: 0, skipped: 0, errors: 0 }
  }

  let sent = 0
  let skipped = 0
  let errors = 0

  // Get active users who haven't swiped today
  const users = await prisma.user.findMany({
    where: {
      AND: [
        { email: { not: null } },
        { role: 'USER' },
        { isOnboarded: true },
        { marketingEmailsConsent: true },
        {
          outgoingSwipes: {
            none: {
              createdAt: {
                gte: new Date(now.setHours(0, 0, 0, 0)),
              },
            },
          },
        },
      ],
    },
    take: 50,
  })

  for (const user of users) {
    try {
      const reachedLimit = await checkFrequencyLimit(user.id)
      if (reachedLimit) {
        skipped++
        continue
      }

      // Use Daily Digest template with weekend messaging
      const { default: DailyDigestEmail } = await import(
        '@/lib/email/templates/engagement/daily-digest'
      )

      const emailHtml = await render(
        DailyDigestEmail({
          userName: user.name || 'daar',
          newVisitsCount: 0,
          newLikesCount: 0,
        })
      )

      await sendEmail({
        to: user.email!,
        subject: `${user.name}, maak dit weekend speciaal!`,
        html: emailHtml,
        text: `Hoi ${user.name}, het weekend komt eraan! Een perfecte tijd om nieuwe mensen te ontmoeten op Liefde Voor Iedereen.`,
      })

      await prisma.emailLog.create({
        data: {
          userId: user.id,
          email: user.email!,
          type: 'weekend_boost',
          category: 'seasonal',
          subject: 'Weekend Boost',
          status: 'sent',
        },
      })

      sent++
    } catch (error) {
      errors++
    }
  }

  console.log(`[Seasonal] Weekend Boost complete: ${sent} sent, ${skipped} skipped, ${errors} errors`)

  return { sent, skipped, errors }
}

/**
 * New Year Fresh Start Campaign (Jan 1-7)
 */
export async function sendNewYearCampaign(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  console.log('[Seasonal] Starting New Year campaign...')

  if (!isWithinDateRange(1, 1, 1, 7)) {
    console.log('[Seasonal] Not New Year period, skipping')
    return { sent: 0, skipped: 0, errors: 0 }
  }

  // Similar logic to Valentine's but with New Year messaging
  // Implementation would follow same pattern

  return { sent: 0, skipped: 0, errors: 0 }
}
