import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Webhook } from 'svix'

/**
 * Resend Webhook Handler
 * Captures real-time email events: delivered, opened, clicked, bounced, complained
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text()
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('[Webhook] RESEND_WEBHOOK_SECRET not configured')
      return Response.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Verify signature using Svix
    const svixId = req.headers.get('svix-id')
    const svixTimestamp = req.headers.get('svix-timestamp')
    const svixSignature = req.headers.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[Webhook] Missing Svix headers')
      return Response.json({ error: 'Missing signature headers' }, { status: 401 })
    }

    try {
      const wh = new Webhook(webhookSecret)
      wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
      console.log('[Webhook] ✅ Signature verified successfully')
    } catch (err) {
      console.error('[Webhook] ❌ Signature verification failed:', err)
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the payload
    const payload = JSON.parse(body)
    const { type, data } = payload

    const resendId = data.email_id
    if (!resendId) {
      console.error('[Webhook] No email_id in payload')
      return Response.json({ error: 'Missing email_id' }, { status: 400 })
    }

    // Find the migration email
    const email = await prisma.migrationEmail.findFirst({
      where: { resendId },
      include: { migrationUser: true }
    })

    if (!email) {
      console.log(`[Webhook] Email not found for resendId: ${resendId}`)
      return Response.json({ received: true })
    }

    console.log(`[Webhook] Processing ${type} for user ${email.migrationUser.firstName}`)

    // Handle different event types
    switch (type) {
      case 'email.delivered':
        await handleDelivered(email, data)
        break
      case 'email.opened':
        await handleOpened(email, data)
        break
      case 'email.clicked':
        await handleClicked(email, data)
        break
      case 'email.bounced':
        await handleBounced(email, data)
        break
      case 'email.complained':
        await handleComplained(email, data)
        break
      default:
        console.log(`[Webhook] Unknown event type: ${type}`)
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleDelivered(email: any, data: any) {
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: {
      deliveredAt: new Date()
    }
  })
}

async function handleOpened(email: any, data: any) {
  // Update email record
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: {
      openedAt: email.openedAt || new Date(),
      openCount: { increment: 1 }
    }
  })

  // Update user tracking
  await prisma.migrationUser.update({
    where: { id: email.migrationUserId },
    data: {
      lastEmailOpenedAt: new Date(),
      totalEmailsOpened: { increment: 1 },
      status: email.migrationUser.status === 'EMAIL_SENT' ? 'EMAIL_OPENED' : undefined
    }
  })

  console.log(`[Webhook] Email opened by ${email.migrationUser.firstName}`)
}

async function handleClicked(email: any, data: any) {
  const linkUrl = data.link?.url || ''

  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: {
      clickedAt: email.clickedAt || new Date(),
      clickCount: { increment: 1 }
    }
  })

  await prisma.migrationUser.update({
    where: { id: email.migrationUserId },
    data: {
      lastEmailClickedAt: new Date(),
      status: email.migrationUser.status === 'EMAIL_OPENED' ? 'LINK_CLICKED' : undefined
    }
  })

  console.log(`[Webhook] Link clicked by ${email.migrationUser.firstName}: ${linkUrl}`)
}

async function handleBounced(email: any, data: any) {
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: {
      bouncedAt: new Date(),
      errorMessage: data.bounce?.message || 'Email bounced'
    }
  })

  console.log(`[Webhook] Email bounced for ${email.migrationUser.firstName}`)
}

async function handleComplained(email: any, data: any) {
  await prisma.migrationEmail.update({
    where: { id: email.id },
    data: {
      errorMessage: 'Spam complaint'
    }
  })

  console.log(`[Webhook] Spam complaint from ${email.migrationUser.firstName}`)
}

