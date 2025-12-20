/**
 * Subscription & Premium Feature Gating
 *
 * Helper functions to check subscription status and gate premium features.
 * Updated voor het "Vriend van de Liefde" model.
 */

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SubscriptionTier } from '@prisma/client'

export type SubscriptionPlan = 'FREE' | 'PLUS' | 'COMPLETE'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'

export interface SubscriptionInfo {
  plan: SubscriptionPlan
  tier: SubscriptionTier
  status: SubscriptionStatus
  isActive: boolean
  isPlus: boolean
  isComplete: boolean
  expiresAt: Date | null
  features: PlanFeatures
  credits: number
  monthlySupermessages: number
}

export interface PlanFeatures {
  dailyLikes: number // -1 for unlimited
  dailyChats: number // -1 for unlimited
  canSeeWhoLikedYou: boolean
  canSendAudio: boolean
  canBoost: boolean
  boostsPerMonth: number
  advancedFilters: boolean
  readReceipts: boolean
  priorityInSearch: boolean
  noAds: boolean
  monthlySupermessages: number
}

// Feature limits per plan - "Vriend van de Liefde" Model
const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    dailyLikes: 10,
    dailyChats: 1,
    canSeeWhoLikedYou: false,
    canSendAudio: false,
    canBoost: false,
    boostsPerMonth: 0,
    advancedFilters: false,
    readReceipts: false,
    priorityInSearch: false,
    noAds: false,
    monthlySupermessages: 0,
  },
  PLUS: {
    dailyLikes: -1, // unlimited
    dailyChats: -1, // unlimited
    canSeeWhoLikedYou: true,
    canSendAudio: true,
    canBoost: false,
    boostsPerMonth: 0,
    advancedFilters: false,
    readReceipts: true,
    priorityInSearch: false,
    noAds: true,
    monthlySupermessages: 0,
  },
  COMPLETE: {
    dailyLikes: -1, // unlimited
    dailyChats: -1, // unlimited
    canSeeWhoLikedYou: true,
    canSendAudio: true,
    canBoost: true,
    boostsPerMonth: 1,
    advancedFilters: true,
    readReceipts: true,
    priorityInSearch: true,
    noAds: true,
    monthlySupermessages: 3,
  },
}

/**
 * Get subscription info for a user by ID
 */
export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  // Haal gebruiker op met subscriptionTier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      credits: true,
      monthlySupermessages: true,
    },
  })

  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const isExpired = subscription?.endDate
    ? new Date(subscription.endDate) < now
    : false

  // Gebruik subscriptionTier van user als primaire bron
  const tier = user?.subscriptionTier || 'FREE'
  const plan: SubscriptionPlan = tier as SubscriptionPlan

  const status: SubscriptionStatus =
    isExpired ? 'expired' : (subscription?.status as SubscriptionStatus) || 'active'

  const isActive = (status === 'active' && !isExpired) || tier === 'FREE'
  const isPlus = isActive && (tier === 'PLUS' || tier === 'COMPLETE')
  const isComplete = isActive && tier === 'COMPLETE'

  return {
    plan,
    tier,
    status,
    isActive,
    isPlus,
    isComplete,
    expiresAt: subscription?.endDate || null,
    features: PLAN_FEATURES[plan],
    credits: user?.credits || 0,
    monthlySupermessages: user?.monthlySupermessages || 0,
  }
}

/**
 * Get subscription info for the current session user
 */
export async function getCurrentUserSubscription(): Promise<SubscriptionInfo | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return null
  }

  return getSubscriptionInfo(user.id)
}

/**
 * Check if a user can use a specific feature
 */
export async function canUseFeature(
  userId: string,
  feature: keyof PlanFeatures
): Promise<boolean> {
  const subscription = await getSubscriptionInfo(userId)
  const featureValue = subscription.features[feature]

  // For numeric features, check if > 0 or -1 (unlimited)
  if (typeof featureValue === 'number') {
    return featureValue === -1 || featureValue > 0
  }

  return featureValue === true
}

/**
 * Get daily like count for a user
 */
export async function getDailyLikeCount(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const count = await prisma.swipe.count({
    where: {
      swiperId: userId,
      isLike: true,
      createdAt: { gte: today },
    },
  })

  return count
}

