/**
 * Subscription Management Page - Wereldklasse Design
 *
 * Minimalistisch, strak en professioneel
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Heart,
  Shield,
  ChevronRight,
  Check,
  X
} from 'lucide-react'
import { AppHeader } from '@/components/layout'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Laden...</p>
        </motion.div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Geen abonnement</h2>
          <p className="text-slate-600 mb-8">Je hebt momenteel geen actief abonnement.</p>
          <button
            onClick={() => router.push('/prijzen')}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
          >
            Bekijk Abonnementen
          </button>
        </motion.div>
      </div>
    )
  }

  const planConfig = {
    FREE: {
      name: 'Basis',
      icon: Heart,
      accent: 'slate',
      features: ['Profiel aanmaken', '10 likes per dag', '1 chat per dag'],
    },
    PLUS: {
      name: 'Liefde Plus',
      icon: Sparkles,
      accent: 'rose',
      features: ['Onbeperkt likes', 'Onbeperkt chatten', 'Zien wie jou leuk vindt'],
    },
    COMPLETE: {
      name: 'Liefde Compleet',
      icon: Crown,
      accent: 'purple',
      features: ['Alles van Plus', '3 Superberichten/maand', 'Profiel boost'],
    },
  }

  const config = planConfig[subscription.plan]
  const Icon = config.icon
  const isActive = subscription.status === 'active'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24 lg:ml-64 lg:pt-16">
      {/* Minimalistisch Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/settings')}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Abonnement</h1>
              <p className="text-sm text-slate-600">Beheer je lidmaatschap</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Strak Plan Card met Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${
            config.accent === 'purple'
              ? 'from-purple-500/10 via-pink-500/10 to-transparent'
              : config.accent === 'rose'
              ? 'from-rose-500/10 via-pink-500/10 to-transparent'
              : 'from-slate-500/10 to-transparent'
          }`} />

          {/* Content */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-xl p-8">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  config.accent === 'purple'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : config.accent === 'rose'
                    ? 'bg-gradient-to-br from-rose-500 to-pink-500'
                    : 'bg-slate-900'
                }`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Plan Info */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{config.name}</h2>
                  <p className="text-slate-600 text-sm">
                    {subscription.plan === 'FREE' ? 'Gratis lidmaatschap' : 'Premium lidmaatschap'}
                  </p>
                </div>
              </div>

              {/* Status Badge - Minimalistisch */}
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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

            {/* Features - Clean List */}
            <div className="mb-8 space-y-3">
              {config.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Info Grid - Minimalistisch */}
            {subscription.plan !== 'FREE' && subscription.expiresAt && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Verloopt op</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(subscription.expiresAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Betaalmethode</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">iDEAL</p>
                </div>
              </div>
            )}

            {/* Actions - Strak en Pro */}
            <div className="flex flex-col sm:flex-row gap-3">
              {subscription.plan !== 'COMPLETE' && (
                <button
                  onClick={() => router.push('/prijzen')}
                  className="flex-1 group relative overflow-hidden py-4 rounded-2xl font-semibold transition-all"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    subscription.plan === 'FREE'
                      ? 'from-rose-500 to-pink-500'
                      : 'from-purple-500 to-purple-600'
                  } group-hover:scale-105 transition-transform`} />
                  <div className="relative flex items-center justify-center gap-2 text-white">
                    <Crown className="w-5 h-5" />
                    {subscription.plan === 'FREE' ? 'Upgrade naar Premium' : 'Upgrade naar Compleet'}
                  </div>
                </button>
              )}

              {subscription.plan !== 'FREE' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50/50 transition-all"
                >
                  Opzeggen
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Cancel Modal - Wereldklasse Design */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCancelConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">
                  Abonnement opzeggen?
                </h3>
                <p className="text-slate-600 text-center mb-8">
                  Je houdt toegang tot je premium features tot het einde van je betaalperiode.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? 'Bezig...' : 'Opzeggen'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Billing History */}
        <BillingHistory className="mb-6" />

        {/* Support Section - Minimalistisch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Hulp nodig?
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Ons support team staat voor je klaar met vragen over je abonnement.
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
              >
                Contact opnemen
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
