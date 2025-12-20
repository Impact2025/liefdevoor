'use client'

/**
 * CouponInput Component - Wereldklasse Checkout Experience
 *
 * Features:
 * - Real-time validation
 * - Success/error animations
 * - Discount preview
 * - Auto-formatting
 * - Loading states
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Check, X, Loader2, Tag, TrendingDown, AlertCircle } from 'lucide-react'

interface CouponInputProps {
  orderType: 'subscription' | 'credits'
  amount: number
  onCouponApplied: (discount: DiscountInfo) => void
  onCouponRemoved: () => void
  className?: string
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

export default function CouponInput({
  orderType,
  amount,
  onCouponApplied,
  onCouponRemoved,
  className = ''
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountInfo | null>(null)
  const [showInput, setShowInput] = useState(false)

  // Auto-format coupon code (uppercase, no spaces)
  const handleCodeChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/\s/g, '')
    setCode(formatted)
    setError(null)
  }

  // Validate coupon
  const validateCoupon = async () => {
    if (!code || code.length < 3) {
      setError('Voer een geldige couponcode in')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          orderType,
          amount,
        }),
      })

      const data = await res.json()

      if (res.ok && data.valid) {
        const discountInfo: DiscountInfo = {
          couponId: data.coupon.id,
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
          ...data.discount,
        }

        setAppliedCoupon(discountInfo)
        onCouponApplied(discountInfo)
        setShowInput(false)
      } else {
        setError(data.error || 'Ongeldige couponcode')
      }
    } catch (error) {
      console.error('Failed to validate coupon:', error)
      setError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setIsValidating(false)
    }
  }

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCode('')
    setError(null)
    setShowInput(false)
    onCouponRemoved()
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCoupon()
    }
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          // Applied Coupon Display
          <motion.div
            key="applied"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-success-50 to-emerald-50 border-2 border-success-500 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Success Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-success-700" />
                      <span className="font-mono font-bold text-success-900">
                        {appliedCoupon.code}
                      </span>
                    </div>

                    <p className="text-sm text-success-700 font-medium">
                      Korting toegepast!
                    </p>

                    {/* Discount Breakdown */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-success-700">Oorspronkelijk:</span>
                        <span className="font-medium text-success-900">
                          €{appliedCoupon.originalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-success-700 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Korting ({appliedCoupon.discountPercentage}%):
                        </span>
                        <span className="font-bold text-success-700">
                          -€{appliedCoupon.discountAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-px bg-success-200 my-1" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-success-900">Totaal:</span>
                        <span className="text-xl font-bold text-success-900">
                          €{appliedCoupon.finalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={removeCoupon}
                  className="p-2 hover:bg-success-100 rounded-lg transition-colors"
                  title="Verwijder coupon"
                >
                  <X className="w-4 h-4 text-success-700" />
                </button>
              </div>
            </div>

            {/* Savings Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2"
            >
              <div className="bg-success-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                🎉 Je bespaart €{appliedCoupon.discountAmount.toFixed(2)}!
              </div>
            </motion.div>
          </motion.div>
        ) : showInput ? (
          // Coupon Input Form
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-2 border-slate-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-slate-900">Couponcode</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="NIEUW2024"
                  disabled={isValidating}
                  className={`w-full px-4 py-3 border-2 rounded-lg font-mono font-bold text-lg uppercase focus:outline-none transition-colors ${
                    error
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-slate-300 focus:border-primary-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  autoFocus
                />
              </div>

              <button
                onClick={validateCoupon}
                disabled={isValidating || !code || code.length < 3}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checken...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Toepassen
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cancel Button */}
            <button
              onClick={() => {
                setShowInput(false)
                setCode('')
                setError(null)
              }}
              className="mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Annuleren
            </button>
          </motion.div>
        ) : (
          // Show Coupon Button
          <motion.button
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInput(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 hover:border-primary-400 hover:bg-primary-50 rounded-xl transition-all group"
          >
            <Ticket className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
            <span className="font-medium text-slate-600 group-hover:text-primary-700 transition-colors">
              Heb je een kortingscode?
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
