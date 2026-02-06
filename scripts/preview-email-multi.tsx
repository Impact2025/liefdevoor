/**
 * Preview Welcome Email for User Multi
 *
 * Generates HTML preview of the migration welcome email
 */

import { render } from '@react-email/render'
import MigrationWelcomeEmail from '../lib/email/templates/migration/welcome'
import * as fs from 'fs'

async function previewEmail() {
  console.log('📧 Generating email preview for user Multi...\n')

  const emailHtml = await render(
    MigrationWelcomeEmail({
      userName: 'Multi',
      landingUrl: 'https://liefdevooriedereen.nl/welkom/2cee360232ec7fee44b91549c7948e9e',
      couponCode: 'WELKOM-MULTI-19AF',
      couponExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      memberSince: new Date('2019-07-10'),
      photoCount: 3,
      messageCount: 47,
      incentive: {
        premiumMonths: 2,
        superMessages: 5
      }
    })
  )

  // Save to file
  const outputPath = 'D:\\datingsite2026\\scripts\\email-preview-multi.html'
  fs.writeFileSync(outputPath, emailHtml)

  console.log(`✅ Email preview saved to: ${outputPath}`)
  console.log()
  console.log('Open dit bestand in je browser om de email te bekijken.')
  console.log()

  // Also print text summary
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('              EMAIL PREVIEW: MULTI')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log()
  console.log('   Subject: Multi, je profiel staat klaar op LiefdevoorIedereen.nl')
  console.log()
  console.log('   Content Preview:')
  console.log('   ─────────────────')
  console.log('   🎉 Je profiel staat klaar!')
  console.log()
  console.log('   Welkom terug, Multi!')
  console.log()
  console.log('   OogvoorLiefde wordt LiefdevoorIedereen - een compleet')
  console.log('   vernieuwde dating ervaring. Als trouw lid sinds 2019')
  console.log('   staat je profiel al klaar.')
  console.log()
  console.log('   ✅ Je data is bewaard:')
  console.log('      📸 3 foto\'s')
  console.log('      💬 47 berichten')
  console.log('      📅 Lid sinds 2019')
  console.log()
  console.log('   ┌─────────────────────────────────┐')
  console.log('   │  Jouw persoonlijke welkomstcode │')
  console.log('   │                                 │')
  console.log('   │      WELKOM-MULTI-19AF         │')
  console.log('   │                                 │')
  console.log('   │   2 maanden GRATIS Premium     │')
  console.log('   │   + 5 SuperBerichten           │')
  console.log('   │                                 │')
  console.log('   │   Geldig tot 12 februari       │')
  console.log('   └─────────────────────────────────┘')
  console.log()
  console.log('   [  Activeer Mijn Account  ]')
  console.log()
  console.log('   🔒 Veilige overdracht')
  console.log('   ✅ Geen betaling nodig')
  console.log('   🛡️ AVG-compliant')
  console.log()
}

previewEmail()
