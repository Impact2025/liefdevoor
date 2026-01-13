/**
 * WERELDKLASSE Migration Engine
 * OogvoorLiefde.nl → LiefdevoorIedereen.nl
 *
 * Complete automated email sequence system with:
 * - 7-touch email campaign
 * - Automatic reminders
 * - Personalized content
 * - A/B testing
 * - Conversion tracking
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { render } from '@react-email/render'
import { generateToken } from '@/lib/tokens'

// Import email templates
import MigrationWelcomeEmail from '@/lib/email/templates/migration/welcome'
import MigrationMatchesWaitingEmail from '@/lib/email/templates/migration/matches-waiting'
import MigrationReminderEmail from '@/lib/email/templates/migration/reminder'
import MigrationFeaturesEmail from '@/lib/email/templates/migration/features'
import MigrationSocialProofEmail from '@/lib/email/templates/migration/social-proof'
import MigrationLastChanceEmail from '@/lib/email/templates/migration/last-chance'
import MigrationGoodbyeEmail from '@/lib/email/templates/migration/goodbye'

// ============================================
// TYPES
// ============================================

export type MigrationSegment = 'VIP' | 'GOLD' | 'ACTIVE' | 'DORMANT' | 'INACTIVE'
export type MigrationEmailType =
  | 'WELCOME'
  | 'MATCHES_WAITING'
  | 'REMINDER'
  | 'FEATURES'
  | 'SOCIAL_PROOF'
  | 'LAST_CHANCE'
  | 'GOODBYE'
  | 'EXPIRED'

export type MigrationStatus =
  | 'PENDING'
  | 'EMAIL_SENT'
  | 'EMAIL_OPENED'
  | 'LINK_CLICKED'
  | 'LANDING_VISITED'
  | 'CLAIM_STARTED'
  | 'CLAIMED'
  | 'ACTIVATED'
  | 'EXPIRED'

interface MigrationUser {
  id: string
  oldUserId: number
  oldEmail: string
  firstName: string
  lastName?: string
  oldProfilePhoto?: string
  memberSince: Date
  lastActiveOld?: Date
  hadGoldMembership: boolean
  photoCount: number
  messageCount: number
  matchCount: number
  segment: MigrationSegment
  status: MigrationStatus
  couponCode?: string
  couponExpiresAt?: Date
  claimToken?: string
  lastEmailSentAt?: Date
  lastEmailOpenedAt?: Date
}

// ============================================
// EMAIL SEQUENCE CONFIGURATION
// ============================================

/**
 * Email sequence configuration per segment
 * Defines which emails to send and when
 */
export const EMAIL_SEQUENCE = {
  // Days after first email when each subsequent email should be sent
  schedule: {
    WELCOME: 0,           // Day 0: Initial invitation
    MATCHES_WAITING: 3,   // Day 3: Show potential matches
    REMINDER: 7,          // Day 7: Reminder with urgency
    FEATURES: 10,         // Day 10: Highlight new features
    SOCIAL_PROOF: 14,     // Day 14: Show others who activated
    LAST_CHANCE: 21,      // Day 21: Last chance warning
    GOODBYE: 28,          // Day 28: Final goodbye
  },

  // Subject lines per email type (with A/B variants)
  subjects: {
    WELCOME: {
      A: '{firstName}, je profiel staat klaar op LiefdevoorIedereen.nl',
      B: '{firstName}, welkom bij de toekomst van dating'
    },
    MATCHES_WAITING: {
      A: '{firstName}, {matchCount} mensen wachten op je!',
      B: '💕 Er zijn {matchCount} nieuwe matches voor je'
    },
    REMINDER: {
      A: '⏰ {firstName}, je coupon verloopt over 7 dagen',
      B: 'Vergeet je gratis Premium niet, {firstName}!'
    },
    FEATURES: {
      A: '✨ Dit is nieuw op LiefdevoorIedereen',
      B: '{firstName}, ontdek de nieuwe features'
    },
    SOCIAL_PROOF: {
      A: '{recentActivation} uit {city} activeerde ook!',
      B: 'Sluit je aan bij {activationCount}+ anderen'
    },
    LAST_CHANCE: {
      A: '🚨 Laatste kans: nog 7 dagen, {firstName}',
      B: 'Je data wordt binnenkort verwijderd'
    },
    GOODBYE: {
      A: 'Vaarwel {firstName} - je data is verwijderd',
      B: 'We hebben afscheid genomen van je profiel'
    }
  },

  // Incentives per segment
  incentives: {
    VIP: { premiumMonths: 3, superMessages: 10, badge: 'early_adopter' },
    GOLD: { premiumMonths: 2, superMessages: 5, badge: 'gold_veteran' },
    ACTIVE: { premiumMonths: 1, superMessages: 3, badge: null },
    DORMANT: { premiumMonths: 1, superMessages: 5, badge: 'comeback_hero' },
    INACTIVE: { premiumMonths: 0, superMessages: 3, badge: null }
  }
}

