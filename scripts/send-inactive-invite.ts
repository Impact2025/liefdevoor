/**
 * Uitnodigingscampagne voor INACTIVE gebruikers
 *
 * Aanpak: geen "migratie" framing — gewoon een uitnodiging voor de nieuwe app
 * met 1 maand gratis premium als incentive.
 *
 * AANBEVOLEN: Test eerst met een klein batch (--limit 100) voordat je alles stuurt.
 *
 * Gebruik:
 *   Dry run:           npx tsx scripts/send-inactive-invite.ts
 *   Test 100:          npx tsx scripts/send-inactive-invite.ts --send --limit 100
 *   Alles versturen:   npx tsx scripts/send-inactive-invite.ts --send
 *   Alleen landing:    npx tsx scripts/send-inactive-invite.ts --send --only-landing
 */

import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import InactiveInviteEmail from '../lib/email/templates/migration/inactive-invite'

const DRY_RUN = !process.argv.includes('--send')
const ONLY_LANDING = process.argv.includes('--only-landing')
const LIMIT = (() => {
  const idx = process.argv.indexOf('--limit')
  return idx !== -1 ? parseInt(process.argv[idx + 1], 10) : 200
})()

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://liefdevooriedereen.nl'

async function main() {
  console.log('\n' + '═'.repeat(65))
  console.log('  INACTIVE UITNODIGINGSCAMPAGNE')
  console.log('═'.repeat(65))
  console.log(DRY_RUN ? '\n  MODE: DRY RUN (gebruik --send om te versturen)\n' : '\n  MODE: LIVE SEND\n')

  const where = ONLY_LANDING
    ? { segment: 'INACTIVE', status: 'LANDING_VISITED' }
    : { segment: 'INACTIVE', status: { in: ['EMAIL_SENT', 'LANDING_VISITED'] } }

  const users = await prisma.migrationUser.findMany({
    where,
    take: LIMIT,
    orderBy: { lastEmailSentAt: 'asc' },
  })

  const total = await prisma.migrationUser.count({ where })

  console.log(`  Doelgroep: INACTIVE${ONLY_LANDING ? ' (alleen landing bezoekers)' : ''}`)
  console.log(`  Gevonden: ${users.length} gebruikers${LIMIT ? ` (limiet: ${LIMIT})` : ''} van ${total} totaal`)
  console.log()

  const registerUrl = `${BASE_URL}/register`
  const subject = (firstName: string) =>
    `${firstName}, ken je Liefde Voor Iedereen al?`

  let sent = 0
  let skipped = 0
  let errors = 0

  for (const user of users) {
    const sub = subject(user.firstName)

    if (DRY_RUN) {
      console.log(`[DRY] ${user.firstName} | ${user.oldEmail} | status: ${user.status}`)
      console.log(`      Onderwerp: ${sub}`)
      console.log()
      skipped++
      continue
    }

    try {
      const emailHtml = await render(
        React.createElement(InactiveInviteEmail, {
          userName: user.firstName,
          registerUrl,
        })
      )

      const result = await sendEmail({
        to: user.oldEmail,
        from: 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>',
        subject: sub,
        html: emailHtml,
        category: 'migration-inactive-invite',
        migrationUserId: user.id,
      })

      if (result.success) {
        await prisma.migrationEmail.create({
          data: {
            migrationUserId: user.id,
            emailType: 'REMINDER',
            subject: sub,
            resendId: result.emailId || null,
            sentAt: new Date(),
          },
        })

        await prisma.migrationUser.update({
          where: { id: user.id },
          data: { lastEmailSentAt: new Date() },
        })

        console.log(`✅ ${user.firstName} | ${user.oldEmail}`)
        sent++
      } else {
        console.log(`❌ ${user.firstName} | ${result.error}`)
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
    console.log()
    console.log(`  Volgende stappen:`)
    console.log(`  1. Test met 100:  npx tsx scripts/send-inactive-invite.ts --send --limit 100`)
    console.log(`  2. Wacht 2-3 dagen, check resultaten`)
    console.log(`  3. Alles:         npx tsx scripts/send-inactive-invite.ts --send`)
  } else {
    console.log(`  Verstuurd:  ${sent}`)
    console.log(`  Fouten:     ${errors}`)
    console.log(`  Totaal:     ${users.length}`)
  }
  console.log('═'.repeat(65) + '\n')

  await prisma.$disconnect()
}

main().catch(console.error)
