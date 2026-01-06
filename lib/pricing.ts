/**
 * Pricing Configuration - Drielaags Abonnementsmodel
 *
 * Een innovatief model dat toegankelijkheid en premium waarde combineert.
 * Elk niveau biedt duidelijke meerwaarde ten opzichte van het vorige.
 *
 * - Gratis: Drempelverlagend instappen
 * - Premium: Volledige dating ervaring
 * - Gold: Ultimate veiligheid en features
 */

import { SubscriptionTier } from '@prisma/client'

// ============================================
// BILLING PERIODS
// ============================================

export type BillingPeriod = 'month' | '3months' | '6months' | 'year' | 'lifetime'

export const BILLING_PERIODS: Record<BillingPeriod, { label: string; months: number; days: number }> = {
  month: { label: 'per maand', months: 1, days: 30 },
  '3months': { label: 'per kwartaal', months: 3, days: 90 },
  '6months': { label: 'per halfjaar', months: 6, days: 180 },
  year: { label: 'per jaar', months: 12, days: 365 },
  lifetime: { label: 'eenmalig', months: 9999, days: 36500 }, // ~100 jaar
}

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export interface SubscriptionPlan {
  id: string
  tier: SubscriptionTier
  name: string
  description: string
  price: number // in euros
  period: BillingPeriod
  periodLabel: string
  pricePerMonth: number
  savings?: string // Concrete besparing voor LVB
  savingsPercent?: number
  features: string[]
  highlighted?: boolean
  badge?: string
  supportsDirectDebit?: boolean
  isLifetime?: boolean
}

// ============================================
// GRATIS (BASIS)
// ============================================

const FREE_FEATURES = [
  'Profiel aanmaken en foto\'s uploaden',
  '8 profielen per dag bekijken',
  '2 berichten per dag verzenden',
  'Blokkeren en rapporteren',
  'Simple Mode interface',
  'Kennisbank artikelen lezen',
]

// ============================================
// PREMIUM FEATURES
// ============================================

const PREMIUM_FEATURES = [
  'Onbeperkt berichten versturen',
  'Onbeperkt profielen bekijken',
  'AI DatingAssistent voor profieltekst',
  'Geavanceerde zoekfilters',
  'Zie wie jou leuk vindt',
  'Simple, Standard of Advanced mode',
  'Prioriteit in zoekresultaten',
]

// ============================================
// GOLD FEATURES (bovenop Premium)
// ============================================

const GOLD_FEATURES = [
  'Alles van Premium',
  'AI Romance Scam Detectie',
  'Veiligheidsscore Dashboard',
  'Geavanceerde AI DatingAssistent',
  'Audio berichten sturen',
  'Onbeperkt terugdraaien',
  '5 Super Likes per week',
  'Goud badge op profiel',
  'Prioriteit klantenservice (24 uur)',
]

// ============================================
// PRIJZEN CONFIGURATIE
// ============================================

// Premium prijzen
const PREMIUM_PRICES = {
  month: 12.99,
  '3months': 29.99,  // €9,99/mnd - 23% korting
  '6months': 47.99,  // €7,99/mnd - 38% korting
  year: 79.99,       // €6,66/mnd - 49% korting
}

// Gold prijzen (bovenop Premium waarde)
const GOLD_PRICES = {
  '3months': 44.99,  // €14,99/mnd
  '6months': 74.99,  // €12,49/mnd
  lifetime: 149.99,  // Eenmalig
}

