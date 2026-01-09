/**
 * Email System Test Script
 *
 * Quick test to verify email sending works
 */

import { sendEmail } from '@/lib/email/send'

const testEmail = process.argv[2]

if (!testEmail) {
  console.log('USAGE: npx tsx scripts/test-email.ts your@email.com')
  process.exit(1)
}

console.log('📧 Testing email system...\n')
console.log(`   Sending test email to: ${testEmail}`)
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`)
console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ Not set'}`)
console.log()

sendEmail({
  to: testEmail,
  subject: 'Test Email - Liefde Voor Iedereen',
  html: `
    <h1>Test Email</h1>
    <p>If you're seeing this, the email system is working!</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  `,
  text: `
    Test Email

    If you're seeing this, the email system is working!
    Timestamp: ${new Date().toISOString()}
  `,
  category: 'TEST'
}).then(result => {
  console.log()
  if (result.success) {
    console.log('✅ SUCCESS! Email sent.')
    if (result.emailId) {
      console.log(`   Resend ID: ${result.emailId}`)
    }
    console.log()
    console.log('Check your inbox (and spam folder) for the test email.')
    console.log('Also check the EmailLog table in database.')
    process.exit(0)
  } else {
    console.log('❌ FAILED! Email not sent.')
    console.log(`   Error: ${result.error}`)
    console.log()
    console.log('Check:')
    console.log('1. RESEND_API_KEY is set and valid')
    console.log('2. EMAIL_FROM is set correctly')
    console.log('3. Domain is verified in Resend dashboard')
    process.exit(1)
  }
}).catch(error => {
  console.log()
  console.log('❌ EXCEPTION!')
  console.error(error)
  process.exit(1)
})
