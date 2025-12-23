/**
 * Retention Engine - Email Automation
 *
 * Designed for Vercel Cron Jobs
 * Run daily at 19:00 (7 PM) to maximize engagement
 *
 * Setup in vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/daily-digest",
 *       "schedule": "0 19 * * *"
 *     },
 *     {
 *       "path": "/api/cron/profile-nudge",
 *       "schedule": "0 10 * * *"
 *     }
 *   ]
 * }
 */

import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import DailyDigestEmail from '@/lib/email/templates/engagement/daily-digest'
import ProfileNudgeEmail from '@/lib/email/templates/engagement/profile-nudge'
import PerfectMatchEmail from '@/lib/email/templates/engagement/perfect-match'
import { sendEmail } from '@/lib/email/send'

/**
 * Calculate profile completion score
 * Based on essential fields for matching
 */
function calculateProfileScore(user: any): number {
  let score = 0
  const weights = {
    profileImage: 30,
    bio: 20,
    interests: 15,
    birthDate: 10,
    city: 10,
    voiceIntro: 10,
    lookingFor: 5
  }

  if (user.profileImage) score += weights.profileImage
  if (user.bio && user.bio.length > 20) score += weights.bio
  if (user.interests && user.interests.length > 0) score += weights.interests
  if (user.birthDate) score += weights.birthDate
  if (user.city) score += weights.city
  if (user.voiceIntro) score += weights.voiceIntro
  if (user.lookingFor) score += weights.lookingFor

  return score
}

/**
 * Get missing profile fields for a user
 */
function getMissingFields(user: any): string[] {
  const missing: string[] = []

  if (!user.profileImage) missing.push('Profielfoto')
  if (!user.bio || user.bio.length < 20) missing.push('Over jezelf (bio)')
  if (!user.interests || user.interests.length === 0) missing.push('Interesses')
  if (!user.city) missing.push('Woonplaats')
  if (!user.voiceIntro) missing.push('Stem intro')
  if (!user.lookingFor) missing.push('Wat zoek je?')

  return missing
}

/**
 * Daily Digest - Sends profile visit and like summaries
 * Run at 19:00 (7 PM) for maximum engagement
 */