// ============================================
// ALLE PLANNEN
// ============================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // ============================================
  // GRATIS
  // ============================================
  {
    id: 'FREE',
    tier: 'FREE',
    name: 'Gratis',
    description: 'Gratis starten met daten',
    price: 0,
    period: 'month',
    periodLabel: 'Altijd gratis',
    pricePerMonth: 0,
    features: FREE_FEATURES,
  },

  // ============================================
  // PREMIUM
  // ============================================
  {
    id: 'PREMIUM_MONTH',
    tier: 'PREMIUM',
    name: 'Premium',
    description: 'Volledige dating ervaring',
    price: PREMIUM_PRICES.month,
    period: 'month',
    periodLabel: 'per maand',
    pricePerMonth: PREMIUM_PRICES.month,
    features: PREMIUM_FEATURES,
    supportsDirectDebit: true,
  },
  {
    id: 'PREMIUM_QUARTER',
    tier: 'PREMIUM',
    name: 'Premium',
    description: 'Volledige dating ervaring',
    price: PREMIUM_PRICES['3months'],
    period: '3months',
    periodLabel: 'voor 3 maanden',
    pricePerMonth: Math.round((PREMIUM_PRICES['3months'] / 3) * 100) / 100, // €9,99
    savings: 'Je bespaart bijna 9 euro',
    savingsPercent: 23,
    features: PREMIUM_FEATURES,
    highlighted: true,
    badge: 'Aanbevolen',
    supportsDirectDebit: true,
  },
  {
    id: 'PREMIUM_HALF',
    tier: 'PREMIUM',
    name: 'Premium',
    description: 'Volledige dating ervaring',
    price: PREMIUM_PRICES['6months'],
    period: '6months',
    periodLabel: 'voor 6 maanden',
    pricePerMonth: Math.round((PREMIUM_PRICES['6months'] / 6) * 100) / 100, // €7,99
    savings: 'Je bespaart bijna 30 euro',
    savingsPercent: 38,
    features: PREMIUM_FEATURES,
    supportsDirectDebit: true,
  },
  {
    id: 'PREMIUM_YEAR',
    tier: 'PREMIUM',
    name: 'Premium',
    description: 'Volledige dating ervaring',
    price: PREMIUM_PRICES.year,
    period: 'year',
    periodLabel: 'voor 12 maanden',
    pricePerMonth: Math.round((PREMIUM_PRICES.year / 12) * 100) / 100, // €6,66
    savings: 'Je bespaart bijna 76 euro',
    savingsPercent: 49,
    badge: 'Beste waarde',
    features: PREMIUM_FEATURES,
    supportsDirectDebit: true,
  },

  // ============================================
  // GOLD (ULTIMATE)
  // ============================================
  {
    id: 'GOLD_QUARTER',
    tier: 'GOLD',
    name: 'Gold',
    description: 'Ultimate veiligheid en features',
    price: GOLD_PRICES['3months'],
    period: '3months',
    periodLabel: 'voor 3 maanden',
    pricePerMonth: Math.round((GOLD_PRICES['3months'] / 3) * 100) / 100, // €14,99
    features: GOLD_FEATURES,
    supportsDirectDebit: true,
  },
  {
    id: 'GOLD_HALF',
    tier: 'GOLD',
    name: 'Gold',
    description: 'Ultimate veiligheid en features',
    price: GOLD_PRICES['6months'],
    period: '6months',
    periodLabel: 'voor 6 maanden',
    pricePerMonth: Math.round((GOLD_PRICES['6months'] / 6) * 100) / 100, // €12,49
    savings: 'Je bespaart 15 euro',
    features: GOLD_FEATURES,
    highlighted: true,
    badge: 'Populair',
    supportsDirectDebit: true,
  },
  {
    id: 'GOLD_LIFETIME',
    tier: 'GOLD',
    name: 'Gold Lifetime',
    description: 'Voor altijd Gold member',
    price: GOLD_PRICES.lifetime,
    period: 'lifetime',
    periodLabel: 'eenmalig',
    pricePerMonth: 0, // N/A voor lifetime
    savings: 'Nooit meer betalen',
    features: GOLD_FEATURES,
    badge: 'Beste waarde',
    isLifetime: true,
    supportsDirectDebit: false, // Eenmalige betaling
  },
]

// Legacy mapping voor backwards compatibility
export const LEGACY_PLAN_MAP: Record<string, string> = {
  'PLUS': 'PREMIUM_MONTH',
  'PLUS_MONTH': 'PREMIUM_MONTH',
  'PLUS_QUARTER': 'PREMIUM_QUARTER',
  'PLUS_HALF': 'PREMIUM_HALF',
  'PLUS_YEAR': 'PREMIUM_YEAR',
  'COMPLETE': 'GOLD_QUARTER',
  'COMPLETE_MONTH': 'GOLD_QUARTER',
  'COMPLETE_QUARTER': 'GOLD_QUARTER',
  'COMPLETE_HALF': 'GOLD_HALF',
  'COMPLETE_YEAR': 'GOLD_HALF',
}

// ============================================
// FEATURE CONFIGURATION PER TIER
// ============================================

