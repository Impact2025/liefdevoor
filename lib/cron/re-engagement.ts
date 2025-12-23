/**
 * Re-Engagement Engine
 *
 * Win back dormant users with smart, personalized campaigns
 * Multi-stage approach based on inactivity duration
 */

import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import ReEngagementEmail from '@/lib/email/templates/engagement/re-engagement'
import { sendEmail } from '@/lib/email/send'
import { getPersonalizedContent, checkFrequencyLimit } from '@/lib/email/personalization'

interface ReEngagementTier {
  name: string
  daysSinceLastVisit: number
  minDays: number
  maxDays: number
}

// Multi-stage re-engagement funnel
const RE_ENGAGEMENT_TIERS: ReEngagementTier[] = [
  {
    name: 'gentle_reminder',
    daysSinceLastVisit: 7,
    minDays: 7,
    maxDays: 14,
  },
  {
    name: 'missed_you',
    daysSinceLastVisit: 14,
    minDays: 14,
    maxDays: 30,
  },
  {
    name: 'come_back',
    daysSinceLastVisit: 30,
    minDays: 30,
    maxDays: 60,
  },
  {
    name: 'last_chance',
    daysSinceLastVisit: 60,
    minDays: 60,
    maxDays: 90,
  },
]

/**
 * Send re-engagement emails to dormant users
 */
