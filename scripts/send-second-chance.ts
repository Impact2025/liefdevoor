/**
 * Tweede kans campagne voor niet-geconverteerde premium segments
 *
 * Targets: VIP, GOLD, ACTIVE, DORMANT gebruikers die NIET geactiveerd zijn
 * Wat het doet:
 *   1. Genereert nieuwe claim tokens (30 dagen geldig)
 *   2. Stuurt een "tweede kans" email
 *
 * Gebruik:
 *   Dry run:  npx tsx scripts/send-second-chance.ts
 *   Live:     npx tsx scripts/send-second-chance.ts --send
 *   Segment:  npx tsx scripts/send-second-chance.ts --send --segment VIP
 */

import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import SecondChanceEmail from '../lib/email/templates/migration/second-chance'

const DRY_RUN = !process.argv.includes('--send')
const SEGMENT_FILTER = (() => {
  const idx = process.argv.indexOf('--segment')
  return idx !== -1 ? process.argv[idx + 1] : null
})()

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://liefdevooriedereen.nl'
const TOKEN_VALID_DAYS = 30

const SEGMENT_REWARDS: Record<string, { premiumMonths: number; superMessages: number }> = {
  VIP:     { premiumMonths: 3, superMessages: 10 },
  GOLD:    { premiumMonths: 2, superMessages: 5 },
  ACTIVE:  { premiumMonths: 1, superMessages: 3 },
  DORMANT: { premiumMonths: 1, superMessages: 5 },
}

function generateToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

function getSubject(firstName: string, premiumMonths: number, segment: string): string {
  if (segment === 'VIP') {
    return `${firstName}, we geven je nog één kans op ${premiumMonths} maanden gratis Premium`
  }
  if (segment === 'GOLD') {
    return `${firstName}, we geven je nog één kans op ${premiumMonths} maanden gratis Premium`
  }
  return `${firstName}, we geven je nog één kans op gratis Premium`
}

async function main() {
  console.log('\n' + '═'.repeat(65))
  console.log('  TWEEDE KANS CAMPAGNE — Premium Segmenten')
  console.log('═'.repeat(65))
  console.log(DRY_RUN ? '\n  MODE: DRY RUN (gebruik --send om te versturen)\n' : '\n  MODE: LIVE SEND\n')

  const segments = SEGMENT_FILTER
    ? [SEGMENT_FILTER]
    : ['VIP', 'GOLD', 'ACTIVE', 'DORMANT']

  const users = await prisma.migrationUser.findMany({
    where: {
      segment: { in: segments },
      status: { in: ['EMAIL_SENT', 'LANDING_VISITED'] },
    },
    orderBy: [{ segment: 'asc' }, { firstName: 'asc' }],
  })

  console.log(`  Gevonden: ${users.length} niet-geactiveerde gebruikers`)
  console.log(`  Segmenten: ${segments.join(', ')}`)
  console.log(`  Nieuwe token geldigheid: ${TOKEN_VALID_DAYS} dagen\n`)

  const newExpiry = new Date(Date.now() + TOKEN_VALID_DAYS * 24 * 60 * 60 * 1000)

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const user of users) {
    const rewards = SEGMENT_REWARDS[user.segment] || { premiumMonths: 1, superMessages: 0 }
    const subject = getSubject(user.firstName, rewards.premiumMonths, user.segment)
    const newToken = generateToken()
    const landingUrl = `${BASE_URL}/welkom/${newToken}`

    if (DRY_RUN) {
      console.log(`[DRY] ${user.segment} | ${user.firstName} | ${user.oldEmail}`)
      console.log(`      Onderwerp: ${subject}`)
      console.log(`      Premium: ${rewards.premiumMonths}mo + ${rewards.superMessages} SuperBerichten`)
      console.log(`      Nieuw token: ${newToken}`)
      console.log()
      skipped++
      continue
    }

    try {
      // Update claim token before sending
      await prisma.migrationUser.update({
        where: { id: user.id },
        data: {
          claimToken: newToken,
          claimTokenExpiresAt: newExpiry,
        },
      })

      const emailHtml = await render(
        React.createElement(SecondChanceEmail, {
          userName: user.firstName,
          landingUrl,
          premiumMonths: rewards.premiumMonths,
          superMessages: rewards.superMessages,
          segment: user.segment as 'VIP' | 'GOLD' | 'ACTIVE' | 'DORMANT',
          daysRemaining: TOKEN_VALID_DAYS,
        })
      )

      const result = await sendEmail({
        to: user.oldEmail,
        from: 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>',
        subject,
        html: emailHtml,
        category: `migration-second-chance-${user.segment.toLowerCase()}`,
        migrationUserId: user.id,
      })

      if (result.success) {
        await prisma.migrationEmail.create({
          data: {
            migrationUserId: user.id,
            emailType: 'REMINDER',
            subject,
            resendId: result.emailId || null,
            sentAt: new Date(),
          },
        })

        await prisma.migrationUser.update({
          where: { id: user.id },
          data: { lastEmailSentAt: new Date() },
        })

        console.log(`✅ ${user.segment} | ${user.firstName} | ${user.oldEmail}`)
        sent++
      } else {
        console.log(`❌ ${user.segment} | ${user.firstName} | ${result.error}`)
        errors++
      }

      await new Promise(resolve => setTimeout(resolve, 300))

    } catch (err) {
      console.error(`❌ Fout bij ${user.firstName}:`, err)
      errors++
    }
  }

  console.log('\n' + '═'.repeat(65))
  if (DRY_RUN) {
    console.log(`  DRY RUN: ${skipped} emails zouden verstuurd worden`)
    console.log(`  Voer uit met --send om daadwerkelijk te versturen`)
  } else {
    console.log(`  Verstuurd:  ${sent}`)
    console.log(`  Fouten:     ${errors}`)
    console.log(`  Totaal:     ${users.length}`)
  }
  console.log('═'.repeat(65) + '\n')

  await prisma.$disconnect()
}

main().catch(console.error)
