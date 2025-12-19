/**
 * Subscription & Premium Feature Gating
 *
 * Helper functions to check subscription status and gate premium features.
 */

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export type SubscriptionPlan = 'basic' | 'premium' | 'gold'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'

export interface SubscriptionInfo {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  isActive: boolean
  isPremium: boolean
  isGold: boolean
  expiresAt: Date | null
  features: PlanFeatures
}

export interface PlanFeatures {
  dailySwipes: number // -1 for unlimited
  superLikesPerDay: number
  canSeeWhoLikedYou: boolean
  canRewind: boolean
  canBoost: boolean
  boostsPerMonth: number
  advancedFilters: boolean
  readReceipts: boolean
  priorityLikes: boolean
  noAds: boolean
  videoChat: boolean
  incognitoMode: boolean
}

// Feature limits per plan
const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  basic: {
    dailySwipes: 25,
    superLikesPerDay: 1,
    canSeeWhoLikedYou: false,
    canRewind: false,
    canBoost: false,
    boostsPerMonth: 0,
    advancedFilters: false,
    readReceipts: false,
    priorityLikes: false,
    noAds: false,
    videoChat: false,
    incognitoMode: false,
  },
  premium: {
    dailySwipes: -1, // unlimited
    superLikesPerDay: 5,
    canSeeWhoLikedYou: true,
    canRewind: true,
    canBoost: true,
    boostsPerMonth: 1,
    advancedFilters: true,
    readReceipts: true,
    priorityLikes: true,
    noAds: true,
    videoChat: false,
    incognitoMode: false,
  },
  gold: {
    dailySwipes: -1, // unlimited
    superLikesPerDay: -1, // unlimited
    canSeeWhoLikedYou: true,
    canRewind: true,
    canBoost: true,
    boostsPerMonth: 5,
    advancedFilters: true,
    readReceipts: true,
    priorityLikes: true,
    noAds: true,
    videoChat: true,
    incognitoMode: true,
  },
}

/**
 * Get subscription info for a user by ID
 */
export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const isExpired = subscription?.endDate
    ? new Date(subscription.endDate) < now
    : true

  const plan: SubscriptionPlan =
    subscription && !isExpired && subscription.status === 'active'
      ? (subscription.plan as SubscriptionPlan) || 'basic'
      : 'basic'

  const status: SubscriptionStatus =
    isExpired ? 'expired' : (subscription?.status as SubscriptionStatus) || 'pending'

  const isActive = status === 'active' && !isExpired
  const isPremium = isActive && (plan === 'premium' || plan === 'gold')
  const isGold = isActive && plan === 'gold'

  return {
    plan,
    status,
    isActive,
    isPremium,
    isGold,
    expiresAt: subscription?.endDate || null,
    features: PLAN_FEATURES[plan],
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
 * Get daily swipe count for a user
 */
export async function getDailySwipeCount(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const count = await prisma.swipe.count({
    where: {
      swiperId: userId,
      createdAt: { gte: today },
    },
  })

  return count
}

/**
 * Check if user can swipe (hasn't reached daily limit)
 */
export async function canSwipe(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const subscription = await getSubscriptionInfo(userId)
  const dailyLimit = subscription.features.dailySwipes

  // Unlimited swipes
  if (dailyLimit === -1) {
    return { allowed: true, remaining: -1 }
  }

  const currentCount = await getDailySwipeCount(userId)
  const remaining = Math.max(0, dailyLimit - currentCount)

  return {
    allowed: remaining > 0,
    remaining,
  }
}

/**
 * Get daily super like count for a user
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

/**
 * Check if user can super like
 */
export async function canSuperLike(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const subscription = await getSubscriptionInfo(userId)
  const dailyLimit = subscription.features.superLikesPerDay

  // Unlimited super likes
  if (dailyLimit === -1) {
    return { allowed: true, remaining: -1 }
  }

  const currentCount = await getDailySuperLikeCount(userId)
  const remaining = Math.max(0, dailyLimit - currentCount)

  return {
    allowed: remaining > 0,
    remaining,
  }
}

/**
 * Feature gate error response
 */
export function featureGateError(feature: string, requiredPlan: SubscriptionPlan = 'premium') {
  return {
    error: 'Premium feature',
    message: `${feature} is een premium functie. Upgrade naar ${requiredPlan} om deze functie te gebruiken.`,
    requiredPlan,
    upgradeUrl: '/subscription',
  }
}

/**
 * Check if a user has a specific feature (alias for canUseFeature)
 * Maps feature names to plan features
 */
export async function hasFeature(
  userId: string,
  feature: 'seeWhoLikesYou' | 'canRewind' | 'canBoost' | 'readReceipts' | 'videoChat' | 'incognitoMode'
): Promise<boolean> {
  const featureMap: Record<string, keyof PlanFeatures> = {
    seeWhoLikesYou: 'canSeeWhoLikedYou',
    canRewind: 'canRewind',
    canBoost: 'canBoost',
    readReceipts: 'readReceipts',
    videoChat: 'videoChat',
    incognitoMode: 'incognitoMode',
  }

  const mappedFeature = featureMap[feature] || feature
  return canUseFeature(userId, mappedFeature as keyof PlanFeatures)
}
