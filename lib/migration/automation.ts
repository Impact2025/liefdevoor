/**
 * Smart Migration Automation
 * Behavior-triggered follow-ups based on user engagement
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import ReminderV2 from '@/lib/email/templates/migration/reminder-v2'

// ============================================
// MAIN AUTOMATION RUNNER
// ============================================

export async function runDailyAutomation() {
  console.log('\n' + '═'.repeat(60))
  console.log('   MIGRATION AUTOMATION - Daily Run')
  console.log('   ' + new Date().toLocaleString('nl-NL'))
  console.log('═'.repeat(60))

  const results = {
    openedNoClick: 0,
    visitedNoClaim: 0,
    lastChance: 0,
    reengagement: 0,
    errors: 0
  }

  // Run automation sequences
  try {
    results.openedNoClick = await sendFollowUpToOpeners()
    results.visitedNoClaim = await sendFollowUpToVisitors()
    results.lastChance = await sendLastChanceEmails()
    results.reengagement = await reengageNonOpeners()
  } catch (error) {
    console.error('Automation error:', error)
    results.errors++
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('   AUTOMATION SUMMARY')
  console.log('═'.repeat(60))
  console.log(`   Opened but no click:     ${results.openedNoClick}`)
  console.log(`   Visited but no claim:    ${results.visitedNoClaim}`)
  console.log(`   Last chance (< 3 days):  ${results.lastChance}`)
  console.log(`   Re-engagement:           ${results.reengagement}`)
  console.log(`   Errors:                  ${results.errors}`)
  console.log('═'.repeat(60))

  return results
}

// ============================================
// SEQUENCE 1: EMAIL OPENED BUT NO CLICK
// ============================================

/**
 * Target: Users who opened email but didn't click
 * Behavior: Interested but hesitant
 * Action: Send gentle reminder with more social proof
 */