export async function sendDailyDigests(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  console.log('[Retention] Starting Daily Digest sending...')

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  let sent = 0
  let skipped = 0
  let errors = 0

  try {
    // Find users with activity in the last 24 hours
    const usersWithActivity = await prisma.user.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { isOnboarded: true },
          { role: 'USER' },
          { marketingEmailsConsent: true }, // GDPR compliant
          {
            OR: [
              // Users who received profile views
              {
                profileViewsReceived: {
                  some: {
                    viewedAt: {
                      gte: yesterday
                    }
                  }
                }
              },
              // Users who received likes
              {
                incomingSwipes: {
                  some: {
                    isLike: true,
                    createdAt: {
                      gte: yesterday
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        profileViewsReceived: {
          where: {
            viewedAt: {
              gte: yesterday
            }
          },
          include: {
            viewer: {
              select: {
                id: true,
                name: true,
                birthDate: true,
                city: true,
                profileImage: true
              }
            }
          },
          orderBy: {
            viewedAt: 'desc'
          },
          take: 1 // Featured visitor
        },
        incomingSwipes: {
          where: {
            isLike: true,
            createdAt: {
              gte: yesterday
            }
          }
        }
      }
    })

    console.log(`[Retention] Found ${usersWithActivity.length} users with activity`)

    for (const user of usersWithActivity) {
      try {
        const newVisitsCount = user.profileViewsReceived.length
        const newLikesCount = user.incomingSwipes.length

        // Skip if no meaningful activity
        if (newVisitsCount === 0 && newLikesCount === 0) {
          skipped++
          continue
        }

        // Get featured visitor
        const featuredVisitor = user.profileViewsReceived[0]?.viewer
        let featuredVisitorData = undefined

        if (featuredVisitor && featuredVisitor.profileImage) {
          const age = featuredVisitor.birthDate
            ? new Date().getFullYear() - new Date(featuredVisitor.birthDate).getFullYear()
            : 0

          featuredVisitorData = {
            name: featuredVisitor.name || 'Iemand',
            age,
            photo: featuredVisitor.profileImage,
            city: featuredVisitor.city || 'Nederland'
          }
        }

        // Render email
        const emailHtml = await render(
          DailyDigestEmail({
            userName: user.name || 'daar',
            newVisitsCount,
            newLikesCount,
            featuredVisitor: featuredVisitorData
          })
        )

        const emailText = `
Goed nieuws, ${user.name || 'daar'}!

Je hebt ${newVisitsCount} ${newVisitsCount === 1 ? 'nieuw bezoek' : 'nieuwe bezoekers'} en ${newLikesCount} ${newLikesCount === 1 ? 'nieuwe like' : 'nieuwe likes'}.

Er is vandaag veel interesse in jouw profiel.

Klik hier om te zien wie het is: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/visitors

Liefde Voor Iedereen
        `.trim()

        // Send email
        await sendEmail({
          to: user.email!,
          subject: `${newVisitsCount + newLikesCount} nieuwe ${newVisitsCount + newLikesCount === 1 ? 'bezoeker' : 'bezoekers'} op je profiel!`,
          html: emailHtml,
          text: emailText
        })

        // Log email in database
        await prisma.emailLog.create({
          data: {
            userId: user.id,
            email: user.email!,
            type: 'daily_digest',
            category: 'engagement',
            subject: `${newVisitsCount + newLikesCount} nieuwe bezoekers`,
            status: 'sent'
          }
        })

        sent++
        console.log(`[Retention] ✓ Sent Daily Digest to ${user.email}`)
      } catch (error) {
        console.error(`[Retention] ✗ Error sending to ${user.email}:`, error)
        errors++
      }
    }
  } catch (error) {
    console.error('[Retention] Error in Daily Digest cron:', error)
    throw error
  }

  console.log(`[Retention] Daily Digest complete: ${sent} sent, ${skipped} skipped, ${errors} errors`)

  return { sent, skipped, errors }
}

/**
 * Profile Nudge - Encourages incomplete profiles
 * Run at 10:00 AM for best engagement
 */
export async function checkIncompleteProfiles(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  console.log('[Retention] Starting Profile Nudge sending...')

  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  let sent = 0
  let skipped = 0
  let errors = 0

  try {
    // Find users registered > 3 days ago with incomplete profiles
    const incompleteUsers = await prisma.user.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { createdAt: { lte: threeDaysAgo } },
          { role: 'USER' },
          { marketingEmailsConsent: true }, // GDPR compliant
          {
            OR: [
              { profileImage: null },
              { bio: null },
              { interests: null },
              { city: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        bio: true,
        interests: true,
        city: true,
        birthDate: true,
        voiceIntro: true,
        lookingFor: true,
        createdAt: true
      }
    })

    console.log(`[Retention] Found ${incompleteUsers.length} users with incomplete profiles`)

    for (const user of incompleteUsers) {
      try {
        const profileScore = calculateProfileScore(user)

        // Only send if profile is < 50% complete
        if (profileScore >= 50) {
          skipped++
          continue
        }

        // Check if we already sent a nudge in the last 7 days
        const recentNudge = await prisma.emailLog.findFirst({
          where: {
            userId: user.id,
            type: 'profile_nudge',
            sentAt: {
              gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })

        if (recentNudge) {
          skipped++
          continue
        }

        const missingFields = getMissingFields(user)

        // Render email
        const emailHtml = await render(
          ProfileNudgeEmail({
            userName: user.name || 'daar',
            profileScore,
            missingFields
          })
        )

        const emailText = `
Hoi ${user.name || 'daar'},

Je profiel is bijna klaar!

Een compleet profiel krijgt 5x meer matches. Help anderen jou beter te leren kennen.

Jouw profiel is nu ${profileScore}% compleet.

Nog toe te voegen:
${missingFields.map(field => `- ${field}`).join('\n')}

Klik hier om je profiel af te maken: ${process.env.NEXT_PUBLIC_APP_URL}/profile/edit

Liefde Voor Iedereen
        `.trim()

        // Send email
        await sendEmail({
          to: user.email!,
          subject: 'Je profiel is bijna klaar! 🎯',
          html: emailHtml,
          text: emailText
        })

        // Log email in database
        await prisma.emailLog.create({
          data: {
            userId: user.id,
            email: user.email!,
            type: 'profile_nudge',
            category: 'engagement',
            subject: 'Je profiel is bijna klaar',
            status: 'sent'
          }
        })

        sent++
        console.log(`[Retention] ✓ Sent Profile Nudge to ${user.email}`)
      } catch (error) {
        console.error(`[Retention] ✗ Error sending to ${user.email}:`, error)
        errors++
      }
    }
  } catch (error) {
    console.error('[Retention] Error in Profile Nudge cron:', error)
    throw error
  }

  console.log(`[Retention] Profile Nudge complete: ${sent} sent, ${skipped} skipped, ${errors} errors`)

  return { sent, skipped, errors }
}

/**
 * Perfect Match - Send personalized match recommendations
 * Run when a high-quality match is detected
 * This can be triggered by the matching algorithm
 */
export async function sendPerfectMatchEmail(
  userId: string,
  matchUserId: string
): Promise<boolean> {
  console.log(`[Retention] Sending Perfect Match email: ${userId} -> ${matchUserId}`)

  try {
    // Get both users
    const [user, matchUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          interests: true,
          marketingEmailsConsent: true
        }
      }),
      prisma.user.findUnique({
        where: { id: matchUserId },
        select: {
          name: true,
          birthDate: true,
          city: true,
          profileImage: true,
          interests: true
        }
      })
    ])

    if (!user || !matchUser || !user.email || !user.marketingEmailsConsent) {
      console.log('[Retention] User not found or no email consent')
      return false
    }

    // Calculate shared interests
    const userInterests = user.interests ? user.interests.split(',').map(i => i.trim()) : []
    const matchInterests = matchUser.interests ? matchUser.interests.split(',').map(i => i.trim()) : []
    const sharedInterests = userInterests.filter(interest =>
      matchInterests.some(mi => mi.toLowerCase() === interest.toLowerCase())
    )

    if (sharedInterests.length === 0) {
      console.log('[Retention] No shared interests found')
      return false
    }

    const age = matchUser.birthDate
      ? new Date().getFullYear() - new Date(matchUser.birthDate).getFullYear()
      : 25

    // Render email
    const emailHtml = await render(
      PerfectMatchEmail({
        userName: user.name || 'daar',
        matchName: matchUser.name || 'Iemand',
        matchAge: age,
        matchPhoto: matchUser.profileImage || 'https://via.placeholder.com/150',
        matchCity: matchUser.city || 'Nederland',
        sharedInterests,
        compatibilityScore: 85
      })
    )

    const emailText = `
Hoi ${user.name || 'daar'},

We vonden iemand speciaal voor jou!

${matchUser.name}, ${age} jaar uit ${matchUser.city}

Wat jullie delen:
${sharedInterests.map(i => `- Jullie houden allebei van ${i}`).join('\n')}

Klik hier om het profiel te bekijken: ${process.env.NEXT_PUBLIC_APP_URL}/profile/${matchUser.name?.toLowerCase()}

Liefde Voor Iedereen
    `.trim()

    // Send email
    await sendEmail({
      to: user.email,
      subject: `We vonden iemand speciaal voor jou! ✨`,
      html: emailHtml,
      text: emailText
    })

    // Log email in database
    await prisma.emailLog.create({
      data: {
        userId: userId,
        email: user.email,
        type: 'perfect_match',
        category: 'engagement',
        subject: 'Perfect match gevonden',
        status: 'sent'
      }
    })

    console.log(`[Retention] ✓ Sent Perfect Match email to ${user.email}`)
    return true
  } catch (error) {
    console.error('[Retention] Error sending Perfect Match email:', error)
    return false
  }
}
