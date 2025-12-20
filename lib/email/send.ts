/**
 * Email Sending Service
 *
 * Send emails using Resend or development fallback
 */

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, html, text } = options

  // Check if we have Resend API key
  const resendApiKey = process.env.RESEND_API_KEY

  if (resendApiKey) {
    // Use Resend when API key is configured
    console.log('[Email] 📧 Sending email via Resend...')
    console.log('[Email] To:', to)
    console.log('[Email] From:', process.env.EMAIL_FROM || 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>')
    console.log('[Email] Subject:', subject)

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>',
          to: [to],
          subject,
          html,
          text,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('[Email] ❌ Failed to send via Resend')
        console.error('[Email] Status:', response.status, response.statusText)
        console.error('[Email] Error details:', JSON.stringify(error, null, 2))
        console.error('[Email] To:', to)
        console.error('[Email] From:', process.env.EMAIL_FROM || 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>')
        throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`)
      }

      const result = await response.json()
      console.log('[Email] ✅ Sent via Resend to:', to, '| ID:', result.id)
    } catch (error) {
      console.error('[Email] Error sending email:', error)
      throw error
    }
  } else {
    // Development: Log to console when no API key
    console.log('\n' + '='.repeat(80))
    console.log('[Email] 📧 EMAIL (DEVELOPMENT MODE)')
    console.log('='.repeat(80))
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('-'.repeat(80))
    console.log('Text version:')
    console.log(text)
    console.log('-'.repeat(80))
    console.log('HTML version available but not shown in console')
    console.log('='.repeat(80) + '\n')

    // In development without API key, we just log to console
    if (!resendApiKey) {
      console.warn('⚠️  No RESEND_API_KEY configured - emails will only be logged to console')
    }
  }
}

/**
 * Check if email service is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY)
}