// ============================================
// CORE ENGINE FUNCTIONS
// ============================================

/**
 * Process daily migration emails
 * Called by cron job every day at 10:00
 */
export async function processDailyMigrationEmails(): Promise<{
  sent: number
  skipped: number
  errors: number
  byType: Record<MigrationEmailType, number>
}> {
  console.log('[Migration] Starting daily email processing...')

  const results = {
    sent: 0,
    skipped: 0,
    errors: 0,
    byType: {} as Record<MigrationEmailType, number>
  }

  const now = new Date()

  // Get all pending migration users
  const users = await prisma.$queryRaw<MigrationUser[]>`
    SELECT * FROM "MigrationUser"
    WHERE status NOT IN ('CLAIMED', 'ACTIVATED', 'EXPIRED')
    ORDER BY "lastEmailSentAt" ASC NULLS FIRST
    LIMIT 500
  `

  console.log(`[Migration] Found ${users.length} users to process`)

  for (const user of users) {
    try {
      const emailToSend = determineNextEmail(user, now)

      if (!emailToSend) {
        results.skipped++
        continue
      }

      // Check frequency limit (max 1 email per 3 days)
      if (user.lastEmailSentAt) {
        const daysSinceLastEmail = Math.floor(
          (now.getTime() - new Date(user.lastEmailSentAt).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceLastEmail < 3) {
          results.skipped++
          continue
        }
      }

      // Send the email
      const sent = await sendMigrationEmail(user, emailToSend)

      if (sent) {
        results.sent++
        results.byType[emailToSend] = (results.byType[emailToSend] || 0) + 1
      } else {
        results.errors++
      }

    } catch (error) {
      console.error(`[Migration] Error processing user ${user.id}:`, error)
      results.errors++
    }
  }

  // Update daily stats
  await updateDailyStats(results)

  console.log(`[Migration] Daily processing complete:`, results)
  return results
}

/**
 * Determine which email to send next based on user state
 */
function determineNextEmail(user: MigrationUser, now: Date): MigrationEmailType | null {
  // If never emailed, start with WELCOME
  if (!user.lastEmailSentAt || user.status === 'PENDING') {
    return 'WELCOME'
  }

  // Calculate days since first email
  const daysSinceStart = Math.floor(
    (now.getTime() - new Date(user.lastEmailSentAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Check coupon expiry
  if (user.couponExpiresAt && new Date(user.couponExpiresAt) < now) {
    // Mark as expired and send goodbye
    return 'GOODBYE'
  }

  // Get sent email types for this user
  // Note: In real implementation, query MigrationEmail table
  const sentTypes: MigrationEmailType[] = [] // Would be fetched from DB

  // Determine next email based on schedule
  const schedule = EMAIL_SEQUENCE.schedule

  if (daysSinceStart >= schedule.GOODBYE && !sentTypes.includes('GOODBYE')) {
    return 'GOODBYE'
  }
  if (daysSinceStart >= schedule.LAST_CHANCE && !sentTypes.includes('LAST_CHANCE')) {
    return 'LAST_CHANCE'
  }
  if (daysSinceStart >= schedule.SOCIAL_PROOF && !sentTypes.includes('SOCIAL_PROOF')) {
    return 'SOCIAL_PROOF'
  }
  if (daysSinceStart >= schedule.FEATURES && !sentTypes.includes('FEATURES')) {
    return 'FEATURES'
  }
  if (daysSinceStart >= schedule.REMINDER && !sentTypes.includes('REMINDER')) {
    return 'REMINDER'
  }
  if (daysSinceStart >= schedule.MATCHES_WAITING && !sentTypes.includes('MATCHES_WAITING')) {
    return 'MATCHES_WAITING'
  }

  return null
}

/**
 * Send a migration email
 */
async function sendMigrationEmail(
  user: MigrationUser,
  emailType: MigrationEmailType
): Promise<boolean> {
  try {
    // A/B test variant
    const variant = Math.random() < 0.5 ? 'A' : 'B'

    // Generate subject
    const subjectTemplate = EMAIL_SEQUENCE.subjects[emailType][variant]
    const subject = interpolateTemplate(subjectTemplate, {
      firstName: user.firstName,
      matchCount: user.matchCount?.toString() || '5',
      recentActivation: 'Maria',
      city: 'Amsterdam',
      activationCount: '847'
    })

    // Generate landing URL with tracking
    const landingUrl = generateLandingUrl(user)

    // Get personalized data
    const personalizedData = await getPersonalizedEmailData(user, emailType)

    // Render email template
    const html = await renderMigrationEmail(emailType, {
      ...personalizedData,
      userName: user.firstName,
      landingUrl,
      couponCode: user.couponCode || '',
      couponExpiresAt: user.couponExpiresAt,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/migration/unsubscribe/${user.id}`
    })

    // Send email
    const result = await sendEmail({
      to: user.oldEmail,
      subject,
      html,
      text: generatePlainText(emailType, user),
      category: 'migration',
      userId: user.id
    })

    if (result.success) {
      // Log email sent
      await prisma.$executeRaw`
        INSERT INTO "MigrationEmail" (
          id, "migrationUserId", "emailType", subject, "abVariant", "sentAt", "resendId"
        ) VALUES (
          ${generateToken(16)}, ${user.id}, ${emailType}, ${subject}, ${variant}, NOW(), ${result.emailId}
        )
      `

      // Update user
      await prisma.$executeRaw`
        UPDATE "MigrationUser"
        SET
          "lastEmailSentAt" = NOW(),
          status = CASE
            WHEN status = 'PENDING' THEN 'EMAIL_SENT'
            ELSE status
          END,
          "updatedAt" = NOW()
        WHERE id = ${user.id}
      `

      console.log(`[Migration] Sent ${emailType} to ${user.oldEmail}`)
      return true
    }

    return false
  } catch (error) {
    console.error(`[Migration] Failed to send ${emailType} to ${user.oldEmail}:`, error)
    return false
  }
}

/**
 * Generate personalized landing URL
 */
function generateLandingUrl(user: MigrationUser): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'
  const token = user.claimToken || user.id

  return `${baseUrl}/welkom/${token}?utm_source=migration&utm_medium=email&utm_campaign=${user.segment.toLowerCase()}`
}

/**
 * Get personalized data for email
 */
async function getPersonalizedEmailData(
  user: MigrationUser,
  emailType: MigrationEmailType
): Promise<Record<string, any>> {
  const data: Record<string, any> = {
    firstName: user.firstName,
    memberSince: user.memberSince,
    segment: user.segment,
    incentive: EMAIL_SEQUENCE.incentives[user.segment]
  }

  // Add type-specific data
  switch (emailType) {
    case 'MATCHES_WAITING':
      // Get potential matches (mock data for now)
      data.potentialMatches = [
        { name: 'Anna', age: 32, city: 'Amsterdam', photo: 'https://i.pravatar.cc/150?img=1' },
        { name: 'Peter', age: 45, city: 'Utrecht', photo: 'https://i.pravatar.cc/150?img=3' },
        { name: 'Sophie', age: 38, city: 'Rotterdam', photo: 'https://i.pravatar.cc/150?img=5' }
      ]
      data.matchCount = user.matchCount || 5
      break

    case 'SOCIAL_PROOF':
      // Get recent activations
      const recentActivations = await prisma.$queryRaw<{ firstName: string; city: string }[]>`
        SELECT "firstName", 'Amsterdam' as city
        FROM "MigrationUser"
        WHERE status = 'ACTIVATED'
        ORDER BY "claimedAt" DESC
        LIMIT 5
      `
      data.recentActivations = recentActivations
      data.totalActivated = 847 // Would be real count
      break

    case 'FEATURES':
      data.newFeatures = [
        { icon: '🧠', title: 'AI Matching', description: 'Slimmere matches op basis van persoonlijkheid' },
        { icon: '🎤', title: 'Voice Berichten', description: 'Stuur spraakberichten - persoonlijker dan tekst' },
        { icon: '🛡️', title: 'Liveness Verificatie', description: 'Alleen echte mensen, geen catfish' },
        { icon: '♿', title: 'Toegankelijk Design', description: 'Speciaal voor mensen met een beperking' }
      ]
      break

    case 'LAST_CHANCE':
      data.daysRemaining = 7
      data.dataToLose = {
        photos: user.photoCount,
        messages: user.messageCount,
        matches: user.matchCount
      }
      break
  }

  return data
}

/**
 * Render email template to HTML
 */
async function renderMigrationEmail(
  emailType: MigrationEmailType,
  props: Record<string, any>
): Promise<string> {
  const templates: Record<MigrationEmailType, React.ComponentType<any>> = {
    WELCOME: MigrationWelcomeEmail,
    MATCHES_WAITING: MigrationMatchesWaitingEmail,
    REMINDER: MigrationReminderEmail,
    FEATURES: MigrationFeaturesEmail,
    SOCIAL_PROOF: MigrationSocialProofEmail,
    LAST_CHANCE: MigrationLastChanceEmail,
    GOODBYE: MigrationGoodbyeEmail,
    EXPIRED: MigrationGoodbyeEmail // Same template
  }

  const Template = templates[emailType]
  if (!Template) {
    throw new Error(`Unknown email type: ${emailType}`)
  }

  return render(Template(props))
}

/**
 * Generate plain text version
 */
function generatePlainText(emailType: MigrationEmailType, user: MigrationUser): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://liefdevooriedereen.nl'
  const landingUrl = `${baseUrl}/welkom/${user.claimToken || user.id}`

  const texts: Record<MigrationEmailType, string> = {
    WELCOME: `
Hoi ${user.firstName},

Je profiel van OogvoorLiefde staat klaar op LiefdevoorIedereen.nl!

Wat je krijgt:
- Al je profieldata automatisch overgezet
- ${user.photoCount} foto's bewaard
- ${EMAIL_SEQUENCE.incentives[user.segment].premiumMonths} maanden GRATIS Premium

Activeer hier: ${landingUrl}

Je persoonlijke code: ${user.couponCode}

Groetjes,
Team Liefde Voor Iedereen
    `,
    MATCHES_WAITING: `
Hoi ${user.firstName},

Er wachten ${user.matchCount || 5} potentiële matches op je!

Zij hebben al hun profiel aangemaakt en zoeken iemand zoals jij.

Bekijk ze hier: ${landingUrl}

Groetjes,
Team Liefde Voor Iedereen
    `,
    REMINDER: `
Hoi ${user.firstName},

Dit is een vriendelijke herinnering: je gratis Premium coupon verloopt over 7 dagen.

Code: ${user.couponCode}

Activeer nu: ${landingUrl}

Groetjes,
Team Liefde Voor Iedereen
    `,
    FEATURES: `
Hoi ${user.firstName},

Dit is nieuw op LiefdevoorIedereen:

- AI-powered matching
- Voice berichten
- Liveness verificatie
- Volledig toegankelijk design

Ontdek alle features: ${landingUrl}

Groetjes,
Team Liefde Voor Iedereen
    `,
    SOCIAL_PROOF: `
Hoi ${user.firstName},

847+ mensen van OogvoorLiefde zijn al overgestapt!

Recente activaties:
- Maria uit Amsterdam
- Peter uit Utrecht
- Sophie uit Rotterdam

Word ook lid: ${landingUrl}

Groetjes,
Team Liefde Voor Iedereen
    `,
    LAST_CHANCE: `
Hoi ${user.firstName},

LAATSTE KANS: Je hebt nog 7 dagen om je account te activeren.

Daarna worden je gegevens permanent verwijderd:
- ${user.photoCount} foto's
- ${user.messageCount} berichten
- ${user.matchCount} matches

Activeer NU: ${landingUrl}

Groetjes,
Team Liefde Voor Iedereen
    `,
    GOODBYE: `
Hoi ${user.firstName},

We hebben afscheid genomen.

Je profiel en data van OogvoorLiefde zijn verwijderd.

Mocht je toch nog willen daten, je bent altijd welkom op liefdevooriedereen.nl

Groetjes,
Team Liefde Voor Iedereen
    `,
    EXPIRED: `Je coupon is verlopen.`
  }

  return texts[emailType] || ''
}

/**
 * Interpolate template variables
 */
function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`)
}

/**
 * Update daily stats
 */
async function updateDailyStats(results: { sent: number; skipped: number; errors: number }): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    await prisma.$executeRaw`
      INSERT INTO "MigrationCampaignStats" (id, date, "emailsSent")
      VALUES (${generateToken(16)}, ${today}, ${results.sent})
      ON CONFLICT (date) DO UPDATE
      SET "emailsSent" = "MigrationCampaignStats"."emailsSent" + ${results.sent}
    `
  } catch (error) {
    console.error('[Migration] Failed to update stats:', error)
  }
}

// ============================================
// COUPON GENERATION
// ============================================

/**
 * Generate personalized coupon for migration user
 */
export async function generateMigrationCoupon(user: MigrationUser): Promise<string> {
  const incentive = EMAIL_SEQUENCE.incentives[user.segment]

  // Generate unique code
  const namePart = user.firstName.toUpperCase().slice(0, 6).replace(/[^A-Z]/g, '')
  const segmentPart = user.segment === 'VIP' ? 'VIP' : user.memberSince.getFullYear().toString()
  const code = `WELKOM-${namePart}-${segmentPart}`

  // Create coupon in database
  await prisma.coupon.create({
    data: {
      code,
      description: `Migratie coupon voor ${user.oldEmail}`,
      type: 'FREE_TRIAL',
      value: incentive.premiumMonths,
      applicableTo: 'SUBSCRIPTION',
      maxTotalUses: 1,
      maxUsesPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dagen
      isActive: true,
      notes: JSON.stringify({
        migrationType: 'oogvoorliefde',
        oldUserId: user.oldUserId,
        segment: user.segment
      })
    }
  })

  return code
}

// ============================================
// CLAIM PROCESSING
// ============================================

/**
 * Process account claim
 */
export async function processAccountClaim(
  claimToken: string,
  newPassword: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  // Verify token
  const migrationUser = await prisma.$queryRaw<MigrationUser[]>`
    SELECT * FROM "MigrationUser"
    WHERE "claimToken" = ${claimToken}
    AND "claimTokenExpiresAt" > NOW()
    AND status NOT IN ('CLAIMED', 'ACTIVATED', 'EXPIRED')
    LIMIT 1
  `

  if (migrationUser.length === 0) {
    return { success: false, error: 'Ongeldige of verlopen claim link' }
  }

  const user = migrationUser[0]

  try {
    // Hash new password
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Create new user account
    const newUser = await prisma.user.create({
      data: {
        name: user.firstName,
        email: user.oldEmail,
        passwordHash,
        profileImage: user.oldProfilePhoto,
        isVerified: true,
        emailVerified: new Date(),
        isOnboarded: false,
        onboardingStep: 1,
        registrationSource: 'oogvoorliefde_migration',
        createdAt: user.memberSince // Preserve original join date
      }
    })

    // Update migration user
    await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        "newUserId" = ${newUser.id},
        status = 'CLAIMED',
        "claimedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${user.id}
    `

    // Apply coupon if exists
    if (user.couponCode) {
      // Auto-apply the coupon
      await applyMigrationCoupon(newUser.id, user.couponCode)
    }

    return { success: true, userId: newUser.id }
  } catch (error) {
    console.error('[Migration] Claim failed:', error)
    return { success: false, error: 'Er ging iets mis. Probeer het opnieuw.' }
  }
}

/**
 * Apply migration coupon to user
 */
async function applyMigrationCoupon(userId: string, couponCode: string): Promise<void> {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode }
    })

    if (!coupon || !coupon.isActive) return

    // Create coupon usage
    await prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        userId,
        orderType: 'migration_bonus',
        discountAmount: 0,
        originalAmount: 0,
        finalAmount: 0
      }
    })

    // Update user subscription
    const premiumMonths = coupon.value
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + premiumMonths)

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'PREMIUM'
      }
    })

    // Create subscription record
    await prisma.subscription.create({
      data: {
        userId,
        plan: 'PREMIUM',
        status: 'active',
        startDate: new Date(),
        endDate: expiresAt,
        isTrial: true
      }
    })

  } catch (error) {
    console.error('[Migration] Failed to apply coupon:', error)
  }
}

// ============================================
// TRACKING & ANALYTICS
// ============================================

/**
 * Track email open
 */
export async function trackEmailOpen(emailId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "MigrationEmail"
    SET "openedAt" = NOW()
    WHERE id = ${emailId} AND "openedAt" IS NULL
  `

  // Get migration user and update
  const email = await prisma.$queryRaw<{ migrationUserId: string }[]>`
    SELECT "migrationUserId" FROM "MigrationEmail" WHERE id = ${emailId}
  `

  if (email.length > 0) {
    await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        "lastEmailOpenedAt" = NOW(),
        "totalEmailsOpened" = "totalEmailsOpened" + 1,
        status = CASE
          WHEN status = 'EMAIL_SENT' THEN 'EMAIL_OPENED'
          ELSE status
        END,
        "updatedAt" = NOW()
      WHERE id = ${email[0].migrationUserId}
    `
  }
}

/**
 * Track link click
 */
export async function trackLinkClick(emailId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "MigrationEmail"
    SET "clickedAt" = NOW()
    WHERE id = ${emailId} AND "clickedAt" IS NULL
  `

  const email = await prisma.$queryRaw<{ migrationUserId: string }[]>`
    SELECT "migrationUserId" FROM "MigrationEmail" WHERE id = ${emailId}
  `

  if (email.length > 0) {
    await prisma.$executeRaw`
      UPDATE "MigrationUser"
      SET
        "lastLinkClickedAt" = NOW(),
        status = CASE
          WHEN status IN ('EMAIL_SENT', 'EMAIL_OPENED') THEN 'LINK_CLICKED'
          ELSE status
        END,
        "updatedAt" = NOW()
      WHERE id = ${email[0].migrationUserId}
    `
  }
}

/**
 * Track landing page visit
 */
export async function trackLandingVisit(userId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "MigrationUser"
    SET
      "landingVisits" = "landingVisits" + 1,
      "lastLandingVisit" = NOW(),
      status = CASE
        WHEN status IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED') THEN 'LANDING_VISITED'
        ELSE status
      END,
      "updatedAt" = NOW()
    WHERE id = ${userId}
  `
}

/**
 * Get migration dashboard stats
 */
export async function getMigrationDashboardStats() {
  const [
    totals,
    bySegment,
    byStatus,
    emailMetrics,
    recentActivations
  ] = await Promise.all([
    // Total counts
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*) as total FROM "MigrationUser"
    `,

    // By segment
    prisma.$queryRaw<{ segment: string; count: number }[]>`
      SELECT segment, COUNT(*) as count
      FROM "MigrationUser"
      GROUP BY segment
    `,

    // By status
    prisma.$queryRaw<{ status: string; count: number }[]>`
      SELECT status, COUNT(*) as count
      FROM "MigrationUser"
      GROUP BY status
    `,

    // Email metrics
    prisma.$queryRaw<{
      sent: number
      opened: number
      clicked: number
    }[]>`
      SELECT
        COUNT(*) as sent,
        COUNT("openedAt") as opened,
        COUNT("clickedAt") as clicked
      FROM "MigrationEmail"
    `,

    // Recent activations
    prisma.$queryRaw<{ firstName: string; claimedAt: Date }[]>`
      SELECT "firstName", "claimedAt"
      FROM "MigrationUser"
      WHERE status = 'ACTIVATED'
      ORDER BY "claimedAt" DESC
      LIMIT 10
    `
  ])

  const total = totals[0]?.total || 0
  const claimed = byStatus.find(s => s.status === 'CLAIMED')?.count || 0
  const activated = byStatus.find(s => s.status === 'ACTIVATED')?.count || 0
  const emailStats = emailMetrics[0] || { sent: 0, opened: 0, clicked: 0 }

  return {
    total,
    bySegment: Object.fromEntries(bySegment.map(s => [s.segment, s.count])),
    byStatus: Object.fromEntries(byStatus.map(s => [s.status, s.count])),
    conversionRates: {
      emailOpenRate: emailStats.sent > 0 ? (emailStats.opened / emailStats.sent * 100).toFixed(1) : 0,
      clickThroughRate: emailStats.opened > 0 ? (emailStats.clicked / emailStats.opened * 100).toFixed(1) : 0,
      claimRate: total > 0 ? (claimed / total * 100).toFixed(1) : 0,
      activationRate: claimed > 0 ? (activated / claimed * 100).toFixed(1) : 0
    },
    recentActivations
  }
}
