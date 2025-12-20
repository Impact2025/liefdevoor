'use client'

/**
 * CheckoutModal - Wereldklasse Checkout Experience
 *
 * Features:
 * - Coupon integration
 * - Real-time price updates
 * - Payment method selection
 * - Loading states & animations
 * - Success/error handling
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, CreditCard, Building2, Smartphone, Check,
  Lock, ArrowRight, Loader2, Sparkles
} from 'lucide-react'
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

export default function CheckoutModal({
  isOpen,
  onClose,
  type,
  planId,
  planName,
  planPrice = 0,
  planPeriod,
  credits
}: CheckoutModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'ideal' | 'creditcard' | 'bancontact'>('ideal')
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const originalAmount = planPrice
  const finalAmount = appliedDiscount ? appliedDiscount.finalAmount : originalAmount
  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0

  const handleCheckout = async () => {
    setIsProcessing(true)

    try {
      // Apply coupon if present
      if (appliedDiscount) {
        await fetch('/api/coupons/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: appliedDiscount.code,
            orderType: type,
            orderId: null, // Will be set after payment
            originalAmount: appliedDiscount.originalAmount,
            discountAmount: appliedDiscount.discountAmount,
            finalAmount: appliedDiscount.finalAmount,
          }),
        })
      }

      // Create subscription/credit purchase
      const endpoint = type === 'subscription' ? '/api/subscription/create' : '/api/credits/purchase'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          credits,
          amount: finalAmount,
          paymentMethod: selectedPaymentMethod,
          couponCode: appliedDiscount?.code,
        }),
      })

      if (res.ok) {
        const data = await res.json()

        if (data.paymentUrl) {
          // Redirect to payment page
          window.location.href = data.paymentUrl
        } else {
          // Free plan or already paid
          setIsSuccess(true)
          setTimeout(() => {
            window.location.href = type === 'subscription' ? '/subscription/success' : '/discover'
          }, 2000)
        }
      } else {
        throw new Error('Payment failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {type === 'subscription' ? 'Abonnement afsluiten' : 'Credits kopen'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Success State */}
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
                      className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Gelukt!
                    </h3>
                    <p className="text-slate-600">
                      Je wordt doorgestuurd...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-primary-50 to-rose-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                {type === 'subscription' ? 'Abonnement' : 'Credits'}
              </h3>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {planName || `${credits} Superberichten`}
                    </p>
                    {planPeriod && (
                      <p className="text-sm text-slate-600">{planPeriod}</p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    €{originalAmount.toFixed(2)}
                  </p>
                </div>

                {discountAmount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-success-700">
                      <span className="font-medium">Korting</span>
                      <span className="font-bold">-€{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                  </>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-semibold text-slate-900">Totaal</span>
                  <span className="text-2xl font-bold text-primary-600">
                    €{finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon Input */}
            <CouponInput
              orderType={type}
              amount={originalAmount}
              onCouponApplied={setAppliedDiscount}
              onCouponRemoved={() => setAppliedDiscount(null)}
            />

            {/* Payment Methods */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Betaalmethode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* iDEAL */}
                <button
                  onClick={() => setSelectedPaymentMethod('ideal')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    selectedPaymentMethod === 'ideal'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                    selectedPaymentMethod === 'ideal' ? 'text-primary-600' : 'text-slate-400'
                  }`} />
                  <p className="text-sm font-medium text-slate-900">iDEAL</p>
                </button>

                {/* Credit Card */}
                <button
                  onClick={() => setSelectedPaymentMethod('creditcard')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    selectedPaymentMethod === 'creditcard'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                    selectedPaymentMethod === 'creditcard' ? 'text-primary-600' : 'text-slate-400'
                  }`} />
                  <p className="text-sm font-medium text-slate-900">Kaart</p>
                </button>

                {/* Bancontact */}
                <button
                  onClick={() => setSelectedPaymentMethod('bancontact')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    selectedPaymentMethod === 'bancontact'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className={`w-8 h-8 mx-auto mb-2 ${
                    selectedPaymentMethod === 'bancontact' ? 'text-primary-600' : 'text-slate-400'
                  }`} />
                  <p className="text-sm font-medium text-slate-900">Bancontact</p>
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Veilig betalen
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Je betaling wordt veilig verwerkt via SSL-encryptie. We slaan geen betalingsgegevens op.
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing || finalAmount === 0}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verwerken...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  {finalAmount === 0 ? 'Gratis activeren' : `Betaal €${finalAmount.toFixed(2)}`}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-slate-500">
              Door te betalen ga je akkoord met onze{' '}
              <a href="/terms" className="text-primary-600 hover:underline">
                algemene voorwaarden
              </a>{' '}
              en{' '}
              <a href="/privacy" className="text-primary-600 hover:underline">
                privacybeleid
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
