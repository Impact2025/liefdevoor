/**
 * Birthday Email System - World Class
 *
 * Automatically sends personalized birthday emails every day at 9 AM
 */

import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import BirthdayEmail from './templates/engagement/birthday'
import { sendEmail } from './send'

interface BirthdayUser {
  id: string
  name: string
  email: string
  birthDate: Date
  age: number
  gender?: string
}

interface MatchSuggestion {
  name: string
  age: number
  photo: string
  city: string
}

/**
 * Find all users with birthdays today
 */
export async function findBirthdaysToday(): Promise<BirthdayUser[]> {
  const today = new Date()
  const todayMonth = today.getMonth() + 1 // 1-12
  const todayDay = today.getDate() // 1-31

  console.log(`[Birthday] Looking for birthdays on ${todayMonth}/${todayDay}`)

  // Find users born on this day (any year)
  const users = await prisma.$queryRawUnsafe<BirthdayUser[]>(`
    SELECT
      id,
      name,
      email,
      "birthDate",
      EXTRACT(YEAR FROM AGE("birthDate")) as age,
      gender
    FROM "User"
    WHERE
      EXTRACT(MONTH FROM "birthDate") = ${todayMonth}
      AND EXTRACT(DAY FROM "birthDate") = ${todayDay}
      AND "emailVerified" IS NOT NULL
      AND email IS NOT NULL
      AND "birthDate" IS NOT NULL
  `)

  console.log(`[Birthday] Found ${users.length} users with birthdays today`)
  return users
}

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
 * Check if user wants birthday emails
 */
export async function shouldSendBirthdayEmail(userId: string): Promise<boolean> {
  // For now, check if user has verified email (we'll add preferences later)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true }
  })

  return user?.emailVerified !== null
}

/**
 * Get match suggestions for birthday email
 */
export async function getBirthdayMatchSuggestions(userId: string): Promise<{
  count: number
  featured: MatchSuggestion | null
}> {
  try {
    // Get user's basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gender: true,
        birthDate: true
      }
    })

    if (!user) {
      return { count: 0, featured: null }
    }

    // Determine interested gender (opposite for simplicity)
    let interestedInGender: 'MALE' | 'FEMALE' | undefined
    if (user.gender === 'MALE') {
      interestedInGender = 'FEMALE'
    } else if (user.gender === 'FEMALE') {
      interestedInGender = 'MALE'
    }

    // Find potential matches (users they haven't swiped on yet)
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { not: userId },
        ...(interestedInGender && { gender: interestedInGender }),
        emailVerified: { not: null },
        profileImage: { not: null },
        // Not already swiped
        NOT: {
          incomingSwipes: {
            some: { swiperId: userId }
          }
        }
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        profileImage: true,
        city: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    if (potentialMatches.length === 0) {
      return { count: 0, featured: null }
    }

    // Format featured match
    const featuredUser = potentialMatches[0]
    const featured: MatchSuggestion = {
      name: featuredUser.name || 'Someone special',
      age: featuredUser.birthDate ? calculateAge(featuredUser.birthDate) : 25,
      photo: featuredUser.profileImage || getDefaultAvatar(featuredUser.name || 'User'),
      city: featuredUser.city || 'Nederland'
    }

    return {
      count: potentialMatches.length,
      featured
    }
  } catch (error) {
    console.error('[Birthday] Error getting match suggestions:', error)
    return { count: 0, featured: null }
  }
}

/**
 * Check if user has premium subscription
 */
async function isPremiumUser(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      endDate: {
        gte: new Date()
      }
    }
  })

  return !!subscription
}

/**
 * Send birthday email to a user
 */
