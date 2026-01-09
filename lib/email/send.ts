/**
 * WERELDKLASSE Email Sending Service
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Comprehensive error logging to database
 * - Delivery tracking and analytics
 * - Fallback handling
 * - Rate limiting protection
 */

import { prisma } from '@/lib/prisma'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
  category?: string
  userId?: string
  maxRetries?: number
}

interface SendEmailResult {
  success: boolean
  emailId?: string
  error?: string
}

/**
 * Send email with automatic retry and comprehensive logging
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, category = 'GENERAL', userId, maxRetries = 3 } = options

  const resendApiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || 'Liefde Voor Iedereen <noreply@liefdevooriedereen.nl>'

  // Create email log entry
  const emailLog = await prisma.emailLog.create({
    data: {
      email: to,
      userId: userId || null,
      type: category, // Type matches category for now
      category,
      subject,
      status: 'pending',
      sentAt: new Date(),
    }
  })

  console.log('[Email] 📧 Sending email...')
  console.log('[Email] To:', to)
  console.log('[Email] From:', emailFrom)
  console.log('[Email] Subject:', subject)
  console.log('[Email] Category:', category)
  console.log('[Email] Log ID:', emailLog.id)

  // Development mode - just log to console
  if (!resendApiKey) {
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
    console.warn('⚠️  No RESEND_API_KEY configured - emails will only be logged to console')

    // Update log as delivered in dev mode
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'delivered',
        deliveredAt: new Date()
      }
    })

    return { success: true }
  }

  // Production mode - send via Resend with retry logic
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Email] Attempt ${attempt}/${maxRetries}`)

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [to],
          subject,
          html,
          text,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('[Email] ❌ Resend API error')
        console.error('[Email] Status:', response.status, response.statusText)
        console.error('[Email] Error:', JSON.stringify(result, null, 2))

        // Check if it's a retryable error
        const isRetryable = response.status >= 500 || response.status === 429
        if (!isRetryable || attempt === maxRetries) {
          // Permanent failure - update log
          await prisma.emailLog.update({
            where: { id: emailLog.id },
            data: {
              status: 'failed',
              errorMessage: `${response.status}: ${result.message || JSON.stringify(result)}`
            }
          })

          return {
            success: false,
            error: result.message || JSON.stringify(result)
          }
        }

        // Retry with exponential backoff
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        console.log(`[Email] Retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }

      // Success!
      console.log('[Email] ✅ Sent successfully')
      console.log('[Email] Resend ID:', result.id)

      // Update log as delivered
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'delivered',
          deliveredAt: new Date()
        }
      })

      return {
        success: true,
        emailId: result.id
      }

    } catch (error) {
      lastError = error as Error
      console.error(`[Email] Attempt ${attempt} failed:`, error)

      if (attempt === maxRetries) {
        // Final failure - log to database
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'failed',
            errorMessage: lastError.message
          }
        })

        return {
          success: false,
          error: lastError.message
        }
      }

      // Retry with exponential backoff
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
      console.log(`[Email] Retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  // Should never reach here, but just in case
  return {
    success: false,
    error: 'Max retries exceeded'
  }
}

/**
 * Check if email service is properly configured
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY)
}