export interface TierFeatures {
  dailyProfileViews: number // -1 voor onbeperkt
  dailyMessages: number // -1 voor onbeperkt
  canSeeWhoLikedYou: boolean
  canSendAudio: boolean
  aiDatingAssistent: boolean
  advancedAiAssistent: boolean
  advancedFilters: boolean
  priorityInSearch: boolean
  interfaceModes: ('simple' | 'standard' | 'advanced')[]
  scamDetection: boolean
  safetyDashboard: boolean
  unlimitedUndo: boolean
  superLikesPerWeek: number
  goldBadge: boolean
  prioritySupport: boolean
  readReceipts: boolean
  noAds: boolean
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  FREE: {
    dailyProfileViews: 8,
    dailyMessages: 2,
    canSeeWhoLikedYou: false,
    canSendAudio: false,
    aiDatingAssistent: false,
    advancedAiAssistent: false,
    advancedFilters: false,
    priorityInSearch: false,
    interfaceModes: ['simple'],
    scamDetection: false,
    safetyDashboard: false,
    unlimitedUndo: false,
    superLikesPerWeek: 0,
    goldBadge: false,
    prioritySupport: false,
    readReceipts: false,
    noAds: false,
  },
  PREMIUM: {
    dailyProfileViews: -1,
    dailyMessages: -1,
    canSeeWhoLikedYou: true,
    canSendAudio: false,
    aiDatingAssistent: true,
    advancedAiAssistent: false,
    advancedFilters: true,
    priorityInSearch: true,
    interfaceModes: ['simple', 'standard', 'advanced'],
    scamDetection: false,
    safetyDashboard: false,
    unlimitedUndo: false,
    superLikesPerWeek: 0,
    goldBadge: false,
    prioritySupport: false,
    readReceipts: true,
    noAds: true,
  },
  GOLD: {
    dailyProfileViews: -1,
    dailyMessages: -1,
    canSeeWhoLikedYou: true,
    canSendAudio: true,
    aiDatingAssistent: true,
    advancedAiAssistent: true,
    advancedFilters: true,
    priorityInSearch: true,
    interfaceModes: ['simple', 'standard', 'advanced'],
    scamDetection: true,
    safetyDashboard: true,
    unlimitedUndo: true,
    superLikesPerWeek: 5,
    goldBadge: true,
    prioritySupport: true,
    readReceipts: true,
    noAds: true,
  },
}

// ============================================
// CREDIT PACKS (SUPER LIKES)
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
    id: 'superlike_5',
    credits: 5,
    price: 4.99,
    label: '5 Super Likes',
    pricePerCredit: 0.99,
  },
  {
    id: 'superlike_15',
    credits: 15,
    price: 11.99,
    label: '15 Super Likes',
    pricePerCredit: 0.80,
  },
  {
    id: 'superlike_30',
    credits: 30,
    price: 19.99,
    label: '30 Super Likes',
    pricePerCredit: 0.67,
  },
]

// ============================================
// SAFETY LIMITS
// ============================================

export const SAFETY_LIMITS = {
  DEFAULT_DAILY_SPENDING_LIMIT: 30.00,
  MAX_CREDIT_PURCHASE: 20.00,
  PURCHASE_COOLDOWN_MINUTES: 5,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get plan by ID (supports legacy IDs)
 */
export function getPlanById(id: string): SubscriptionPlan | undefined {
  const mappedId = LEGACY_PLAN_MAP[id] || id
  return SUBSCRIPTION_PLANS.find(plan => plan.id === mappedId)
}

/**
 * Get all plans for a specific tier
 */
export function getPlansByTier(tier: SubscriptionTier): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter(plan => plan.tier === tier)
}

/**
 * Get plans grouped by tier
 */
export function getPlansGroupedByTier(): Record<SubscriptionTier, SubscriptionPlan[]> {
  return {
    FREE: getPlansByTier('FREE'),
    PREMIUM: getPlansByTier('PREMIUM'),
    GOLD: getPlansByTier('GOLD'),
  }
}

/**
 * Get the default (recommended) plan for a tier
 */
export function getDefaultPlanForTier(tier: SubscriptionTier): SubscriptionPlan | undefined {
  const plans = getPlansByTier(tier)
  return plans.find(p => p.highlighted) || plans[0]
}

/**
 * Get credit pack by ID
 */
export function getCreditPackById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find(pack => pack.id === id)
}

/**
 * Format price in Dutch locale
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

/**
 * Get tier features
 */
export function getTierFeatures(tier: SubscriptionTier): TierFeatures {
  return TIER_FEATURES[tier]
}

/**
 * Check if tier is higher than another
 */
export function isHigherTier(current: SubscriptionTier, required: SubscriptionTier): boolean {
  const tierOrder: SubscriptionTier[] = ['FREE', 'PREMIUM', 'GOLD']
  return tierOrder.indexOf(current) >= tierOrder.indexOf(required)
}

/**
 * Get duration in days for a plan
 */
export function getPlanDurationDays(planId: string): number {
  const plan = getPlanById(planId)
  if (!plan) return 30
  return BILLING_PERIODS[plan.period].days
}

/**
 * Get plans that support direct debit
 */
export function getDirectDebitPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS.filter(plan => plan.supportsDirectDebit)
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    FREE: 'Gratis',
    PREMIUM: 'Premium',
    GOLD: 'Gold',
  }
  return names[tier]
}

/**
 * Get Premium vs Gold price difference for display
 */
export function getGoldPremiumDifference(period: '3months' | '6months'): number {
  const premiumPrice = period === '3months' ? PREMIUM_PRICES['3months'] : PREMIUM_PRICES['6months']
  const goldPrice = period === '3months' ? GOLD_PRICES['3months'] : GOLD_PRICES['6months']
  const months = period === '3months' ? 3 : 6
  return Math.round(((goldPrice - premiumPrice) / months) * 100) / 100
}
