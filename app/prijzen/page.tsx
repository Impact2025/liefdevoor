/**
 * Prijzen Page - Drielaags Abonnementsmodel
 *
 * Features:
 * - Gratis / Premium / Gold tiers
 * - Periode selectie per tier
 * - Lifetime optie voor Gold
 * - Feature vergelijkingstabel
 * - Automatische incasso
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Check,
  X,
  Sparkles,
  Crown,
  Shield,
  ArrowRight,
  Repeat,
  Bot,
  Eye,
  MessageCircle,
  Infinity,
  Undo2,
  Star,
  Headphones,
  Volume2,
} from 'lucide-react'
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  getPlansByTier,
  getGoldPremiumDifference,
  type SubscriptionPlan,
  type BillingPeriod,
} from '@/lib/pricing'
import CheckoutModal from '@/components/checkout/CheckoutModal'

interface CheckoutData {
  type: 'subscription' | 'credits'
  planId?: string
  planName?: string
  planPrice?: number
  planPeriod?: string
  supportsDirectDebit?: boolean
}

// Periode opties
const PREMIUM_PERIODS: { value: BillingPeriod; label: string; months: number }[] = [
  { value: 'month', label: '1 maand', months: 1 },
  { value: '3months', label: '3 maanden', months: 3 },
  { value: '6months', label: '6 maanden', months: 6 },
  { value: 'year', label: '12 maanden', months: 12 },
]

const GOLD_PERIODS: { value: BillingPeriod; label: string }[] = [
  { value: '3months', label: '3 maanden' },
  { value: '6months', label: '6 maanden' },
  { value: 'lifetime', label: 'Lifetime' },
]

export default function PrijzenPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [premiumPeriod, setPremiumPeriod] = useState<BillingPeriod>('3months')
  const [goldPeriod, setGoldPeriod] = useState<BillingPeriod>('6months')

  // Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user) return
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setCurrentPlan(data.plan)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      }
    }
    fetchSubscription()
  }, [session])

  // Get selected plans
  const freePlan = SUBSCRIPTION_PLANS.find(p => p.id === 'FREE')!
  const premiumPlans = getPlansByTier('PREMIUM')
  const goldPlans = getPlansByTier('GOLD')

  const selectedPremiumPlan = premiumPlans.find(p => p.period === premiumPeriod) || premiumPlans[0]
  const selectedGoldPlan = goldPlans.find(p => p.period === goldPeriod) || goldPlans[0]

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === currentPlan) return
    if (!session?.user) {
      router.push('/login?redirect=/prijzen')
      return
    }
    setCheckoutData({
      type: 'subscription',
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      planPeriod: plan.periodLabel,
      supportsDirectDebit: plan.supportsDirectDebit,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white lg:ml-64">
      {/* Header - Mobile */}
      <header className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-xl font-semibold text-gray-900">Liefde Voor Iedereen</span>
            </Link>
            {session ? (
              <Link href="/discover" className="text-primary font-medium">
                Terug
              </Link>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-lg">
                Inloggen
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Kies jouw abonnement
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Van gratis starten tot ultieme veiligheid - er is altijd een plan dat bij jou past
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {/* GRATIS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6 lg:p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gratis</h2>
                <p className="text-sm text-gray-600">Kennismaken met daten</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">€0</span>
              <span className="text-gray-500 ml-2">/ altijd</span>
            </div>

            <ul className="space-y-3 mb-8">
              {freePlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(freePlan)}
              disabled={currentPlan === 'FREE'}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                currentPlan === 'FREE'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {currentPlan === 'FREE' ? 'Huidig plan' : 'Gratis starten'}
            </button>
          </motion.div>

          {/* PREMIUM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-white rounded-2xl border-2 border-rose-300 p-6 lg:p-8 shadow-xl lg:-mt-4 lg:mb-4"
          >
            {selectedPremiumPlan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-rose-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  {selectedPremiumPlan.badge}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Premium</h2>
                <p className="text-sm text-gray-600">Volledige ervaring</p>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {PREMIUM_PERIODS.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setPremiumPeriod(period.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    premiumPeriod === period.value
                      ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <div className="mb-2">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(selectedPremiumPlan.price)}</span>
              <span className="text-gray-500 ml-2">/ {selectedPremiumPlan.periodLabel}</span>
            </div>

            {selectedPremiumPlan.pricePerMonth > 0 && selectedPremiumPlan.period !== 'month' && (
              <p className="text-sm text-gray-600 mb-1">
                = {formatPrice(selectedPremiumPlan.pricePerMonth)} per maand
              </p>
            )}

            {selectedPremiumPlan.savings && (
              <p className="text-sm font-semibold text-green-600 mb-4 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {selectedPremiumPlan.savings}
              </p>
            )}

            <ul className="space-y-3 mb-8">
              {selectedPremiumPlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {selectedPremiumPlan.supportsDirectDebit && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Repeat className="w-4 h-4" />
                <span>Automatische incasso mogelijk</span>
              </div>
            )}

            <button
              onClick={() => handleSelectPlan(selectedPremiumPlan)}
              disabled={currentPlan?.startsWith('PREMIUM')}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                currentPlan?.startsWith('PREMIUM')
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {currentPlan?.startsWith('PREMIUM') ? 'Huidig plan' : 'Kies Premium'}
              {!currentPlan?.startsWith('PREMIUM') && <ArrowRight className="w-5 h-5" />}
            </button>
          </motion.div>

          {/* GOLD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-400 p-6 lg:p-8 shadow-xl lg:-mt-6 lg:mb-6"
          >
            {selectedGoldPlan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                  {selectedGoldPlan.badge}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gold</h2>
                <p className="text-sm text-gray-600">Ultimate veiligheid</p>
              </div>
            </div>

            {/* Period selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {GOLD_PERIODS.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setGoldPeriod(period.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    goldPeriod === period.value
                      ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400'
                      : 'bg-white/70 text-gray-600 hover:bg-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <div className="mb-2">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(selectedGoldPlan.price)}</span>
              <span className="text-gray-500 ml-2">/ {selectedGoldPlan.periodLabel}</span>
            </div>

            {selectedGoldPlan.pricePerMonth > 0 && (
              <p className="text-sm text-gray-600 mb-1">
                = {formatPrice(selectedGoldPlan.pricePerMonth)} per maand
              </p>
            )}

            {selectedGoldPlan.savings && (
              <p className="text-sm font-semibold text-green-600 mb-4 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {selectedGoldPlan.savings}
              </p>
            )}

            {selectedGoldPlan.isLifetime && (
              <p className="text-sm font-semibold text-amber-700 mb-4 flex items-center gap-1">
                <Infinity className="w-4 h-4" />
                Eenmalige betaling, voor altijd toegang
              </p>
            )}

            <ul className="space-y-3 mb-8">
              {selectedGoldPlan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {selectedGoldPlan.supportsDirectDebit && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Repeat className="w-4 h-4" />
                <span>Automatische incasso mogelijk</span>
              </div>
            )}

            <button
              onClick={() => handleSelectPlan(selectedGoldPlan)}
              disabled={currentPlan?.startsWith('GOLD')}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                currentPlan?.startsWith('GOLD')
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {currentPlan?.startsWith('GOLD') ? 'Huidig plan' : 'Kies Gold'}
              {!currentPlan?.startsWith('GOLD') && <ArrowRight className="w-5 h-5" />}
            </button>
          </motion.div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-12">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Vergelijk alle features</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center p-4 font-semibold text-gray-600">Gratis</th>
                  <th className="text-center p-4 font-semibold text-rose-600">Premium</th>
                  <th className="text-center p-4 font-semibold text-amber-600">Gold</th>
                </tr>
              </thead>
              <tbody>
                <FeatureRow icon={MessageCircle} name="Berichten per dag" free="3" premium="Onbeperkt" gold="Onbeperkt" />
                <FeatureRow icon={Eye} name="Profielen bekijken per dag" free="10" premium="Onbeperkt" gold="Onbeperkt" />
                <FeatureRow icon={Eye} name="Zie wie jou leuk vindt" free={false} premium={true} gold={true} />
                <FeatureRow icon={Bot} name="AI DatingAssistent" free={false} premium={true} gold={true} />
                <FeatureRow icon={Bot} name="Geavanceerde AI Coaching" free={false} premium={false} gold={true} />
                <FeatureRow icon={Shield} name="AI Romance Scam Detectie" free={false} premium={false} gold={true} />
                <FeatureRow icon={Shield} name="Veiligheidsscore Dashboard" free={false} premium={false} gold={true} />
                <FeatureRow icon={Volume2} name="Audio berichten" free={false} premium={false} gold={true} />
                <FeatureRow icon={Undo2} name="Onbeperkt terugdraaien" free={false} premium={false} gold={true} />
                <FeatureRow icon={Star} name="Super Likes per week" free="0" premium="0" gold="5" />
                <FeatureRow icon={Crown} name="Gold badge" free={false} premium={false} gold={true} />
                <FeatureRow icon={Headphones} name="Prioriteit support (24u)" free={false} premium={false} gold={true} />
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 py-8 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>100% veilig betalen</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            <span>Opzeggen wanneer je wilt</span>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-green-500" />
            <span>Automatische incasso</span>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      {checkoutData && (
        <CheckoutModal
          isOpen={!!checkoutData}
          onClose={() => setCheckoutData(null)}
          type={checkoutData.type}
          planId={checkoutData.planId}
          planName={checkoutData.planName}
          planPrice={checkoutData.planPrice}
          planPeriod={checkoutData.planPeriod}
          supportsDirectDebit={checkoutData.supportsDirectDebit}
        />
      )}
    </div>
  )
}

// Feature row component
function FeatureRow({
  icon: Icon,
  name,
  free,
  premium,
  gold,
}: {
  icon: typeof Check
  name: string
  free: boolean | string
  premium: boolean | string
  gold: boolean | string
}) {
  const renderValue = (value: boolean | string, color: string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-5 h-5 ${color}`} />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      )
    }
    return <span className={`font-semibold ${color}`}>{value}</span>
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{name}</span>
        </div>
      </td>
      <td className="p-4 text-center">{renderValue(free, 'text-gray-600')}</td>
      <td className="p-4 text-center">{renderValue(premium, 'text-rose-600')}</td>
      <td className="p-4 text-center">{renderValue(gold, 'text-amber-600')}</td>
    </tr>
  )
}
