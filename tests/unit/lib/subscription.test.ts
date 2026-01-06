/**
 * Subscription Feature Gating Tests
 *
 * Tests for subscription plans and feature access
 * Updated for Drielaags Abonnementsmodel (FREE/PREMIUM/GOLD)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test plan features without database
const PLAN_FEATURES = {
  FREE: {
    dailyLikes: 8,
    dailyChats: 2,
    canSeeWhoLikedYou: false,
    canSendAudio: false,
    canBoost: false,
    boostsPerMonth: 0,
    advancedFilters: false,
    readReceipts: false,
    priorityInSearch: false,
    noAds: false,
    monthlySupermessages: 0,
    canUsePassport: false,
    canUseIncognito: false,
  },
  PREMIUM: {
    dailyLikes: -1,
    dailyChats: -1,
    canSeeWhoLikedYou: true,
    canSendAudio: false, // Only Gold can send audio
    canBoost: false,
    boostsPerMonth: 0,
    advancedFilters: true,
    readReceipts: true,
    priorityInSearch: true,
    noAds: true,
    monthlySupermessages: 0,
    canUsePassport: false,
    canUseIncognito: false,
  },
  GOLD: {
    dailyLikes: -1,
    dailyChats: -1,
    canSeeWhoLikedYou: true,
    canSendAudio: true,
    canBoost: true,
    boostsPerMonth: 1,
    advancedFilters: true,
    readReceipts: true,
    priorityInSearch: true,
    noAds: true,
    monthlySupermessages: 5, // 5 Super Likes per week
    canUsePassport: true,
    canUseIncognito: true,
  },
}

type SubscriptionPlan = 'FREE' | 'PREMIUM' | 'GOLD'
type PlanFeatures = typeof PLAN_FEATURES.FREE

// Helper functions for testing (mirroring the actual implementation)
function canUseFeature(plan: SubscriptionPlan, feature: keyof PlanFeatures): boolean {
  const features = PLAN_FEATURES[plan]
  const featureValue = features[feature]

  if (typeof featureValue === 'number') {
    return featureValue === -1 || featureValue > 0
  }

  return featureValue === true
}

function calculateRemainingLikes(plan: SubscriptionPlan, currentCount: number): { allowed: boolean; remaining: number } {
  const dailyLimit = PLAN_FEATURES[plan].dailyLikes

  if (dailyLimit === -1) {
    return { allowed: true, remaining: -1 }
  }

  const remaining = Math.max(0, dailyLimit - currentCount)
  return { allowed: remaining > 0, remaining }
}

function featureGateError(feature: string, requiredPlan: SubscriptionPlan = 'PREMIUM') {
  const planNames: Record<SubscriptionPlan, string> = {
    FREE: 'Gratis',
    PREMIUM: 'Premium',
    GOLD: 'Gold',
  }

  return {
    error: 'Premium functie',
    message: `${feature} is beschikbaar met ${planNames[requiredPlan]}. Upgrade je abonnement om deze functie te gebruiken.`,
    requiredPlan,
    upgradeUrl: '/prijzen',
  }
}

describe('Plan Features', () => {
  describe('FREE plan', () => {
    it('should have limited daily likes', () => {
      expect(PLAN_FEATURES.FREE.dailyLikes).toBe(8)
    })

    it('should have limited daily chats', () => {
      expect(PLAN_FEATURES.FREE.dailyChats).toBe(2)
    })

    it('should not have premium features', () => {
      expect(PLAN_FEATURES.FREE.canSeeWhoLikedYou).toBe(false)
      expect(PLAN_FEATURES.FREE.canSendAudio).toBe(false)
      expect(PLAN_FEATURES.FREE.canBoost).toBe(false)
      expect(PLAN_FEATURES.FREE.readReceipts).toBe(false)
      expect(PLAN_FEATURES.FREE.advancedFilters).toBe(false)
      expect(PLAN_FEATURES.FREE.canUsePassport).toBe(false)
      expect(PLAN_FEATURES.FREE.canUseIncognito).toBe(false)
    })

    it('should have ads', () => {
      expect(PLAN_FEATURES.FREE.noAds).toBe(false)
    })
  })

  describe('PREMIUM plan', () => {
    it('should have unlimited daily likes', () => {
      expect(PLAN_FEATURES.PREMIUM.dailyLikes).toBe(-1)
    })

    it('should have unlimited daily chats', () => {
      expect(PLAN_FEATURES.PREMIUM.dailyChats).toBe(-1)
    })

    it('should have basic premium features', () => {
      expect(PLAN_FEATURES.PREMIUM.canSeeWhoLikedYou).toBe(true)
      expect(PLAN_FEATURES.PREMIUM.advancedFilters).toBe(true)
      expect(PLAN_FEATURES.PREMIUM.readReceipts).toBe(true)
      expect(PLAN_FEATURES.PREMIUM.priorityInSearch).toBe(true)
      expect(PLAN_FEATURES.PREMIUM.noAds).toBe(true)
    })

    it('should not have Gold features', () => {
      expect(PLAN_FEATURES.PREMIUM.canSendAudio).toBe(false)
      expect(PLAN_FEATURES.PREMIUM.canBoost).toBe(false)
      expect(PLAN_FEATURES.PREMIUM.canUsePassport).toBe(false)
      expect(PLAN_FEATURES.PREMIUM.canUseIncognito).toBe(false)
    })
  })

  describe('GOLD plan', () => {
    it('should have all features enabled', () => {
      const gold = PLAN_FEATURES.GOLD

      expect(gold.dailyLikes).toBe(-1)
      expect(gold.dailyChats).toBe(-1)
      expect(gold.canSeeWhoLikedYou).toBe(true)
      expect(gold.canSendAudio).toBe(true)
      expect(gold.canBoost).toBe(true)
      expect(gold.advancedFilters).toBe(true)
      expect(gold.readReceipts).toBe(true)
      expect(gold.priorityInSearch).toBe(true)
      expect(gold.noAds).toBe(true)
      expect(gold.canUsePassport).toBe(true)
      expect(gold.canUseIncognito).toBe(true)
    })

    it('should have monthly boosts and supermessages', () => {
      expect(PLAN_FEATURES.GOLD.boostsPerMonth).toBe(1)
      expect(PLAN_FEATURES.GOLD.monthlySupermessages).toBe(5)
    })
  })
})

describe('canUseFeature', () => {
  it('should return true for unlimited features (-1)', () => {
    expect(canUseFeature('PREMIUM', 'dailyLikes')).toBe(true)
    expect(canUseFeature('GOLD', 'dailyLikes')).toBe(true)
  })

  it('should return true for positive numeric features', () => {
    expect(canUseFeature('FREE', 'dailyLikes')).toBe(true) // 10 > 0
    expect(canUseFeature('GOLD', 'boostsPerMonth')).toBe(true) // 1 > 0
  })

  it('should return false for zero numeric features', () => {
    expect(canUseFeature('FREE', 'boostsPerMonth')).toBe(false) // 0
    expect(canUseFeature('FREE', 'monthlySupermessages')).toBe(false) // 0
  })

  it('should return correct boolean for boolean features', () => {
    expect(canUseFeature('FREE', 'canSeeWhoLikedYou')).toBe(false)
    expect(canUseFeature('PREMIUM', 'canSeeWhoLikedYou')).toBe(true)
    expect(canUseFeature('GOLD', 'canUsePassport')).toBe(true)
  })
})

describe('calculateRemainingLikes', () => {
  it('should return unlimited for premium plans', () => {
    const result = calculateRemainingLikes('PREMIUM', 100)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(-1)
  })

  it('should calculate remaining likes for FREE plan', () => {
    const result = calculateRemainingLikes('FREE', 3)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(5) // 8 - 3
  })

  it('should block when limit is reached', () => {
    const result = calculateRemainingLikes('FREE', 8)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should not go negative', () => {
    const result = calculateRemainingLikes('FREE', 12) // Over limit
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})

describe('featureGateError', () => {
  it('should return correct error message for PREMIUM', () => {
    const error = featureGateError('Wie jou leuk vindt zien', 'PREMIUM')

    expect(error.error).toBe('Premium functie')
    expect(error.message).toContain('Premium')
    expect(error.requiredPlan).toBe('PREMIUM')
    expect(error.upgradeUrl).toBe('/prijzen')
  })

  it('should return correct error message for GOLD', () => {
    const error = featureGateError('Passport', 'GOLD')

    expect(error.message).toContain('Gold')
    expect(error.requiredPlan).toBe('GOLD')
  })

  it('should default to PREMIUM if no plan specified', () => {
    const error = featureGateError('Audio berichten')

    expect(error.requiredPlan).toBe('PREMIUM')
    expect(error.message).toContain('Premium')
  })
})

describe('Feature Access Hierarchy', () => {
  it('should have progressively more features from FREE to GOLD', () => {
    const freeBooleanFeatures = Object.values(PLAN_FEATURES.FREE).filter(v => typeof v === 'boolean')
    const premiumBooleanFeatures = Object.values(PLAN_FEATURES.PREMIUM).filter(v => typeof v === 'boolean')
    const goldBooleanFeatures = Object.values(PLAN_FEATURES.GOLD).filter(v => typeof v === 'boolean')

    const freeTrue = freeBooleanFeatures.filter(v => v === true).length
    const premiumTrue = premiumBooleanFeatures.filter(v => v === true).length
    const goldTrue = goldBooleanFeatures.filter(v => v === true).length

    expect(premiumTrue).toBeGreaterThan(freeTrue)
    expect(goldTrue).toBeGreaterThan(premiumTrue)
  })

  it('should only have Passport for GOLD plan', () => {
    expect(PLAN_FEATURES.FREE.canUsePassport).toBe(false)
    expect(PLAN_FEATURES.PREMIUM.canUsePassport).toBe(false)
    expect(PLAN_FEATURES.GOLD.canUsePassport).toBe(true)
  })

  it('should only have Incognito for GOLD plan', () => {
    expect(PLAN_FEATURES.FREE.canUseIncognito).toBe(false)
    expect(PLAN_FEATURES.PREMIUM.canUseIncognito).toBe(false)
    expect(PLAN_FEATURES.GOLD.canUseIncognito).toBe(true)
  })

  it('should only have Audio for GOLD plan', () => {
    expect(PLAN_FEATURES.FREE.canSendAudio).toBe(false)
    expect(PLAN_FEATURES.PREMIUM.canSendAudio).toBe(false)
    expect(PLAN_FEATURES.GOLD.canSendAudio).toBe(true)
  })
})
