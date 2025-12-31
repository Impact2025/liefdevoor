/**
 * Engagement Engine - World Class Email Automation
 *
 * Handles all engagement-related email campaigns:
 * - Match reminders (new match, no reply, inactive chat)
 * - Milestone celebrations
 * - Weekly summaries
 * - Super Like notifications
 * - Win-back campaigns (90+ days)
 */

import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { sendEmail } from '@/lib/email/send'
import { checkFrequencyLimit, getPersonalizedContent } from '@/lib/email/personalization'

// Import templates
import MatchReminderEmail from '@/lib/email/templates/engagement/match-reminder'
import MilestoneEmail from '@/lib/email/templates/engagement/milestone'
import WeeklySummaryEmail from '@/lib/email/templates/engagement/weekly-summary'
import WinBackEmail from '@/lib/email/templates/engagement/win-back'
import SuperLikeNotificationEmail from '@/lib/email/templates/transactional/super-like-notification'

// ============================================
// MATCH REMINDERS
// ============================================

interface MatchReminderResult {
  sent: number
  skipped: number
  errors: number
}

/**
 * Send reminders for new matches without first message
 */
export async function sendNewMatchReminders(): Promise<MatchReminderResult> {
  console.log('[Engagement] Starting new match reminders...')

  let sent = 0
  let skipped = 0
  let errors = 0

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

  // Find matches created 1-3 days ago with no messages
  const unmessagedMatches = await prisma.match.findMany({
    where: {
      createdAt: {
        gte: threeDaysAgo,
        lte: oneDayAgo,
      },
      messages: {
        none: {},
      },
    },
    include: {
      user1: {
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          marketingEmailsConsent: true,
          profileImage: true,
          birthDate: true,
          city: true,
        },
      },
      user2: {
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          marketingEmailsConsent: true,
          profileImage: true,
          birthDate: true,
          city: true,
        },
      },
    },
    take: 100,
  })

  console.log(`[Engagement] Found ${unmessagedMatches.length} unmessaged matches`)

  for (const match of unmessagedMatches) {
    // Send reminder to both users
    for (const [user, otherUser] of [[match.user1, match.user2], [match.user2, match.user1]]) {
      try {
        if (!user.email || !user.emailVerified || !user.marketingEmailsConsent) {
          skipped++
          continue
        }

        // Check if already sent reminder for this match
        const alreadySent = await prisma.emailLog.findFirst({
          where: {
            userId: user.id,
            type: 'match_reminder',
            sentAt: {
              gte: threeDaysAgo,
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

        const daysSinceMatch = Math.floor(
          (now.getTime() - match.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        )

        const otherAge = otherUser.birthDate
          ? new Date().getFullYear() - new Date(otherUser.birthDate).getFullYear()
          : 25

        const html = await render(
          MatchReminderEmail({
            userName: user.name || 'daar',
            matchName: otherUser.name || 'Je match',
            matchPhoto: otherUser.profileImage || 'https://via.placeholder.com/150',
            matchAge: otherAge,
            matchCity: otherUser.city || 'Nederland',
            daysSinceMatch,
            isFirstMessage: true,
            conversationType: 'new_match',
          })
        )

        await sendEmail({
          to: user.email,
          subject: `${otherUser.name || 'Je match'} wacht op je eerste bericht!`,
          html,
          text: `Hoi ${user.name}, jullie matchten ${daysSinceMatch} dagen geleden maar hebben nog niet gechat. Start het gesprek!`,
        })

        await prisma.emailLog.create({
          data: {
            userId: user.id,
            email: user.email,
            type: 'match_reminder',
            category: 'engagement',
            subject: 'Match reminder - new match',
            status: 'sent',
          },
        })

        sent++
      } catch (error) {
        console.error(`[Engagement] Error sending match reminder:`, error)
        errors++
      }
    }
  }

  console.log(`[Engagement] Match reminders: ${sent} sent, ${skipped} skipped, ${errors} errors`)
  return { sent, skipped, errors }
}

/**
 * Send reminders for unanswered messages
 */
export async function sendUnansweredMessageReminders(): Promise<MatchReminderResult> {
  console.log('[Engagement] Starting unanswered message reminders...')

  let sent = 0
  let skipped = 0
  let errors = 0

  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Find unread messages from 2-7 days ago
  const unreadMessages = await prisma.message.findMany({
    where: {
      read: false,
      createdAt: {
        gte: sevenDaysAgo,
        lte: twoDaysAgo,
      },
    },
    include: {
      match: {
        include: {
          user1: true,
          user2: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          birthDate: true,
          city: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })

  // Group by recipient
  const messagesByRecipient = new Map<string, typeof unreadMessages>()

  for (const message of unreadMessages) {
    const recipientId = message.match.user1Id === message.senderId
      ? message.match.user2Id
      : message.match.user1Id

    if (!messagesByRecipient.has(recipientId)) {
      messagesByRecipient.set(recipientId, [])
    }
    messagesByRecipient.get(recipientId)!.push(message)
  }

  console.log(`[Engagement] Found ${messagesByRecipient.size} users with unanswered messages`)

  for (const [recipientId, messages] of messagesByRecipient) {
    try {
      const recipient = messages[0].match.user1Id === recipientId
        ? messages[0].match.user1
        : messages[0].match.user2

      if (!recipient.email || !recipient.emailVerified || !recipient.marketingEmailsConsent) {
        skipped++
        continue
      }

      // Check if already sent reminder recently
      const alreadySent = await prisma.emailLog.findFirst({
        where: {
          userId: recipientId,
          type: 'unanswered_message_reminder',
          sentAt: {
            gte: twoDaysAgo,
          },
        },
      })

      if (alreadySent) {
        skipped++
        continue
      }

      const reachedLimit = await checkFrequencyLimit(recipientId)
      if (reachedLimit) {
        skipped++
        continue
      }

      const latestMessage = messages[0]
      const sender = latestMessage.sender

      const senderAge = sender.birthDate
        ? new Date().getFullYear() - new Date(sender.birthDate).getFullYear()
        : 25

      const daysSinceMessage = Math.floor(
        (now.getTime() - latestMessage.createdAt.getTime()) / (24 * 60 * 60 * 1000)
      )

      const html = await render(
        MatchReminderEmail({
          userName: recipient.name || 'daar',
          matchName: sender.name || 'Je match',
          matchPhoto: sender.profileImage || 'https://via.placeholder.com/150',
          matchAge: senderAge,
          matchCity: sender.city || 'Nederland',
          daysSinceMatch: daysSinceMessage,
          isFirstMessage: false,
          conversationType: 'no_reply',
          lastMessagePreview: latestMessage.content?.substring(0, 100),
        })
      )

      await sendEmail({
        to: recipient.email,
        subject: `${sender.name || 'Je match'} wacht nog op antwoord...`,
        html,
        text: `${sender.name} stuurde je ${daysSinceMessage} dagen geleden een bericht. Antwoord nu!`,
      })

      await prisma.emailLog.create({
        data: {
          userId: recipientId,
          email: recipient.email,
          type: 'unanswered_message_reminder',
          category: 'engagement',
          subject: 'Match reminder - unanswered',
          status: 'sent',
        },
      })

      sent++
    } catch (error) {
      console.error(`[Engagement] Error sending unanswered reminder:`, error)
      errors++
    }
  }

  console.log(`[Engagement] Unanswered reminders: ${sent} sent, ${skipped} skipped, ${errors} errors`)
  return { sent, skipped, errors }
}

/**
 * Send reminders for inactive conversations (both sides quiet)
 */
export async function sendInactiveConversationReminders(): Promise<MatchReminderResult> {
  console.log('[Engagement] Starting inactive conversation reminders...')

  let sent = 0
  let skipped = 0
  let errors = 0

  const now = new Date()
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Find matches with messages but last message 5-14 days ago
  const inactiveMatches = await prisma.match.findMany({
    where: {
      messages: {
        some: {
          createdAt: {
            lt: fiveDaysAgo,
          },
        },
      },
    },
    include: {
      user1: true,
      user2: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    take: 100,
  })

  // Filter to those with last message 5-14 days ago
  const relevantMatches = inactiveMatches.filter(match => {
    const lastMessage = match.messages[0]
    if (!lastMessage) return false
    return lastMessage.createdAt >= fourteenDaysAgo && lastMessage.createdAt <= fiveDaysAgo
  })

  console.log(`[Engagement] Found ${relevantMatches.length} inactive conversations`)

  for (const match of relevantMatches) {
    // Send to both users
    for (const user of [match.user1, match.user2]) {
      try {
        const otherUser = user.id === match.user1Id ? match.user2 : match.user1

        if (!user.email || !user.emailVerified || !user.marketingEmailsConsent) {
          skipped++
          continue
        }

        const alreadySent = await prisma.emailLog.findFirst({
          where: {
            userId: user.id,
            type: 'inactive_conversation_reminder',
            sentAt: { gte: fiveDaysAgo },
          },
        })

        if (alreadySent) {
          skipped++
          continue
        }

        const reachedLimit = await checkFrequencyLimit(user.id)
        if (reachedLimit) {
          skipped++
          continue
        }

        const lastMessage = match.messages[0]
        const daysSinceActivity = Math.floor(
          (now.getTime() - lastMessage.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        )

        const otherAge = otherUser.birthDate
          ? new Date().getFullYear() - new Date(otherUser.birthDate).getFullYear()
          : 25

        const html = await render(
          MatchReminderEmail({
            userName: user.name || 'daar',
            matchName: otherUser.name || 'Je match',
            matchPhoto: otherUser.profileImage || 'https://via.placeholder.com/150',
            matchAge: otherAge,
            matchCity: otherUser.city || 'Nederland',
            daysSinceMatch: daysSinceActivity,
            isFirstMessage: false,
            conversationType: 'inactive_chat',
          })
        )

        await sendEmail({
          to: user.email,
          subject: `Jullie gesprek met ${otherUser.name || 'je match'} is stil gevallen`,
          html,
          text: `Het is ${daysSinceActivity} dagen stil in jullie chat. Stuur een berichtje!`,
        })

        await prisma.emailLog.create({
          data: {
            userId: user.id,
            email: user.email,
            type: 'inactive_conversation_reminder',
            category: 'engagement',
            subject: 'Match reminder - inactive',
            status: 'sent',
          },
        })

        sent++
      } catch (error) {
        console.error(`[Engagement] Error sending inactive reminder:`, error)
        errors++
      }
    }
  }

  console.log(`[Engagement] Inactive reminders: ${sent} sent, ${skipped} skipped, ${errors} errors`)
  return { sent, skipped, errors }
}

// ============================================
// MILESTONES
// ============================================

type MilestoneType =
  | 'first_match'
  | 'five_matches'
  | 'ten_matches'
  | 'twentyfive_matches'
  | 'fifty_matches'
  | 'first_message_sent'
  | 'first_message_received'
  | 'profile_complete'
  | 'one_week_active'
  | 'one_month_active'
  | 'first_super_like'
  | 'verified_profile'

/**
 * Check and send milestone emails for a user
 */
export async function checkAndSendMilestoneEmail(
  userId: string,
  milestoneType: MilestoneType
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        marketingEmailsConsent: true,
      },
    })

    if (!user || !user.email || !user.emailVerified || !user.marketingEmailsConsent) {
      return false
    }

    // Check if already sent this milestone
    const alreadySent = await prisma.emailLog.findFirst({
      where: {
        userId,
        type: `milestone_${milestoneType}`,
      },
    })

    if (alreadySent) {
      return false
    }

    // Get stats for email
    const [matchCount, messageCount] = await Promise.all([
      prisma.match.count({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
      }),
      prisma.message.count({
        where: { senderId: userId },
      }),
    ])

    const stats = [
      { label: 'Matches', value: matchCount.toString() },
      { label: 'Berichten', value: messageCount.toString() },
    ]

    const nextMilestoneMap: Record<MilestoneType, string | undefined> = {
      first_match: '5 matches',
      five_matches: '10 matches',
      ten_matches: '25 matches',
      twentyfive_matches: '50 matches',
      fifty_matches: '100 matches',
      first_message_sent: undefined,
      first_message_received: undefined,
      profile_complete: undefined,
      one_week_active: '1 maand actief',
      one_month_active: undefined,
      first_super_like: undefined,
      verified_profile: undefined,
    }

    const tips = [
      'Voeg meer foto\'s toe aan je profiel',
      'Schrijf een pakkende bio',
      'Reageer snel op berichten',
    ]

    const html = await render(
      MilestoneEmail({
        userName: user.name || 'daar',
        milestoneType,
        stats,
        nextMilestone: nextMilestoneMap[milestoneType],
        tips,
      })
    )

    await sendEmail({
      to: user.email,
      subject: `🎉 Milestone bereikt!`,
      html,
      text: `Gefeliciteerd! Je hebt een nieuwe milestone bereikt op Liefde Voor Iedereen!`,
    })

    await prisma.emailLog.create({
      data: {
        userId,
        email: user.email,
        type: `milestone_${milestoneType}`,
        category: 'engagement',
        subject: `Milestone: ${milestoneType}`,
        status: 'sent',
      },
    })

    console.log(`[Engagement] ✓ Sent milestone ${milestoneType} to ${user.email}`)
    return true
  } catch (error) {
    console.error(`[Engagement] Error sending milestone email:`, error)
    return false
  }
}

// ============================================
// WEEKLY SUMMARY
// ============================================

/**
 * Send weekly summary emails (run on Sunday)
 */
export async function sendWeeklySummaries(): Promise<MatchReminderResult> {
  console.log('[Engagement] Starting weekly summaries...')

  let sent = 0
  let skipped = 0
  let errors = 0

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Get week number
  const weekNumber = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
  )

  // Get active users from past 2 weeks
  const activeUsers = await prisma.user.findMany({
    where: {
      role: 'USER',
      isOnboarded: true,
      lastSeen: {
        gte: twoWeeksAgo,
      },
      email: { not: null },
      emailVerified: { not: null },
      marketingEmailsConsent: true,
    },
    take: 500,
  })

  console.log(`[Engagement] Processing ${activeUsers.length} active users for weekly summary`)

  for (const user of activeUsers) {
    try {
      // Check if already sent this week
      const alreadySent = await prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'weekly_summary',
          sentAt: { gte: oneWeekAgo },
        },
      })

      if (alreadySent) {
        skipped++
        continue
      }

      const reachedLimit = await checkFrequencyLimit(user.id)
      if (reachedLimit) {
        skipped++
        continue
      }

      // Get this week's stats
      const [
        profileViewsThisWeek,
        profileViewsLastWeek,
        likesThisWeek,
        likesLastWeek,
        newMatches,
        messagesSent,
        messagesReceived,
        topViewers,
      ] = await Promise.all([
        prisma.profileView.count({
          where: { viewedId: user.id, viewedAt: { gte: oneWeekAgo } },
        }),
        prisma.profileView.count({
          where: { viewedId: user.id, viewedAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
        }),
        prisma.swipe.count({
          where: { swipedId: user.id, isLike: true, createdAt: { gte: oneWeekAgo } },
        }),
        prisma.swipe.count({
          where: { swipedId: user.id, isLike: true, createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } },
        }),
        prisma.match.count({
          where: {
            OR: [{ user1Id: user.id }, { user2Id: user.id }],
            createdAt: { gte: oneWeekAgo },
          },
        }),
        prisma.message.count({
          where: { senderId: user.id, createdAt: { gte: oneWeekAgo } },
        }),
        prisma.message.count({
          where: {
            match: {
              OR: [{ user1Id: user.id }, { user2Id: user.id }],
            },
            senderId: { not: user.id },
            createdAt: { gte: oneWeekAgo },
          },
        }),
        prisma.profileView.findMany({
          where: { viewedId: user.id, viewedAt: { gte: oneWeekAgo } },
          include: {
            viewer: {
              select: { name: true, birthDate: true, profileImage: true, city: true },
            },
          },
          orderBy: { viewedAt: 'desc' },
          take: 3,
        }),
      ])

      // Calculate changes
      const profileViewsChange = profileViewsLastWeek > 0
        ? Math.round(((profileViewsThisWeek - profileViewsLastWeek) / profileViewsLastWeek) * 100)
        : 0

      const likesChange = likesLastWeek > 0
        ? Math.round(((likesThisWeek - likesLastWeek) / likesLastWeek) * 100)
        : 0

      // Get unread messages count
      const unreadMessages = await prisma.message.count({
        where: {
          match: {
            OR: [{ user1Id: user.id }, { user2Id: user.id }],
          },
          senderId: { not: user.id },
          read: false,
        },
      })

      // Get unmatched likes
      const unmatchedLikes = await prisma.swipe.count({
        where: {
          swipedId: user.id,
          isLike: true,
          swiped: {
            outgoingSwipes: {
              none: {
                swipedId: user.id,
              },
            },
          },
        },
      })

      const formattedViewers = topViewers.map(view => ({
        name: view.viewer.name || 'Iemand',
        age: view.viewer.birthDate
          ? new Date().getFullYear() - new Date(view.viewer.birthDate).getFullYear()
          : 25,
        photo: view.viewer.profileImage || 'https://via.placeholder.com/60',
        city: view.viewer.city || 'Nederland',
      }))

      // Generate tips based on activity
      const tips: string[] = []
      if (messagesSent < 3) {
        tips.push('Stuur wat meer berichten - actieve chatters hebben 40% meer kans op een date')
      }
      if (profileViewsThisWeek < 5) {
        tips.push('Update je profiel foto\'s voor meer zichtbaarheid')
      }
      if (newMatches > 0 && messagesSent === 0) {
        tips.push('Je hebt nieuwe matches - vergeet niet te chatten!')
      }

      // Highlight message
      let highlightMessage: string | undefined
      if (newMatches > 5) {
        highlightMessage = `Wow, ${newMatches} nieuwe matches deze week! Je bent on fire! 🔥`
      } else if (likesThisWeek > 10) {
        highlightMessage = `${likesThisWeek} mensen hebben je geliked - je bent populair!`
      }

      const html = await render(
        WeeklySummaryEmail({
          userName: user.name || 'daar',
          weekNumber,
          stats: {
            profileViews: profileViewsThisWeek,
            profileViewsChange,
            likesReceived: likesThisWeek,
            likesReceivedChange: likesChange,
            newMatches,
            messagesSent,
            messagesReceived,
          },
          topViewers: formattedViewers,
          unmatchedLikes,
          unreadMessages,
          tips,
          highlightMessage,
        })
      )

      await sendEmail({
        to: user.email!,
        subject: `📊 Je week in cijfers: ${profileViewsThisWeek} bezoeken, ${newMatches} matches`,
        html,
        text: `Hoi ${user.name}, hier is je weekoverzicht!`,
      })

      await prisma.emailLog.create({
        data: {
          userId: user.id,
          email: user.email!,
          type: 'weekly_summary',
          category: 'engagement',
          subject: 'Weekly summary',
          status: 'sent',
        },
      })

      sent++
    } catch (error) {
      console.error(`[Engagement] Error sending weekly summary:`, error)
      errors++
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`[Engagement] Weekly summaries: ${sent} sent, ${skipped} skipped, ${errors} errors`)
  return { sent, skipped, errors }
}

// ============================================
// WIN-BACK CAMPAIGN (90+ DAYS)
// ============================================

/**
 * Send win-back emails to users inactive 90+ days
 */
export async function sendWinBackEmails(): Promise<MatchReminderResult> {
  console.log('[Engagement] Starting win-back campaign (90+ days)...')

  let sent = 0
  let skipped = 0
  let errors = 0

  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

  // Find users inactive 90-180 days
  const dormantUsers = await prisma.user.findMany({
    where: {
      role: 'USER',
      isOnboarded: true,
      lastSeen: {
        gte: sixMonthsAgo,
        lte: ninetyDaysAgo,
      },
      email: { not: null },
      emailVerified: { not: null },
      marketingEmailsConsent: true,
    },
    take: 100,
  })

  console.log(`[Engagement] Found ${dormantUsers.length} users for win-back (90+ days)`)

  // Check for active coupon or create special offer
  const specialOffer = {
    discount: 30,
    code: 'WELKOMTERUG',
    expiresIn: '7 dagen',
  }

  const newFeatures = [
    'Nieuwe voice berichten functie',
    'Verbeterde matchmaking algoritme',
    'Vibe Check - check of jullie klikken na 3 dagen chatten',
    'Stories - deel je dag zoals op Instagram',
  ]

  const successStories = [
    {
      name: 'Lisa & Thomas',
      quote: 'We matchten 3 maanden geleden en zijn nu al samenwonend. Dankjewel Liefde Voor Iedereen!',
    },
  ]

  for (const user of dormantUsers) {
    try {
      // Check if already sent win-back in last 30 days
      const alreadySent = await prisma.emailLog.findFirst({
        where: {
          userId: user.id,
          type: 'win_back',
          sentAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      })

      if (alreadySent) {
        skipped++
        continue
      }

      const daysSinceLastVisit = user.lastSeen
        ? Math.floor((now.getTime() - user.lastSeen.getTime()) / (24 * 60 * 60 * 1000))
        : 90

      const personalizedMessage = daysSinceLastVisit > 120
        ? `We begrijpen het - dating kan vermoeiend zijn. Maar er is zoveel veranderd sinds je weg was! Geef het nog een kans?`
        : `Het is al ${daysSinceLastVisit} dagen geleden. We hebben je gemist! Er wachten potentiële matches op je.`

      const html = await render(
        WinBackEmail({
          userName: user.name || 'daar',
          daysSinceLastVisit,
          specialOffer,
          newFeatures,
          successStories,
          personalizedMessage,
        })
      )

      await sendEmail({
        to: user.email!,
        subject: `${user.name}, we missen je! Kom terug met 30% korting 💕`,
        html,
        text: `Hoi ${user.name}, het is ${daysSinceLastVisit} dagen geleden. Kom terug met code WELKOMTERUG voor 30% korting!`,
      })

      await prisma.emailLog.create({
        data: {
          userId: user.id,
          email: user.email!,
          type: 'win_back',
          category: 'engagement',
          subject: 'Win-back 90+ days',
          status: 'sent',
        },
      })

      sent++
      console.log(`[Engagement] ✓ Sent win-back to ${user.email}`)
    } catch (error) {
      console.error(`[Engagement] Error sending win-back:`, error)
      errors++
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`[Engagement] Win-back: ${sent} sent, ${skipped} skipped, ${errors} errors`)
  return { sent, skipped, errors }
}

// ============================================
// SUPER LIKE NOTIFICATION
// ============================================

/**
 * Send Super Like notification email
 */
export async function sendSuperLikeNotification(params: {
  recipientId: string
  senderId: string
  personalMessage?: string
}): Promise<boolean> {
  try {
    const [recipient, sender] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.recipientId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          marketingEmailsConsent: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: params.senderId },
        select: {
          id: true,
          name: true,
          profileImage: true,
          birthDate: true,
          city: true,
          bio: true,
        },
      }),
    ])

    if (!recipient || !recipient.email || !recipient.emailVerified) {
      return false
    }

    const senderAge = sender?.birthDate
      ? new Date().getFullYear() - new Date(sender.birthDate).getFullYear()
      : 25

    const html = await render(
      SuperLikeNotificationEmail({
        userName: recipient.name || 'daar',
        senderName: sender?.name || 'Iemand',
        senderAge,
        senderPhoto: sender?.profileImage || 'https://via.placeholder.com/150',
        senderCity: sender?.city || 'Nederland',
        senderBio: sender?.bio?.substring(0, 150),
        personalMessage: params.personalMessage,
      })
    )

    await sendEmail({
      to: recipient.email,
      subject: `💝 ${sender?.name || 'Iemand'} heeft je een Super Like gegeven!`,
      html,
      text: `${sender?.name} vindt jou echt bijzonder en heeft je een Super Like gegeven!`,
    })

    await prisma.emailLog.create({
      data: {
        userId: recipient.id,
        email: recipient.email,
        type: 'super_like_notification',
        category: 'transactional',
        subject: 'Super Like notification',
        status: 'sent',
      },
    })

    console.log(`[Engagement] ✓ Sent Super Like notification to ${recipient.email}`)
    return true
  } catch (error) {
    console.error(`[Engagement] Error sending Super Like notification:`, error)
    return false
  }
}
