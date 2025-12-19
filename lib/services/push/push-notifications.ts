/**
 * Push Notification Service
 *
 * Handles sending push notifications via Web Push API
 * Uses VAPID keys for authentication
 */

import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// Configure VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@liefdevooried.nl'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

// Notification types
export type NotificationType =
  | 'new_match'
  | 'new_message'
  | 'super_like'
  | 'profile_view'
  | 'match_reminder'
  | 'subscription'

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    url?: string
    type?: NotificationType
    matchId?: string
    userId?: string
  }
  actions?: Array<{
    action: string
    title: string
  }>
}

/**
 * Send push notification to a specific user
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[Push] VAPID keys not configured')
    return { success: 0, failed: 0 }
  }

  // Get user's push subscriptions
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId, isActive: true },
  })

  if (subscriptions.length === 0) {
    return { success: 0, failed: 0 }
  }

  let success = 0
  let failed = 0

  const notification = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    tag: payload.tag,
    data: payload.data,
    actions: payload.actions,
  })

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        notification
      )

      // Update last used timestamp
      await prisma.pushSubscription.update({
        where: { id: sub.id },
        data: { lastUsedAt: new Date() },
      })

      success++
    } catch (error: any) {
      console.error(`[Push] Failed to send to ${sub.endpoint}:`, error.message)

      // Handle expired/invalid subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { isActive: false },
        })
      }

      failed++
    }
  }

  return { success, failed }
}

/**
 * Send notification for a new match
 */
export async function sendMatchNotification(
  userId: string,
  matchedUserName: string,
  matchId: string
): Promise<void> {
  await sendPushToUser(userId, {
    title: "Nieuwe Match! 💕",
    body: `${matchedUserName} vindt je ook leuk!`,
    tag: `match-${matchId}`,
    data: {
      type: 'new_match',
      url: `/chat/${matchId}`,
      matchId,
    },
    actions: [
      { action: 'chat', title: 'Stuur bericht' },
      { action: 'view', title: 'Bekijk profiel' },
    ],
  })
}

/**
 * Send notification for a new message
 */
export async function sendMessageNotification(
  userId: string,
  senderName: string,
  messagePreview: string,
  matchId: string
): Promise<void> {
  // Truncate message preview
  const preview = messagePreview.length > 50
    ? messagePreview.substring(0, 50) + '...'
    : messagePreview

  await sendPushToUser(userId, {
    title: senderName,
    body: preview,
    tag: `message-${matchId}`,
    data: {
      type: 'new_message',
      url: `/chat/${matchId}`,
      matchId,
    },
    actions: [
      { action: 'reply', title: 'Beantwoorden' },
    ],
  })
}

/**
 * Send notification for a super like
 */
export async function sendSuperLikeNotification(
  userId: string,
  likerName: string,
  likerId: string
): Promise<void> {
  await sendPushToUser(userId, {
    title: "Super Like! ⭐",
    body: `${likerName} heeft je een Super Like gegeven!`,
    tag: `superlike-${likerId}`,
    data: {
      type: 'super_like',
      url: '/discover',
      userId: likerId,
    },
  })
}

/**
 * Send notification when someone views your profile (premium)
 */
export async function sendProfileViewNotification(
  userId: string,
  viewerName: string,
  viewerId: string
): Promise<void> {
  await sendPushToUser(userId, {
    title: "Iemand heeft je bekeken 👀",
    body: `${viewerName} heeft je profiel bekeken`,
    tag: `view-${viewerId}`,
    data: {
      type: 'profile_view',
      url: '/likes',
      userId: viewerId,
    },
  })
}

/**
 * Save push subscription to database
 */
export async function savePushSubscription(
  userId: string,
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  },
  userAgent?: string
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
      isActive: true,
    },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
      isActive: true,
      lastUsedAt: new Date(),
    },
  })
}

/**
 * Remove push subscription
 */
export async function removePushSubscription(endpoint: string): Promise<void> {
  await prisma.pushSubscription.updateMany({
    where: { endpoint },
    data: { isActive: false },
  })
}

/**
 * Send bulk notification to multiple users
 */
export async function sendBulkNotification(
  userIds: string[],
  payload: PushPayload
): Promise<{ total: number; success: number; failed: number }> {
  let totalSuccess = 0
  let totalFailed = 0

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, payload)
    totalSuccess += result.success
    totalFailed += result.failed
  }

  return {
    total: userIds.length,
    success: totalSuccess,
    failed: totalFailed,
  }
}

/**
 * Get VAPID public key for client subscription
 */
export function getVapidPublicKey(): string {
  return vapidPublicKey
}
