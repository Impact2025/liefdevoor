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

  if (resendApiKey && process.env.NODE_ENV === 'production') {
    // Production: Use Resend
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Liefde Voor Iedereen <noreply@liefdevoorlvb.nl>',
          to: [to],
          subject,
          html,
          text,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('[Email] Failed to send via Resend:', error)
        throw new Error('Failed to send email')
      }

      console.log('[Email] ✅ Sent via Resend to:', to)
    } catch (error) {
      console.error('[Email] Error sending email:', error)
      throw error
    }
  } else {
    // Development: Log to console
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

    // In development, we consider the email "sent"
    // In production without Resend, you should set up proper email
    if (process.env.NODE_ENV === 'production' && !resendApiKey) {
      console.warn('⚠️  WARNING: No RESEND_API_KEY configured for production!')
    }
  }
}

/**
 * Check if email service is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY)
}
