/**
 * Pricing Configuration - "Vriend van de Liefde" Model
 *
 * Toegankelijke prijsstructuur voor de LVB-doelgroep.
 * Geen abstracte termen, duidelijke namen en ethische bescherming.
 */

import { SubscriptionTier } from '@prisma/client'

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  description: string
  price: number // in euros
  period: 'month' | '3months' | 'year'
  periodLabel: string
  pricePerMonth: number
  savings?: string // Concrete besparing, geen percentages
  features: string[]
  highlighted?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'FREE',
    name: 'Basis',
    description: 'Gratis starten met daten',
    price: 0,
    period: 'month',
    periodLabel: 'Altijd gratis',
    pricePerMonth: 0,
    features: [
      'Profiel aanmaken',
      '10 likes per dag',
      '1 chat per dag starten',
      'Basis zoekfilters',
    ],
  },
  {
    id: 'PLUS',
    name: 'Liefde Plus',
    description: 'Meer kans op een match',
    price: 9.95,
    period: 'month',
    periodLabel: 'per maand',
    pricePerMonth: 9.95,
    features: [
      'Onbeperkt chatten',
      'Onbeperkt likes',
      'Zien wie jou leuk vindt',
      'Audioberichten sturen',
      'Leesbevestigingen',
      'Geen advertenties',
    ],
    highlighted: true,
  },
  {
    id: 'COMPLETE',
    name: 'Liefde Compleet',
    description: 'Alles voor de beste kans',
    price: 24.95,
    period: '3months',
    periodLabel: 'voor 3 maanden',
    pricePerMonth: 8.32,
    savings: 'Je bespaart bijna 5 euro', // Concrete besparing
    features: [
      'Alles van Liefde Plus',
      '3 Superberichten per maand',
      'Profiel boost (1x per maand)',
      'Prioriteit in zoekresultaten',
      'Geavanceerde filters',
    ],
  },
]

// ============================================
// CREDIT PACKS (SUPERBERICHTEN)
// ============================================

export interface CreditPack {
  id: string
  credits: number
  price: number
  label: string
  pricePerCredit: number
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'pack_1',
    credits: 1,
    price: 1.50,
    label: 'Stuur 1 persoon direct een bericht',
    pricePerCredit: 1.50,
  },
  {
    id: 'pack_5',
    credits: 5,
    price: 6.00,
    label: 'Stuur 5 mensen direct een bericht',
    pricePerCredit: 1.20,
  },
]

// ============================================
// FEATURE CONFIGURATION
// ============================================

export interface TierFeatures {
  dailyLikes: number // -1 voor onbeperkt
  dailyChats: number // -1 voor onbeperkt
  canSeeWhoLikedYou: boolean
  canSendAudio: boolean
  readReceipts: boolean
  noAds: boolean
  monthlySupermessages: number
  monthlyBoosts: number
  priorityInSearch: boolean
  advancedFilters: boolean
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    dailyLikes: 10,
    dailyChats: 1,
    canSeeWhoLikedYou: false,
    canSendAudio: false,
    readReceipts: false,
    noAds: false,
    monthlySupermessages: 0,
    monthlyBoosts: 0,
    priorityInSearch: false,
    advancedFilters: false,
  },
  PLUS: {
    dailyLikes: -1,
    dailyChats: -1,
    canSeeWhoLikedYou: true,
    canSendAudio: true,
    readReceipts: true,
    noAds: true,
    monthlySupermessages: 0,
    monthlyBoosts: 0,
    priorityInSearch: false,
    advancedFilters: false,
  },
  COMPLETE: {
    dailyLikes: -1,
    dailyChats: -1,
    canSeeWhoLikedYou: true,
    canSendAudio: true,
    readReceipts: true,
    noAds: true,
    monthlySupermessages: 3,
    monthlyBoosts: 1,
    priorityInSearch: true,
    advancedFilters: true,
  },
}

// ============================================
// SAFETY LIMITS
// ============================================

export const SAFETY_LIMITS = {
  // Maximale dagelijkse uitgave voor bescherming
  DEFAULT_DAILY_SPENDING_LIMIT: 20.00,

  // Maximale bundle grootte (geen €30+ bundles)
  MAX_CREDIT_PURCHASE: 10.00,

  // Cooldown tussen aankopen (minuten)
  PURCHASE_COOLDOWN_MINUTES: 5,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPlanById(id: SubscriptionTier): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id)
}

export function getCreditPackById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find(pack => pack.id === id)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return TIER_FEATURES[tier]
}

/**
 * Check of een tier hoger is dan een andere
 */
export function isHigherTier(current: SubscriptionTier, required: SubscriptionTier): boolean {
  const tierOrder: SubscriptionTier[] = ['FREE', 'PLUS', 'COMPLETE']
  return tierOrder.indexOf(current) >= tierOrder.indexOf(required)
}