export async function sendReEngagementEmails(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  console.log('[Re-Engagement] Starting re-engagement campaign...')

  let sent = 0
  let skipped = 0
  let errors = 0

  const now = new Date()

  // Process each tier
  for (const tier of RE_ENGAGEMENT_TIERS) {
    const minDate = new Date(now.getTime() - tier.maxDays * 24 * 60 * 60 * 1000)
    const maxDate = new Date(now.getTime() - tier.minDays * 24 * 60 * 60 * 1000)

    console.log(`[Re-Engagement] Processing tier: ${tier.name} (${tier.minDays}-${tier.maxDays} days)`)

    // Find dormant users
    const dormantUsers = await prisma.user.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { role: 'USER' },
          { isOnboarded: true },
          { marketingEmailsConsent: true },
          { lastSeen: { gte: minDate, lte: maxDate } },
          // Exclude users who got re-engagement email recently
          {
            NOT: {
              receivedEmails: {
                some: {
                  type: 're_engagement',
                  sentAt: {
                    gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // Last 14 days
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        incomingSwipes: {
          where: {
            isLike: true,
            createdAt: {
              gte: maxDate, // New matches since they left
            },
          },
          take: 3,
          include: {
            swiper: {
              select: {
                id: true,
                name: true,
                birthDate: true,
                city: true,
                profileImage: true,
              },
            },
          },
        },
        messages: {
          where: {
            read: false,
            createdAt: {
              gte: maxDate,
            },
          },
        },
      },
      take: 50, // Limit batch size
    })

    console.log(`[Re-Engagement] Found ${dormantUsers.length} dormant users for tier ${tier.name}`)

    for (const user of dormantUsers) {
      try {
        // Check frequency limit
        const reachedLimit = await checkFrequencyLimit(user.id)
        if (reachedLimit) {
          skipped++
          continue
        }

        // Calculate days since last visit
        const daysSinceLastVisit = user.lastSeen
          ? Math.floor((now.getTime() - user.lastSeen.getTime()) / (24 * 60 * 60 * 1000))
          : tier.daysSinceLastVisit

        // Count new activity
        const newMatchesCount = user.incomingSwipes.length
        const newMessagesCount = user.messages.length

        // Get featured matches
        const featuredMatches = user.incomingSwipes.slice(0, 3).map((swipe) => {
          const swiper = swipe.swiper
          const age = swiper.birthDate
            ? new Date().getFullYear() - new Date(swiper.birthDate).getFullYear()
            : 0

          return {
            name: swiper.name || 'Iemand',
            age,
            photo: swiper.profileImage || 'https://via.placeholder.com/150',
            city: swiper.city || 'Nederland',
          }
        })

        // What's new features (can be customized per tier)
        const whatsNew =
          tier.name === 'come_back' || tier.name === 'last_chance'
            ? [
                'Verbeterde matching algoritme',
                'Nieuwe chat functies met voice berichten',
                'Meer leden in jouw regio',
              ]
            : []

        // Get personalized content
        const personalized = await getPersonalizedContent({
          userId: user.id,
          emailType: 're_engagement',
          userData: user,
        })

        // Render email
        const emailHtml = await render(
          ReEngagementEmail({
            userName: user.name || 'daar',
            daysSinceLastVisit,
            newMatchesCount,
            newMessagesCount,
            featuredMatches,
            whatsNew,
          })
        )

        const emailText = `
Welkom terug, ${user.name || 'daar'}!

Het is alweer ${daysSinceLastVisit} dagen geleden dat we je zagen.

${newMatchesCount > 0 ? `Je hebt ${newMatchesCount} nieuwe matches!` : ''}
${newMessagesCount > 0 ? `Je hebt ${newMessagesCount} nieuwe berichten!` : ''}

De liefde wacht niet. Kom terug naar Liefde Voor Iedereen!

${process.env.NEXT_PUBLIC_APP_URL}/discover

Liefde Voor Iedereen
        `.trim()

        // Send email
        await sendEmail({
          to: user.email!,
          subject: personalized.subjectLine,
          html: emailHtml,
          text: emailText,
        })

        // Log email
        await prisma.emailLog.create({
          data: {
            userId: user.id,
            email: user.email!,
            type: 're_engagement',
            category: 'engagement',
            subject: personalized.subjectLine,
            status: 'sent',
          },
        })

        sent++
        console.log(`[Re-Engagement] ✓ Sent ${tier.name} email to ${user.email}`)
      } catch (error) {
        console.error(`[Re-Engagement] ✗ Error sending to ${user.email}:`, error)
        errors++
      }

      // Rate limiting - small delay between sends
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  console.log(`[Re-Engagement] Complete: ${sent} sent, ${skipped} skipped, ${errors} errors`)

  return { sent, skipped, errors }
}

/**
 * Identify users at risk of churning (showing early signs of disengagement)
 */
export async function identifyChurnRisk(): Promise<string[]> {
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Users who were active but engagement dropped
  const atRisk = await prisma.user.findMany({
    where: {
      AND: [
        { lastSeen: { gte: sevenDaysAgo, lte: threeDaysAgo } }, // Active 3-7 days ago
        { role: 'USER' },
        {
          OR: [
            // No swipes in last 3 days
            {
              outgoingSwipes: {
                none: {
                  createdAt: { gte: threeDaysAgo },
                },
              },
            },
            // No messages in last 3 days
            {
              messages: {
                none: {
                  createdAt: { gte: threeDaysAgo },
                },
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
    },
  })

  console.log(`[Re-Engagement] Identified ${atRisk.length} users at churn risk`)

  return atRisk.map((u) => u.id)
}

/**
 * Send early intervention to users at risk of churning
 */
export async function sendChurnPreventionEmails(): Promise<{
  sent: number
  skipped: number
  errors: number
}> {
  console.log('[Re-Engagement] Starting churn prevention...')

  const atRiskIds = await identifyChurnRisk()

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const userId of atRiskIds) {
    try {
      // Get user with activity data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profileViewsReceived: {
            where: {
              viewedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
            take: 5,
            include: {
              viewer: {
                select: {
                  name: true,
                  birthDate: true,
                  city: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      })

      if (!user || !user.email || !user.marketingEmailsConsent) {
        skipped++
        continue
      }

      // Check frequency limit
      const reachedLimit = await checkFrequencyLimit(user.id)
      if (reachedLimit) {
        skipped++
        continue
      }

      const viewCount = user.profileViewsReceived.length

      // Only send if there's activity to show
      if (viewCount === 0) {
        skipped++
        continue
      }

      const personalized = await getPersonalizedContent({
        userId: user.id,
        emailType: 'daily_digest',
        userData: user,
      })

      // Use Daily Digest template for churn prevention
      const { default: DailyDigestEmail } = await import(
        '@/lib/email/templates/engagement/daily-digest'
      )

      const featuredViewer = user.profileViewsReceived[0]?.viewer
      let featuredVisitorData = undefined

      if (featuredViewer && featuredViewer.profileImage) {
        const age = featuredViewer.birthDate
          ? new Date().getFullYear() - new Date(featuredViewer.birthDate).getFullYear()
          : 0

        featuredVisitorData = {
          name: featuredViewer.name || 'Iemand',
          age,
          photo: featuredViewer.profileImage,
          city: featuredViewer.city || 'Nederland',
        }
      }

      const emailHtml = await render(
        DailyDigestEmail({
          userName: user.name || 'daar',
          newVisitsCount: viewCount,
          newLikesCount: 0,
          featuredVisitor: featuredVisitorData,
        })
      )

      const emailText = `
Hoi ${user.name || 'daar'},

Er is activiteit op je profiel! ${viewCount} mensen hebben naar je gekeken.

Kom terug en zie wie er interesse heeft!

${process.env.NEXT_PUBLIC_APP_URL}/dashboard/visitors

Liefde Voor Iedereen
      `.trim()

      await sendEmail({
        to: user.email,
        subject: `${user.name}, mensen kijken naar je profiel!`,
        html: emailHtml,
        text: emailText,
      })

      await prisma.emailLog.create({
        data: {
          userId: user.id,
          email: user.email,
          type: 'churn_prevention',
          category: 'engagement',
          subject: 'Churn prevention',
          status: 'sent',
        },
      })

      sent++
      console.log(`[Re-Engagement] ✓ Sent churn prevention to ${user.email}`)
    } catch (error) {
      console.error(`[Re-Engagement] ✗ Error in churn prevention:`, error)
      errors++
    }
  }

  console.log(`[Re-Engagement] Churn prevention complete: ${sent} sent, ${skipped} skipped, ${errors} errors`)

  return { sent, skipped, errors }
}