/**
 * Check if user can like (hasn't reached daily limit)
 */
export async function canLike(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const subscription = await getSubscriptionInfo(userId)
  const dailyLimit = subscription.features.dailyLikes

  // Unlimited likes
  if (dailyLimit === -1) {
    return { allowed: true, remaining: -1 }
  }

  const currentCount = await getDailyLikeCount(userId)
  const remaining = Math.max(0, dailyLimit - currentCount)

  return {
    allowed: remaining > 0,
    remaining,
  }
}

/**
 * Get daily chat start count for a user
 */
export async function getDailyChatCount(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Tel eerste berichten in matches die vandaag zijn gestart
  const count = await prisma.message.count({
    where: {
      senderId: userId,
      createdAt: { gte: today },
      match: {
        createdAt: { gte: today },
      },
    },
  })

  return count
}

/**
 * Check if user can start a new chat
 */
export async function canStartChat(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const subscription = await getSubscriptionInfo(userId)
  const dailyLimit = subscription.features.dailyChats

  // Unlimited chats
  if (dailyLimit === -1) {
    return { allowed: true, remaining: -1 }
  }

  const currentCount = await getDailyChatCount(userId)
  const remaining = Math.max(0, dailyLimit - currentCount)

  return {
    allowed: remaining > 0,
    remaining,
  }
}

/**
 * Feature gate error response
 */
export function featureGateError(feature: string, requiredPlan: SubscriptionPlan = 'PLUS') {
  const planNames: Record<SubscriptionPlan, string> = {
    FREE: 'Basis',
    PLUS: 'Liefde Plus',
    COMPLETE: 'Liefde Compleet',
  }

  return {
    error: 'Premium functie',
    message: `${feature} is beschikbaar met ${planNames[requiredPlan]}. Upgrade je abonnement om deze functie te gebruiken.`,
    requiredPlan,
    upgradeUrl: '/prijzen',
  }
}

/**
 * Check if a user has a specific feature
 */
export async function hasFeature(
  userId: string,
  feature: 'seeWhoLikesYou' | 'canSendAudio' | 'canBoost' | 'readReceipts' | 'advancedFilters' | 'priorityInSearch' | 'canRewind'
): Promise<boolean> {
  // canRewind is now part of PLUS+ plans (mapped to canSeeWhoLikedYou as proxy)
  const featureMap: Record<string, keyof PlanFeatures> = {
    seeWhoLikesYou: 'canSeeWhoLikedYou',
    canSendAudio: 'canSendAudio',
    canBoost: 'canBoost',
    readReceipts: 'readReceipts',
    advancedFilters: 'advancedFilters',
    priorityInSearch: 'priorityInSearch',
    canRewind: 'canSeeWhoLikedYou', // Rewind is available for PLUS+
  }

  const mappedFeature = featureMap[feature] || feature
  return canUseFeature(userId, mappedFeature as keyof PlanFeatures)
}

/**
 * Get remaining supermessages for user (monthly + purchased credits)
 */
export async function getRemainingSupermessages(userId: string): Promise<{ monthly: number; purchased: number; total: number }> {
  const subscription = await getSubscriptionInfo(userId)

  return {
    monthly: subscription.monthlySupermessages,
    purchased: subscription.credits,
    total: subscription.monthlySupermessages + subscription.credits,
  }
}

// ============================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================

/**
 * @deprecated Use canLike instead
 */
export const canSwipe = canLike

/**
 * @deprecated Use getDailyLikeCount instead
 */
export const getDailySwipeCount = getDailyLikeCount

/**
 * Check if user can super like (based on subscription)
 * Super likes are now replaced by Superberichten (credits)
 */
export async function canSuperLike(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const { total } = await getRemainingSupermessages(userId)

  return {
    allowed: total > 0,
    remaining: total,
  }
}

/**
 * Get daily super like count (deprecated - super likes replaced by credits)
 */
export async function getDailySuperLikeCount(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const count = await prisma.swipe.count({
    where: {
      swiperId: userId,
      isSuperLike: true,
      createdAt: { gte: today },
    },
  })

  return count
}