export async function sendBirthdayEmail(user: BirthdayUser): Promise<void> {
  try {
    console.log(`[Birthday] Processing birthday email for ${user.email} (age ${user.age})`)

    // Check if user wants birthday emails
    const shouldSend = await shouldSendBirthdayEmail(user.id)
    if (!shouldSend) {
      console.log(`[Birthday] User ${user.email} has no verified email or opted out`)
      return
    }

    // Get match suggestions
    const matches = await getBirthdayMatchSuggestions(user.id)
    console.log(`[Birthday] Found ${matches.count} match suggestions for ${user.email}`)

    // Check if premium
    const isPremium = await isPremiumUser(user.id)
    console.log(`[Birthday] User ${user.email} is ${isPremium ? 'premium' : 'free'}`)

    // Render email template
    const html = await render(
      BirthdayEmail({
        userName: user.name || 'daar',
        age: user.age,
        newMatchesCount: matches.count,
        featuredMatch: matches.featured || undefined,
        isPremium
      })
    )

    // Generate plain text version
    const text = `
Gefeliciteerd ${user.name || 'daar'}!

Je bent vandaag ${user.age} geworden! 🎂

${matches.count > 0 ? `We hebben ${matches.count} nieuwe matches voor je gevonden!` : ''}

${matches.featured ? `Bijvoorbeeld ${matches.featured.name}, ${matches.featured.age} uit ${matches.featured.city}.` : ''}

${isPremium ? `
Als premium member heb je vandaag speciale bonussen:
- Gratis Boost (3x meer zichtbaar)
- Unlimited likes voor 24 uur
- Birthday badge op je profiel
` : `
Speciale verjaardag aanbieding: Upgrade naar Premium met 50% korting!
Deze aanbieding vervalt om middernacht.
`}

Maak er een mooie ${user.age}e! 🎈

Met liefde,
Het Liefde Voor Iedereen Team ❤️

Bekijk je matches: http://localhost:3004/discover?birthday=true
    `.trim()

    // Send email via Resend
    await sendEmail({
      to: user.email,
      subject: `🎉 Gefeliciteerd ${user.name || 'daar'}! Je bent ${user.age} geworden!`,
      html,
      text
    })

    // Log email (TODO: Uncomment when EmailLog is available)
    try {
      await (prisma as any).emailLog?.create({
        data: {
          userId: user.id,
          email: user.email,
          type: 'engagement',
          category: 'birthday',
          subject: `Gefeliciteerd ${user.name}!`,
          status: 'sent'
        }
      })
    } catch (logError) {
      console.warn('[Birthday] Could not log email (EmailLog model not ready):', logError)
    }

    console.log(`[Birthday] ✅ Birthday email sent to ${user.email}`)
  } catch (error) {
    console.error(`[Birthday] ❌ Failed to send birthday email to ${user.email}:`, error)

    // Log error (TODO: Uncomment when EmailLog is available)
    try {
      await (prisma as any).emailLog?.create({
        data: {
          userId: user.id,
          email: user.email,
          type: 'engagement',
          category: 'birthday',
          subject: `Gefeliciteerd ${user.name}!`,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    } catch (logError) {
      console.warn('[Birthday] Could not log error (EmailLog model not ready)')
    }

    throw error
  }
}

/**
 * Send birthday emails to all users with birthdays today
 */
export async function sendAllBirthdayEmails(): Promise<{
  total: number
  sent: number
  failed: number
  errors: string[]
}> {
  console.log('[Birthday] Starting daily birthday email job...')

  const birthdays = await findBirthdaysToday()

  if (birthdays.length === 0) {
    console.log('[Birthday] No birthdays today')
    return { total: 0, sent: 0, failed: 0, errors: [] }
  }

  let sentCount = 0
  let failedCount = 0
  const errors: string[] = []

  for (const user of birthdays) {
    try {
      await sendBirthdayEmail(user)
      sentCount++
    } catch (error) {
      failedCount++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`${user.email}: ${errorMessage}`)
    }
  }

  console.log(`[Birthday] Job complete: ${sentCount} sent, ${failedCount} failed out of ${birthdays.length} total`)

  return {
    total: birthdays.length,
    sent: sentCount,
    failed: failedCount,
    errors
  }
}
