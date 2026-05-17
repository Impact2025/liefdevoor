'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Check, Lock, ArrowRight, Loader2, ChevronLeft,
} from 'lucide-react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { getStripePromise } from '@/lib/stripe-client'
import CouponInput from './CouponInput'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'subscription' | 'credits'
  planId?: string
  planName?: string
  planPrice?: number
  planPeriod?: string
  credits?: number
  supportsDirectDebit?: boolean
}

interface DiscountInfo {
  couponId: string
  code: string
  type: string
  value: number
  originalAmount: number
  discountAmount: number
  finalAmount: number
  discountPercentage: number
}

// ============================================
// Inner form — moet binnen <Elements> renderen
// ============================================

interface StripePaymentFormProps {
  type: 'subscription' | 'credits'
  finalAmount: number
  onSuccess: () => void
  subscriptionDbId?: string | null
  isSetupFlow?: boolean
}

function StripePaymentForm({ type, finalAmount, onSuccess, subscriptionDbId, isSetupFlow }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setError(null)

    // SetupIntent flow: recurring subscriptions (iDEAL → SEPA mandate, of kaart/SEPA direct)
    if (isSetupFlow && subscriptionDbId) {
      const returnUrl = `${window.location.origin}/subscription/success?order_id=${subscriptionDbId}`

      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required', // iDEAL redirect, kaart/SEPA inline
      })

      if (stripeError) {
        setError(stripeError.message ?? 'Betaling mislukt. Probeer het opnieuw.')
        setIsSubmitting(false)
        return
      }

      // Inline voltooiing (kaart/SEPA) — activeer abonnement direct
      if (setupIntent?.status === 'succeeded') {
        const res = await fetch('/api/subscription/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setupIntentId: setupIntent.id, subscriptionDbId }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? 'Activatie mislukt. Neem contact op met support.')
          setIsSubmitting(false)
          return
        }
        onSuccess()
      }
      return
    }

    // PaymentIntent flow: lifetime abonnement of credits
    // Voeg order_id toe aan return URL zodat success page het abonnement kan verifieren
    const returnUrl = type === 'subscription' && subscriptionDbId
      ? `${window.location.origin}/subscription/success?order_id=${subscriptionDbId}`
      : type === 'subscription'
      ? `${window.location.origin}/subscription/success`
      : `${window.location.origin}/discover?payment=success`

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Betaling mislukt. Probeer het opnieuw.')
      setIsSubmitting(false)
    }
    // Bij succes redirectt Stripe automatisch naar return_url
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'accordion',
          defaultValues: { billingDetails: { address: { country: 'NL' } } },
        }}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="w-full py-4 font-bold text-lg rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verwerken...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Betaal €{finalAmount.toFixed(2).replace('.', ',')}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-xs text-center text-slate-500">
        Beveiligd door{' '}
        <span className="font-semibold text-slate-700">Stripe</span>
        {' '}· SSL-versleuteld ·{' '}
        <a href="/terms" className="text-rose-600 hover:underline">Voorwaarden</a>
        {' '}·{' '}
        <a href="/privacy" className="text-rose-600 hover:underline">Privacy</a>
      </p>
    </form>
  )
}

// ============================================
// Hoofdcomponent
// ============================================

