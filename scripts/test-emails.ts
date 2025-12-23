/**
 * Email Template Testing Script
 *
 * Tests all three retention email templates with dummy data
 * Run with: npx tsx scripts/test-emails.ts
 *
 * Make sure to set RESEND_API_KEY in .env
 * Or run without it to see console output
 */

import { render } from '@react-email/render'
import DailyDigestEmail from '../lib/email/templates/engagement/daily-digest'
import ProfileNudgeEmail from '../lib/email/templates/engagement/profile-nudge'
import PerfectMatchEmail from '../lib/email/templates/engagement/perfect-match'
import { sendEmail } from '../lib/email/send'

// CONFIGURATION: Change this to your test email address
const TEST_EMAIL = process.env.TEST_EMAIL || 'developer@liefdevooriedereen.nl'

async function testDailyDigest() {
  console.log('\n📧 Testing Daily Digest Email...\n')

  const emailHtml = render(
    DailyDigestEmail({
      userName: 'Pieter',
      newVisitsCount: 5,
      newLikesCount: 3,
      featuredVisitor: {
        name: 'Bonnie',
        age: 67,
        photo: 'https://i.pravatar.cc/150?img=47', // Random avatar
        city: 'Amsterdam'
      }
    })
  )

  const emailText = `
Goed nieuws, Pieter!

Je hebt 5 nieuwe bezoekers en 3 nieuwe likes.

Er is vandaag veel interesse in jouw profiel.

Klik hier om te zien wie het is: https://liefdevooriedereen.nl/dashboard/visitors

Liefde Voor Iedereen
  `.trim()

  try {
    await sendEmail({
      to: TEST_EMAIL,
      subject: '8 nieuwe bezoekers op je profiel! - TEST',
      html: emailHtml,
      text: emailText
    })
    console.log('✅ Daily Digest sent successfully to', TEST_EMAIL)
  } catch (error) {
    console.error('❌ Failed to send Daily Digest:', error)
  }
}

async function testProfileNudge() {
  console.log('\n📧 Testing Profile Nudge Email...\n')

  const emailHtml = render(
    ProfileNudgeEmail({
      userName: 'Marja',
      profileScore: 40,
      missingFields: ['Profielfoto', 'Interesses', 'Over jezelf (bio)']
    })
  )

  const emailText = `
Hoi Marja,

Je profiel is bijna klaar!

Een compleet profiel krijgt 5x meer matches. Help anderen jou beter te leren kennen.

Jouw profiel is nu 40% compleet.

Nog toe te voegen:
- Profielfoto
- Interesses
- Over jezelf (bio)

Klik hier om je profiel af te maken: https://liefdevooriedereen.nl/profile/edit

Liefde Voor Iedereen
  `.trim()

  try {
    await sendEmail({
      to: TEST_EMAIL,
      subject: 'Je profiel is bijna klaar! 🎯 - TEST',
      html: emailHtml,
      text: emailText
    })
    console.log('✅ Profile Nudge sent successfully to', TEST_EMAIL)
  } catch (error) {
    console.error('❌ Failed to send Profile Nudge:', error)
  }
}

async function testPerfectMatch() {
  console.log('\n📧 Testing Perfect Match Email...\n')

  const emailHtml = render(
    PerfectMatchEmail({
      userName: 'Jan',
      matchName: 'Bonnie',
      matchAge: 67,
      matchPhoto: 'https://i.pravatar.cc/150?img=47', // Random avatar
      matchCity: 'Rotterdam',
      sharedInterests: ['Wandelen', 'Koffie drinken', 'Lezen'],
      compatibilityScore: 85
    })
  )

  const emailText = `
Hoi Jan,

We vonden iemand speciaal voor jou!

Bonnie, 67 jaar uit Rotterdam

Wat jullie delen:
- Jullie houden allebei van Wandelen
- Jullie houden allebei van Koffie drinken
- Jullie houden allebei van Lezen

Klik hier om het profiel te bekijken: https://liefdevooriedereen.nl/profile/bonnie

Liefde Voor Iedereen
  `.trim()

  try {
    await sendEmail({
      to: TEST_EMAIL,
      subject: 'We vonden iemand speciaal voor jou! ✨ - TEST',
      html: emailHtml,
      text: emailText
    })
    console.log('✅ Perfect Match sent successfully to', TEST_EMAIL)
  } catch (error) {
    console.error('❌ Failed to send Perfect Match:', error)
  }
}

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('🧪 EMAIL TEMPLATE TESTING')
  console.log('='.repeat(80))
  console.log(`📬 Sending test emails to: ${TEST_EMAIL}`)
  console.log('='.repeat(80))

  // Test all three email templates
  await testDailyDigest()
  await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s between emails

  await testProfileNudge()
  await new Promise(resolve => setTimeout(resolve, 1000))

  await testPerfectMatch()

  console.log('\n' + '='.repeat(80))
  console.log('✅ All email tests completed!')
  console.log('='.repeat(80))
  console.log('\n💡 Tips:')
  console.log('   - Check your inbox at', TEST_EMAIL)
  console.log('   - Check spam folder if not in inbox')
  console.log('   - Without RESEND_API_KEY, emails are logged to console only')
  console.log('   - Set TEST_EMAIL env var to test with different address')
  console.log('\n')
}

// Run the tests
main().catch(console.error)
