'use client'

/**
 * CheckoutModal - Wereldklasse Checkout Experience
 *
 * Features:
 * - Coupon integration
 * - Real-time price updates
 * - Payment method selection (iDEAL, Credit Card, Bancontact, SEPA Direct Debit)
 * - Automatische incasso (SEPA Direct Debit) support
 * - Loading states & animations
 * - Success/error handling
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, CreditCard, Building2, Smartphone, Check,
  Lock, ArrowRight, Loader2, Sparkles, Repeat, Info
} from 'lucide-react'
import CouponInput from './CouponInput'

type PaymentMethod = 'ideal' | 'creditcard' | 'bancontact' | 'directdebit'

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

export default function CheckoutModal({
  isOpen,
  onClose,
  type,
  planId,
  planName,
  planPrice = 0,
  planPeriod,
  credits,
  supportsDirectDebit = false
}: CheckoutModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('ideal')
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showDirectDebitInfo, setShowDirectDebitInfo] = useState(false)

  const originalAmount = planPrice
  const finalAmount = appliedDiscount ? appliedDiscount.finalAmount : originalAmount
  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0

  const handleCheckout = async () => {
    setIsProcessing(true)

    try {
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
        const errorData = await res.json()
        console.error('Checkout error:', errorData)
        const errorMessage = errorData.details || errorData.error || 'Er ging iets mis. Probeer het opnieuw.'
        alert(errorMessage)
        throw new Error(errorData.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      if (error instanceof Error && !error.message.includes('Payment failed')) {
        alert('Er ging iets mis. Probeer het opnieuw.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  // Payment methods configuration
  const paymentMethods: { id: PaymentMethod; name: string; icon: typeof CreditCard; description?: string }[] = [
    { id: 'ideal', name: 'iDEAL', icon: Building2 },
    { id: 'creditcard', name: 'Kaart', icon: CreditCard },
    { id: 'bancontact', name: 'Bancontact', icon: Smartphone },
  ]

  // Add direct debit if supported
  if (supportsDirectDebit && type === 'subscription') {
    paymentMethods.push({
      id: 'directdebit',
      name: 'Incasso',
      icon: Repeat,
      description: 'Automatisch'
    })
  }

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
            <div className="bg-gradient-to-br from-rose-50 to-rose-50 rounded-xl p-6">
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
                  <span className="text-2xl font-bold text-rose-600">
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
              <div className={`grid gap-3 ${paymentMethods.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedPaymentMethod === method.id

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        isSelected
                          ? method.id === 'directdebit'
                            ? 'border-green-500 bg-green-50'
                            : 'border-rose-500 bg-stone-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-7 h-7 mx-auto mb-2 ${
                        isSelected
                          ? method.id === 'directdebit'
                            ? 'text-green-600'
                            : 'text-rose-600'
                          : 'text-slate-400'
                      }`} />
                      <p className="text-sm font-medium text-slate-900">{method.name}</p>
                      {method.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{method.description}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Direct Debit Info */}
            {selectedPaymentMethod === 'directdebit' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Repeat className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">
                      Automatische incasso (SEPA)
                    </p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Betaal automatisch, geen gedoe met facturen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Wordt {planPeriod?.toLowerCase()} afgeschreven</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Altijd opzegbaar, 8 weken terugboekrecht</span>
                      </li>
                    </ul>

                    <button
                      onClick={() => setShowDirectDebitInfo(!showDirectDebitInfo)}
                      className="mt-3 text-sm text-green-700 hover:text-green-900 flex items-center gap-1"
                    >
                      <Info className="w-4 h-4" />
                      {showDirectDebitInfo ? 'Verberg details' : 'Meer informatie'}
                    </button>

                    {showDirectDebitInfo && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-xs text-green-700 bg-green-100 rounded-lg p-3"
                      >
                        <p className="mb-2">
                          <strong>Hoe werkt automatische incasso?</strong>
                        </p>
                        <p className="mb-2">
                          Na je goedkeuring schrijven we {planPeriod?.toLowerCase()} €{finalAmount.toFixed(2)} af van je rekening.
                          Je ontvangt altijd vooraf een e-mail herinnering.
                        </p>
                        <p>
                          Je kunt de machtiging op elk moment intrekken via je profielinstellingen.
                          Na intrekking loopt je huidige periode gewoon af.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Veilig betalen
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {selectedPaymentMethod === 'directdebit'
                    ? 'Je SEPA machtiging wordt veilig verwerkt. Je hebt 8 weken terugboekrecht bij je bank.'
                    : 'Je betaling wordt veilig verwerkt via SSL-encryptie. We slaan geen betalingsgegevens op.'
                  }
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className={`w-full py-4 font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                selectedPaymentMethod === 'directdebit'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verwerken...
                </>
              ) : (
                <>
                  {selectedPaymentMethod === 'directdebit' ? (
                    <>
                      <Repeat className="w-5 h-5" />
                      Machtiging geven voor €{finalAmount.toFixed(2)}{planPeriod ? ` ${planPeriod}` : ''}
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      {finalAmount === 0 ? 'Gratis activeren' : `Betaal €${finalAmount.toFixed(2)}`}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-slate-500">
              Door te {selectedPaymentMethod === 'directdebit' ? 'machtigen' : 'betalen'} ga je akkoord met onze{' '}
              <a href="/terms" className="text-rose-600 hover:underline">
                algemene voorwaarden
              </a>{' '}
              en{' '}
              <a href="/privacy" className="text-rose-600 hover:underline">
                privacybeleid
              </a>
              {selectedPaymentMethod === 'directdebit' && (
                <>
                  {' '}inclusief de{' '}
                  <a href="/terms#sepa" className="text-rose-600 hover:underline">
                    SEPA incasso voorwaarden
                  </a>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