async function sendFollowUpToOpeners(): Promise<number> {
  console.log('\n📧 Sequence 1: Follow-up for openers...')

  const users = await prisma.$queryRaw<any[]>`
    SELECT
      mu.*,
      DATE_PART('day', mu."claimTokenExpiresAt" - NOW()) as "daysRemaining"
    FROM "MigrationUser" mu
    WHERE mu.status = 'EMAIL_OPENED'
    AND mu."lastEmailOpenedAt" >= NOW() - INTERVAL '3 days'
    AND mu."lastEmailOpenedAt" <= NOW() - INTERVAL '2 days'
    AND mu."lastEmailSentAt" <= NOW() - INTERVAL '2 days'
    AND mu."claimTokenExpiresAt" > NOW() + INTERVAL '3 days'
    LIMIT 100
  `

  console.log(`   Found ${users.length} users who opened but didn't click`)

  let sent = 0

  for (const user of users) {
    try {
      const incentive = getIncentiveForSegment(user.segment)
      const daysRemaining = Math.ceil(user.daysRemaining)

      // Render email
      const html = await render(
        React.createElement(ReminderV2, {
          userName: user.firstName,
          landingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/welkom/${user.claimToken}`,
          daysRemaining,
          premiumMonths: incentive.premiumMonths,
          superMessages: incentive.superMessages,
          photoCount: user.photoCount || 0,
          hasOpened: true,
          hasClicked: false
        })
      )

      // Send email
      const result = await sendEmail({
        to: user.oldEmail,
        subject: `${user.firstName}, je aanbieding verloopt over ${daysRemaining} dagen ⏰`,
        html,
        category: 'migration-followup'
      })

      if (result.success) {
        // Log email
        await prisma.$executeRaw`
          INSERT INTO "MigrationEmail" (
            id, "migrationUserId", "emailType", subject, "abVariant", "sentAt", "resendId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            ${user.id},
            'REMINDER',
            ${`${user.firstName}, je aanbieding verloopt over ${daysRemaining} dagen`},
            'AUTO',
            NOW(),
            ${result.emailId},
            NOW(),
            NOW()
          )
        `

        // Update user
        await prisma.$executeRaw`
          UPDATE "MigrationUser"
          SET "lastEmailSentAt" = NOW(),
              "updatedAt" = NOW()
          WHERE id = ${user.id}
        `

        console.log(`   ✅ Sent to ${user.firstName} (${user.oldEmail})`)
        sent++
      }

      // Rate limiting
      await delay(500)
    } catch (error) {
      console.error(`   ❌ Error for ${user.firstName}:`, error)
    }
  }

  return sent
}

// ============================================
// SEQUENCE 2: LANDING VISITED BUT NO CLAIM
// ============================================

/**
 * Target: Users who visited landing page but didn't claim
 * Behavior: Very interested but needs final push
 * Action: Urgent reminder with countdown
 */
async function sendFollowUpToVisitors(): Promise<number> {
  console.log('\n🔗 Sequence 2: Follow-up for visitors...')

  const users = await prisma.$queryRaw<any[]>`
    SELECT
      mu.*,
      DATE_PART('day', mu."claimTokenExpiresAt" - NOW()) as "daysRemaining"
    FROM "MigrationUser" mu
    WHERE mu.status = 'LANDING_VISITED'
    AND mu."landingVisitedAt" >= NOW() - INTERVAL '24 hours'
    AND mu."landingVisitedAt" <= NOW() - INTERVAL '12 hours'
    AND mu."lastEmailSentAt" <= NOW() - INTERVAL '1 day'
    AND mu."claimTokenExpiresAt" > NOW() + INTERVAL '2 days'
    LIMIT 50
  `

  console.log(`   Found ${users.length} users who visited but didn't claim`)

  let sent = 0

  for (const user of users) {
    try {
      const incentive = getIncentiveForSegment(user.segment)
      const daysRemaining = Math.ceil(user.daysRemaining)

      const html = await render(
        React.createElement(ReminderV2, {
          userName: user.firstName,
          landingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/welkom/${user.claimToken}`,
          daysRemaining,
          premiumMonths: incentive.premiumMonths,
          superMessages: incentive.superMessages,
          photoCount: user.photoCount || 0,
          hasOpened: true,
          hasClicked: true
        })
      )

      const result = await sendEmail({
        to: user.oldEmail,
        subject: `${user.firstName}, je was er bijna! Nog ${daysRemaining} dagen ⚡`,
        html,
        category: 'migration-followup'
      })

      if (result.success) {
        await prisma.$executeRaw`
          INSERT INTO "MigrationEmail" (
            id, "migrationUserId", "emailType", subject, "sentAt", "resendId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            ${user.id},
            'REMINDER',
            ${`${user.firstName}, je was er bijna!`},
            NOW(),
            ${result.emailId},
            NOW(),
            NOW()
          )
        `

        await prisma.$executeRaw`
          UPDATE "MigrationUser"
          SET "lastEmailSentAt" = NOW()
          WHERE id = ${user.id}
        `

        console.log(`   ✅ Sent to ${user.firstName}`)
        sent++
      }

      await delay(500)
    } catch (error) {
      console.error(`   ❌ Error for ${user.firstName}:`, error)
    }
  }

  return sent
}

// ============================================
// SEQUENCE 3: LAST CHANCE (< 3 DAYS)
// ============================================

/**
 * Target: Users with < 3 days until expiry
 * Behavior: Time running out
 * Action: Final urgent reminder
 */
async function sendLastChanceEmails(): Promise<number> {
  console.log('\n⚠️  Sequence 3: Last chance emails...')

  const users = await prisma.$queryRaw<any[]>`
    SELECT
      mu.*,
      DATE_PART('day', mu."claimTokenExpiresAt" - NOW()) as "daysRemaining"
    FROM "MigrationUser" mu
    WHERE mu.status IN ('EMAIL_SENT', 'EMAIL_OPENED', 'LINK_CLICKED', 'LANDING_VISITED')
    AND mu."claimTokenExpiresAt" <= NOW() + INTERVAL '3 days'
    AND mu."claimTokenExpiresAt" > NOW()
    AND mu."lastEmailSentAt" <= NOW() - INTERVAL '2 days'
    AND NOT EXISTS (
      SELECT 1 FROM "MigrationEmail" me
      WHERE me."migrationUserId" = mu.id
      AND me."emailType" = 'LAST_CHANCE'
    )
    LIMIT 100
  `

  console.log(`   Found ${users.length} users with < 3 days remaining`)

  let sent = 0

  for (const user of users) {
    try {
      const incentive = getIncentiveForSegment(user.segment)
      const daysRemaining = Math.max(1, Math.ceil(user.daysRemaining))

      const html = await render(
        React.createElement(ReminderV2, {
          userName: user.firstName,
          landingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/welkom/${user.claimToken}`,
          daysRemaining,
          premiumMonths: incentive.premiumMonths,
          superMessages: incentive.superMessages,
          photoCount: user.photoCount || 0,
          hasOpened: user.status !== 'EMAIL_SENT',
          hasClicked: user.status === 'LINK_CLICKED' || user.status === 'LANDING_VISITED'
        })
      )

      const result = await sendEmail({
        to: user.oldEmail,
        subject: `🚨 LAATSTE KANS ${user.firstName}: Nog ${daysRemaining} ${daysRemaining === 1 ? 'dag' : 'dagen'}!`,
        html,
        category: 'migration-urgent'
      })

      if (result.success) {
        await prisma.$executeRaw`
          INSERT INTO "MigrationEmail" (
            id, "migrationUserId", "emailType", subject, "sentAt", "resendId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            ${user.id},
            'LAST_CHANCE',
            ${`LAATSTE KANS: Nog ${daysRemaining} dagen`},
            NOW(),
            ${result.emailId},
            NOW(),
            NOW()
          )
        `

        await prisma.$executeRaw`
          UPDATE "MigrationUser"
          SET "lastEmailSentAt" = NOW()
          WHERE id = ${user.id}
        `

        console.log(`   ✅ Sent to ${user.firstName} (${daysRemaining} days left)`)
        sent++
      }

      await delay(500)
    } catch (error) {
      console.error(`   ❌ Error for ${user.firstName}:`, error)
    }
  }

  return sent
}

// ============================================
// SEQUENCE 4: RE-ENGAGEMENT (NON-OPENERS)
// ============================================

/**
 * Target: Users who haven't opened email after 3 days
 * Behavior: Not interested or email went to spam
 * Action: Re-engagement with different subject line
 */
async function reengageNonOpeners(): Promise<number> {
  console.log('\n🔄 Sequence 4: Re-engagement for non-openers...')

  const users = await prisma.$queryRaw<any[]>`
    SELECT
      mu.*,
      DATE_PART('day', mu."claimTokenExpiresAt" - NOW()) as "daysRemaining"
    FROM "MigrationUser" mu
    WHERE mu.status = 'EMAIL_SENT'
    AND mu."lastEmailSentAt" <= NOW() - INTERVAL '3 days'
    AND mu."lastEmailOpenedAt" IS NULL
    AND mu."claimTokenExpiresAt" > NOW() + INTERVAL '5 days'
    AND (
      SELECT COUNT(*) FROM "MigrationEmail" me
      WHERE me."migrationUserId" = mu.id
    ) < 3
    LIMIT 50
  `

  console.log(`   Found ${users.length} non-openers to re-engage`)

  let sent = 0

  for (const user of users) {
    try {
      const incentive = getIncentiveForSegment(user.segment)
      const daysRemaining = Math.ceil(user.daysRemaining)

      const html = await render(
        React.createElement(ReminderV2, {
          userName: user.firstName,
          landingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/welkom/${user.claimToken}`,
          daysRemaining,
          premiumMonths: incentive.premiumMonths,
          superMessages: incentive.superMessages,
          photoCount: user.photoCount || 0,
          hasOpened: false,
          hasClicked: false
        })
      )

      // Different subject line to avoid spam filter
      const subjects = [
        `${user.firstName}, mis deze kans niet! 🎁`,
        `Je ${incentive.premiumMonths} maanden Premium wacht nog steeds`,
        `Hoi ${user.firstName}, zie je onze email niet?`,
        `${user.photoCount} foto's + Premium gratis voor jou`
      ]
      const subject = subjects[Math.floor(Math.random() * subjects.length)]

      const result = await sendEmail({
        to: user.oldEmail,
        subject,
        html,
        category: 'migration-reengagement'
      })

      if (result.success) {
        await prisma.$executeRaw`
          INSERT INTO "MigrationEmail" (
            id, "migrationUserId", "emailType", subject, "sentAt", "resendId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            ${user.id},
            'REMINDER',
            ${subject},
            NOW(),
            ${result.emailId},
            NOW(),
            NOW()
          )
        `

        await prisma.$executeRaw`
          UPDATE "MigrationUser"
          SET "lastEmailSentAt" = NOW()
          WHERE id = ${user.id}
        `

        console.log(`   ✅ Re-engaged ${user.firstName}`)
        sent++
      }

      await delay(500)
    } catch (error) {
      console.error(`   ❌ Error for ${user.firstName}:`, error)
    }
  }

  return sent
}

// ============================================
// HELPERS
// ============================================

function getIncentiveForSegment(segment: string) {
  const incentives: Record<string, { premiumMonths: number; superMessages: number }> = {
    VIP: { premiumMonths: 6, superMessages: 20 },
    GOLD: { premiumMonths: 4, superMessages: 15 },
    ACTIVE: { premiumMonths: 3, superMessages: 10 },
    DORMANT: { premiumMonths: 2, superMessages: 10 },
    INACTIVE: { premiumMonths: 1, superMessages: 3 }
  }
  return incentives[segment] || { premiumMonths: 1, superMessages: 3 }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
