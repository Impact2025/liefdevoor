/**
 * Subscription Management Page - Minimalistisch Design
 *
 * Clean en professioneel met alleen logo kleur #C34C60
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Heart,
  Check,
  ChevronRight
} from 'lucide-react'
import { BillingHistory } from '@/components/subscription'
import type { SubscriptionInfo } from '@/lib/subscription'

export default function SubscriptionManagePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchSubscription()
    }
  }, [status, router])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      if (res.ok) {
        alert('Je abonnement is opgezegd. Je hebt nog toegang tot de premium features tot het einde van je betaalperiode.')
        router.push('/subscription/cancel')
      } else {
        const data = await res.json()
        alert(data.error || 'Kon abonnement niet opzeggen')
      }
    } catch (error) {
      alert('Er ging iets mis. Probeer het later opnieuw.')
    } finally {
      setIsCancelling(false)
      setShowCancelConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Laden...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Geen abonnement</h2>
          <p className="text-gray-600 mb-8">Je hebt momenteel geen actief abonnement.</p>
          <button
            onClick={() => router.push('/prijzen')}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
          >
            Bekijk Abonnementen
          </button>
        </div>
      </div>
    )
  }

  const planConfig = {
    FREE: {
      name: 'Basis',
      icon: Heart,
      features: ['Profiel aanmaken', '10 likes per dag', '1 chat per dag'],
    },
    PLUS: {
      name: 'Liefde Plus',
      icon: Sparkles,
      features: ['Onbeperkt likes', 'Onbeperkt chatten', 'Zien wie jou leuk vindt'],
    },
    COMPLETE: {
      name: 'Liefde Compleet',
      icon: Crown,
      features: ['Alles van Plus', '3 Superberichten/maand', 'Profiel boost'],
    },
  }

  const config = planConfig[subscription.plan]
  const Icon = config.icon
  const isActive = subscription.status === 'active'
  const isPremium = subscription.plan !== 'FREE'

  return (
    <div className="min-h-screen bg-white pb-24 lg:ml-64 lg:pt-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.push('/settings')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mijn Abonnement</h1>
            <p className="text-sm text-gray-600">Beheer je lidmaatschap</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-8"
        >
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                isPremium ? 'bg-primary' : 'bg-gray-100'
              }`}>
                <Icon className={`w-7 h-7 ${isPremium ? 'text-white' : 'text-gray-600'}`} />
              </div>

              {/* Plan Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{config.name}</h2>
                <p className="text-gray-600 text-sm">
                  {subscription.plan === 'FREE' ? 'Gratis lidmaatschap' : 'Premium lidmaatschap'}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              isActive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isActive ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-semibold">
                {isActive ? 'Actief' : 'Inactief'}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8 space-y-3">
            {config.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Info Grid */}
          {subscription.plan !== 'FREE' && subscription.expiresAt && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Verloopt op</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {new Date(subscription.expiresAt).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Betaalmethode</span>
                </div>
                <p className="text-lg font-bold text-gray-900">iDEAL</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {subscription.plan !== 'COMPLETE' && (
              <button
                onClick={() => router.push('/prijzen')}
                className="flex-1 py-4 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                {subscription.plan === 'FREE' ? 'Upgrade naar Premium' : 'Upgrade naar Compleet'}
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {subscription.plan !== 'FREE' && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                Opzeggen
              </button>
            )}
          </div>
        </motion.div>

        {/* Billing History */}
        {subscription.plan !== 'FREE' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Factuurgeschiedenis</h3>
            <BillingHistory />
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Abonnement opzeggen?
              </h3>
              <p className="text-gray-600">
                Je hebt nog toegang tot je premium features tot het einde van je betaalperiode.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Bezig...' : 'Ja, opzeggen'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
