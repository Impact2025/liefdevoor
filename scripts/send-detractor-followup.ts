/**
 * Send Detractor Follow-Up Emails
 *
 * Sends personalized follow-up emails to users who gave low NPS scores (0-6)
 * Should be run daily via cron or manually
 *
 * Usage:
 *   npx tsx scripts/send-detractor-followup.ts          # Send to all eligible
 *   npx tsx scripts/send-detractor-followup.ts test     # Preview only
 */

import { prisma } from '../lib/prisma'
import { sendEmail } from '../lib/email/send'
import { render } from '@react-email/render'
import * as React from 'react'
import FeedbackFollowupEmail from '../lib/email/templates/feedback-followup'

const DELAY_BETWEEN_EMAILS = 1000 // ms

interface DetractorFeedback {
  id: string
  userId: string
  wouldRecommend: number
  improvements: string | null
  createdAt: Date
  userName: string
  userEmail: string
}

async function sendDetractorFollowups(testMode = false) {
  console.log('\n' + '═'.repeat(60))
  console.log('   DETRACTOR FOLLOW-UP EMAILS')
  console.log('   ' + new Date().toLocaleString('nl-NL'))
  console.log('═'.repeat(60))

  // Get detractors from the last 7 days who haven't received a follow-up yet
  const detractors = await prisma.$queryRaw<DetractorFeedback[]>`
    SELECT
      fs.id,
      fs."userId",
      fs."wouldRecommend",
      fs.improvements,
      fs."createdAt",
      u."firstName" as "userName",
      u.email as "userEmail"
    FROM "FeedbackSurvey" fs
    JOIN "User" u ON u.id = fs."userId"
    WHERE fs."wouldRecommend" <= 6
    AND fs."userId" IS NOT NULL
    AND fs."createdAt" > NOW() - INTERVAL '7 days'
    AND (fs."detractorFollowUpSent" IS NULL OR fs."detractorFollowUpSent" = false)
    ORDER BY fs."wouldRecommend" ASC, fs."createdAt" DESC
  `

  if (detractors.length === 0) {
    console.log('\n✅ Geen nieuwe detractors gevonden om op te volgen')
    await prisma.$disconnect()
    return
  }

  console.log(`\n📋 ${detractors.length} detractors gevonden\n`)

  // Show breakdown by score
  const scoreBreakdown: Record<number, number> = {}
  detractors.forEach(d => {
    scoreBreakdown[d.wouldRecommend] = (scoreBreakdown[d.wouldRecommend] || 0) + 1
  })
  console.log('Score verdeling:')
  Object.entries(scoreBreakdown)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([score, count]) => {
      console.log(`   NPS ${score}: ${count} gebruikers`)
    })
  console.log('')

  if (testMode) {
    console.log('TEST MODE - Geen emails worden verstuurd\n')
    for (const d of detractors.slice(0, 5)) {
      console.log(`   ${d.userName} (${d.userEmail}) - NPS ${d.wouldRecommend}`)
      if (d.improvements) {
        console.log(`     └─ "${d.improvements.slice(0, 50)}${d.improvements.length > 50 ? '...' : ''}"`)
      }
    }
    if (detractors.length > 5) {
      console.log(`   ... en ${detractors.length - 5} meer`)
    }
    await prisma.$disconnect()
    return
  }

  let success = 0
  let failed = 0

  for (let i = 0; i < detractors.length; i++) {
    const d = detractors[i]
    const progress = `[${(i + 1).toString().padStart(2)}/${detractors.length}]`

    try {
      // Render email
      const html = await render(
        React.createElement(FeedbackFollowupEmail, {
          userName: d.userName || 'daar',
          npsScore: d.wouldRecommend,
          improvements: d.improvements || undefined
        })
      )

      // Send email
      const result = await sendEmail({
        to: d.userEmail,
        subject: `${d.userName}, mag ik even met je praten?`,
        html,
        text: `Hoi ${d.userName},\n\nBedankt voor je feedback. Ik zag dat je ervaring nog niet is wat het zou moeten zijn.\n\nAls oprichter voel ik me persoonlijk verantwoordelijk. Zou je 10 minuten willen bellen of mailen? Ik wil graag luisteren.\n\nMail me op vincent@liefdevooriedereen.nl\n\nVincent\nOprichter, Liefde Voor Iedereen`,
        category: 'feedback-followup'
      })

      if (result.success) {
        // Mark as sent
        await prisma.$executeRaw`
          UPDATE "FeedbackSurvey"
          SET
            "detractorFollowUpSent" = true,
            "detractorFollowUpAt" = NOW()
          WHERE id = ${d.id}::uuid
        `

        console.log(`${progress} ✅ ${d.userName} (NPS ${d.wouldRecommend})`)
        success++
      } else {
        console.log(`${progress} ❌ ${d.userName} - Send failed`)
        failed++
      }
    } catch (error: any) {
      console.log(`${progress} ❌ ${d.userName} - ${error.message}`)
      failed++
    }

    // Delay between emails
    if (i < detractors.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS))
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('   SAMENVATTING')
  console.log('═'.repeat(60))
  console.log(`   ✅ Succesvol:  ${success}`)
  console.log(`   ❌ Mislukt:    ${failed}`)
  console.log(`   📧 Totaal:     ${detractors.length}`)
  console.log('═'.repeat(60))

  await prisma.$disconnect()
}

// Parse args
const testMode = process.argv[2] === 'test'

sendDetractorFollowups(testMode).catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
