/**
 * Prijzen Page - Minimalistisch & Professioneel Design
 *
 * Clean pricing met alleen logo kleur #C34C60
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart,
  Check,
  Sparkles,
  Crown,
  ArrowRight,
} from 'lucide-react'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/pricing'
import CheckoutModal from '@/components/checkout/CheckoutModal'

interface CheckoutData {
  type: 'subscription' | 'credits'
  planId?: string
  planName?: string
  planPrice?: number
  planPeriod?: string
  credits?: number
}

export default function PrijzenPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  // Fetch current subscription on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user) {
        setIsLoadingSubscription(false)
        return
      }

      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setCurrentPlan(data.plan)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscription()
  }, [session])

  const handleSubscriptionSelect = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) return

    // Prevent selecting current plan
    if (planId === currentPlan) {
      return
    }

    // Redirect to login if not authenticated
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
    })
  }

  // Minimalist plan configuration
  const planConfigs = {
    FREE: {
      icon: Heart,
      recommended: false,
    },
    PLUS: {
      icon: Sparkles,
      recommended: true,
    },
    COMPLETE: {
      icon: Crown,
      recommended: false,
    },
  }

  // Feature lists
  const planFeatures = {
    FREE: [
      'Profiel aanmaken',
      '10 likes per dag',
      '1 chat per dag starten',
    ],
    PLUS: [
      'Onbeperkt likes',
      'Onbeperkt chatten',
      'Zie wie jou leuk vindt',
      'Audioberichten',
      'Leesbevestigingen',
      'Geen advertenties',
    ],
    COMPLETE: [
      'Alles van Liefde Plus',
      '3 Superberichten per maand',
      'Profiel boost (1x/maand)',
      'Prioriteit in zoeken',
      'Geavanceerde filters',
      'Passport (swipe overal)',
      'Incognito modus',
    ],
  }

  return (
    <div className="min-h-screen bg-white lg:ml-64 lg:pt-6">
      {/* Header - Hidden on desktop */}
      <header className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-xl font-semibold text-gray-900">Liefde Voor Iedereen</span>
            </Link>
            {session ? (
              <Link
                href="/discover"
                className="text-primary font-medium hover:underline"
              >
                Terug naar app
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
              >
                Inloggen
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Kies het plan dat bij jou past
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upgrade voor meer features, betere matches en onbeperkte mogelijkheden
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const config = planConfigs[plan.id as keyof typeof planConfigs]
            const features = planFeatures[plan.id as keyof typeof planFeatures]
            const isCurrentPlan = plan.id === currentPlan
            const Icon = config.icon

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative ${config.recommended ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {/* Recommended Badge */}
                {config.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Aanbevolen
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gray-900 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Huidig plan
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`h-full bg-white rounded-2xl border-2 ${
                    config.recommended
                      ? 'border-primary shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-all p-8`}
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${
                      config.recommended ? 'bg-primary' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${config.recommended ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                  </div>

                  {/* Plan Name */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">/{plan.periodLabel}</span>
                      )}
                    </div>
                    {plan.id === 'FREE' && (
                      <p className="text-sm text-gray-500 mt-1">Altijd gratis</p>
                    )}
                    {plan.id === 'COMPLETE' && (
                      <p className="text-sm text-green-600 mt-1 font-medium">
                        Je bespaart bijna 5 euro
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscriptionSelect(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : config.recommended
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isCurrentPlan ? 'Huidig plan' : plan.id === 'FREE' ? 'Gratis beginnen' : 'Kies dit plan'}
                    {!isCurrentPlan && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 py-8 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span>10.000+ actieve gebruikers</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            <span>100% veilig betalen</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Opzeggen wanneer je wilt</span>
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
          credits={checkoutData.credits}
        />
      )}
    </div>
  )
}