export default function CheckoutModal({
  isOpen,
  onClose,
  type,
  planId,
  planName,
  planPrice = 0,
  planPeriod,
  credits,
  supportsDirectDebit: _supportsDirectDebit,
}: CheckoutModalProps) {
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [subscriptionDbId, setSubscriptionDbId] = useState<string | null>(null)
  const [isSetupFlow, setIsSetupFlow] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const originalAmount = planPrice
  const finalAmount = appliedDiscount ? appliedDiscount.finalAmount : originalAmount
  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0

  // Reset bij sluiten
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null)
      setSubscriptionDbId(null)
      setIsSetupFlow(false)
      setError(null)
      setAppliedDiscount(null)
      setIsSuccess(false)
    }
  }, [isOpen])

  const handleInitiatePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const endpoint = type === 'subscription' ? '/api/subscription/create' : '/api/credits/purchase'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          packId: planId, // credits route gebruikt packId
          amount: finalAmount,
          couponCode: appliedDiscount?.code,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.details ?? data.error ?? 'Er ging iets mis. Probeer het opnieuw.')
        return
      }

      if (data.success && !data.requiresPayment) {
        // Gratis plan of 100% korting — direct activeren
        setIsSuccess(true)
        setTimeout(() => {
          window.location.href = type === 'subscription' ? '/subscription/success' : '/discover'
        }, 1800)
        return
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        // seti_ = SetupIntent (recurring subscription met iDEAL/SEPA)
        // pi_   = PaymentIntent (lifetime / credits)
        setIsSetupFlow(data.clientSecret.startsWith('seti_'))
        if (data.subscriptionId) setSubscriptionDbId(data.subscriptionId)
      } else {
        setError('Geen betaalgegevens ontvangen. Probeer het opnieuw.')
      }
    } catch {
      setError('Verbindingsfout. Controleer je internet en probeer opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const stripeOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe' as const,
          variables: { colorPrimary: '#e11d48', borderRadius: '12px' },
        },
      }
    : undefined

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              {clientSecret && (
                <button
                  onClick={() => setClientSecret(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <h2 className="text-xl font-bold text-slate-900">
                {clientSecret
                  ? 'Betaalgegevens invoeren'
                  : type === 'subscription'
                  ? 'Abonnement afsluiten'
                  : 'Credits kopen'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Succes overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center z-20"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Gelukt!</h3>
                    <p className="text-slate-600">Je wordt doorgestuurd...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fase 1 — Orderoverzicht */}
            {!clientSecret && (
              <div className="space-y-6">
                {/* Orderoverzicht */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-rose-700 uppercase tracking-wide mb-3">
                    Overzicht
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {planName ?? `${credits} Superberichten`}
                        </p>
                        {planPeriod && (
                          <p className="text-sm text-slate-500">{planPeriod}</p>
                        )}
                      </div>
                      <p className="font-bold text-slate-900">
                        €{originalAmount.toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    {discountAmount > 0 && (
                      <>
                        <div className="flex items-center justify-between text-green-700 text-sm">
                          <span className="font-medium">
                            Kortingscode ({appliedDiscount?.code})
                          </span>
                          <span className="font-bold">
                            -€{discountAmount.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="h-px bg-rose-200" />
                      </>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-900">Totaal</span>
                      <span className="text-2xl font-bold text-rose-600">
                        €{finalAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coupon */}
                <CouponInput
                  orderType={type}
                  amount={originalAmount}
                  onCouponApplied={setAppliedDiscount}
                  onCouponRemoved={() => setAppliedDiscount(null)}
                />

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Doorgaan knop */}
                <button
                  onClick={handleInitiatePayment}
                  disabled={isLoading}
                  className="w-full py-4 font-bold text-lg rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Laden...
                    </>
                  ) : finalAmount === 0 ? (
                    <>
                      <Check className="w-5 h-5" />
                      Gratis activeren
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Doorgaan naar betalen
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-400">
                  Betaling verloopt veilig via Stripe · iDEAL · Creditcard · SEPA Incasso · Apple/Google Pay
                </p>
              </div>
            )}

            {/* Fase 2 — Stripe Payment Element */}
            {clientSecret && stripeOptions && (
              <Elements stripe={getStripePromise()} options={stripeOptions}>
                <div className="space-y-4">
                  {/* Mini orderoverzicht */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 text-sm">
                    <span className="text-slate-600">
                      {planName ?? `${credits} Superberichten`}
                    </span>
                    <span className="font-bold text-slate-900">
                      €{finalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <StripePaymentForm
                    type={type}
                    finalAmount={finalAmount}
                    onSuccess={() => setIsSuccess(true)}
                    subscriptionDbId={subscriptionDbId}
                    isSetupFlow={isSetupFlow}
                  />
                </div>
              </Elements>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
