/**
 * Email Webhook Handler - Resend Events
 *
 * Handles:
 * - email.delivered - Update delivery status
 * - email.opened - Track opens
 * - email.clicked - Track clicks
 * - email.bounced - Handle bounces (soft/hard)
 * - email.complained - Handle spam complaints
 *
 * Security: Validates Resend webhook signature
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

interface ResendWebhookPayload {
  type: string
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
    // For bounce/complaint
    bounce?: {
      type: 'hard' | 'soft'
      message: string
    }
    complaint?: {
      type: string
      feedback_type: string
    }
    // For click
    click?: {
      link: string
      timestamp: string
    }
  }
}

/**
 * Verify Resend webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('resend-signature')
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    // Verify signature in production
    if (process.env.NODE_ENV === 'production' && webhookSecret) {
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.error('[Email Webhook] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload: ResendWebhookPayload = JSON.parse(body)
    const { type, data } = payload

    console.log(`[Email Webhook] Received event: ${type}`)

    // Find the email log by looking for recent emails to this address
    const emailAddress = data.to[0]
    const recentEmail = await prisma.emailLog.findFirst({
      where: {
        email: emailAddress,
        subject: data.subject,
        sentAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: { sentAt: 'desc' },
    })

    switch (type) {
      case 'email.delivered':
        if (recentEmail) {
          await prisma.emailLog.update({
            where: { id: recentEmail.id },
            data: {
              status: 'delivered',
              deliveredAt: new Date(),
            },
          })
        }
        break

      case 'email.opened':
        if (recentEmail) {
          // Update email log
          await prisma.emailLog.update({
            where: { id: recentEmail.id },
            data: { openedAt: new Date() },
          })

          // Update or create analytics
          const existingAnalytics = await prisma.emailAnalytics.findUnique({
            where: { emailLogId: recentEmail.id },
          })

          if (existingAnalytics) {
            await prisma.emailAnalytics.update({
              where: { emailLogId: recentEmail.id },
              data: {
                openCount: { increment: 1 },
                lastOpenedAt: new Date(),
              },
            })
          } else {
            await prisma.emailAnalytics.create({
              data: {
                emailLogId: recentEmail.id,
                openCount: 1,
                firstOpenedAt: new Date(),
                lastOpenedAt: new Date(),
              },
            })
          }

          // Update send time optimization
          if (recentEmail.userId) {
            await updateSendTimeOptimization(recentEmail.userId, 'open')
          }
        }
        break

      case 'email.clicked':
        if (recentEmail) {
          await prisma.emailLog.update({
            where: { id: recentEmail.id },
            data: { clickedAt: new Date() },
          })

          const clickedLink = data.click?.link || 'unknown'

          const analytics = await prisma.emailAnalytics.findUnique({
            where: { emailLogId: recentEmail.id },
          })

          if (analytics) {
            await prisma.emailAnalytics.update({
              where: { emailLogId: recentEmail.id },
              data: {
                clickCount: { increment: 1 },
                clickedLinks: {
                  push: clickedLink,
                },
              },
            })
          } else {
            await prisma.emailAnalytics.create({
              data: {
                emailLogId: recentEmail.id,
                clickCount: 1,
                clickedLinks: [clickedLink],
              },
            })
          }
        }
        break

      case 'email.bounced':
        await handleBounce(emailAddress, data.bounce?.type || 'soft', data.bounce?.message)
        if (recentEmail) {
          await prisma.emailLog.update({
            where: { id: recentEmail.id },
            data: {
              status: 'bounced',
              bouncedAt: new Date(),
              errorMessage: data.bounce?.message,
            },
          })
        }
        break

      case 'email.complained':
        await handleComplaint(emailAddress)
        if (recentEmail) {
          await prisma.emailLog.update({
            where: { id: recentEmail.id },
            data: {
              status: 'complained',
              errorMessage: `Spam complaint: ${data.complaint?.feedback_type}`,
            },
          })
        }
        break

      default:
        console.log(`[Email Webhook] Unhandled event type: ${type}`)
    }

    return NextResponse.json({ success: true, event: type })
  } catch (error) {
    console.error('[Email Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle email bounce
 */
async function handleBounce(
  email: string,
  bounceType: 'hard' | 'soft',
  message?: string
) {
  console.log(`[Email Webhook] Bounce: ${email} (${bounceType})`)

  // Log the bounce
  await prisma.$executeRaw`
    INSERT INTO "EmailBounce" (id, email, type, reason, "bouncedAt")
    VALUES (${crypto.randomUUID()}, ${email}, ${bounceType}, ${message || null}, NOW())
    ON CONFLICT DO NOTHING
  `.catch(() => {
    // Table might not exist yet, create it
    console.log('[Email Webhook] EmailBounce table not found, skipping bounce log')
  })

  // For hard bounces, disable marketing emails for this user
  if (bounceType === 'hard') {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (user) {
      // Disable marketing emails
      await prisma.user.update({
        where: { id: user.id },
        data: { marketingEmailsConsent: false },
      })

      // Update email preference if exists
      await prisma.emailPreference.updateMany({
        where: { userId: user.id },
        data: {
          dailyDigest: false,
          profileNudge: false,
          perfectMatch: false,
          reEngagement: false,
          weeklyHighlights: false,
          specialEvents: false,
        },
      })

      console.log(`[Email Webhook] Disabled marketing emails for bounced user: ${email}`)
    }
  }
}

/**
 * Handle spam complaint
 */
async function handleComplaint(email: string) {
  console.log(`[Email Webhook] Spam complaint: ${email}`)

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (user) {
    // Immediately disable ALL marketing emails
    await prisma.user.update({
      where: { id: user.id },
      data: { marketingEmailsConsent: false },
    })

    // Update email preference
    await prisma.emailPreference.updateMany({
      where: { userId: user.id },
      data: {
        dailyDigest: false,
        profileNudge: false,
        perfectMatch: false,
        reEngagement: false,
        weeklyHighlights: false,
        specialEvents: false,
        productUpdates: false,
      },
    })

    console.log(`[Email Webhook] Unsubscribed user due to complaint: ${email}`)
  }
}

/**
 * Update send time optimization based on engagement
 */
async function updateSendTimeOptimization(userId: string, action: 'open' | 'click') {
  try {
    const currentHour = new Date().getHours()

    const existing = await prisma.emailSendTimeOptimization.findUnique({
      where: { userId },
    })

    if (existing) {
      const openRates = (existing.openRateByHour as Record<string, number>) || {}
      openRates[currentHour.toString()] = (openRates[currentHour.toString()] || 0) + 1

      // Recalculate optimal hour
      let maxRate = 0
      let optimalHour = 10 // Default

      for (const [hour, rate] of Object.entries(openRates)) {
        if (rate > maxRate) {
          maxRate = rate
          optimalHour = parseInt(hour)
        }
      }

      await prisma.emailSendTimeOptimization.update({
        where: { userId },
        data: {
          openRateByHour: openRates,
          dataPoints: { increment: 1 },
          optimalSendHour: optimalHour,
          confidenceScore: Math.min(100, (existing.dataPoints + 1) * 5),
          lastCalculatedAt: new Date(),
        },
      })
    } else {
      await prisma.emailSendTimeOptimization.create({
        data: {
          userId,
          openRateByHour: { [currentHour.toString()]: 1 },
          dataPoints: 1,
          optimalSendHour: currentHour,
          confidenceScore: 5,
          lastCalculatedAt: new Date(),
        },
      })
    }
  } catch (error) {
    console.error('[Email Webhook] Error updating send time optimization:', error)
  }
}
