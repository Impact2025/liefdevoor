'use client'

/**
 * Subscription Success Page - Wereldklasse Success Experience
 *
 * Features:
 * - Payment verification
 * - Confetti celebration
 * - Animated success message
 * - Next steps guidance
 * - Auto-redirect to discover
 */

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Check,
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { PageLoading } from '@/components/ui'

function SubscriptionSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [message, setMessage] = useState('Betaling wordt geverifieerd...')
  const [countdown, setCountdown] = useState(8)

  // Payment verification
  useEffect(() => {
    const orderId = searchParams.get('order_id')

    const verifyPayment = async () => {
      try {
        // If no order_id, try to find user's most recent subscription
        if (!orderId) {
          if (!session?.user?.id) {
            setStatus('error')
            setMessage('Geen order ID gevonden. Log in om je betaling te controleren.')
            return
          }

          // Check for recent active subscription
          const res = await fetch('/api/subscription')

          if (!res.ok) {
            setStatus('error')
            setMessage('Kon abonnementsstatus niet controleren. Log in en probeer opnieuw.')
            return
          }

          const data = await res.json()

          if (data.status === 'active' && (data.isPlus || data.isComplete)) {
            setStatus('success')
            setMessage('Je premium abonnement is geactiveerd!')
            return
          } else if (data.status === 'pending') {
            setStatus('checking')
            setMessage('Je betaling wordt nog verwerkt. Even geduld...')
            // Retry after 3 seconds
            setTimeout(verifyPayment, 3000)
            return
          } else {
            setStatus('error')
            setMessage('Geen actieve betaling gevonden. Probeer je abonnement opnieuw te activeren.')
            return
          }
        }

        // Verify with order_id
        const res = await fetch(`/api/subscription/verify?order_id=${orderId}`)
        const data = await res.json()

        if (data.success && data.subscription?.status === 'active') {
          setStatus('success')
          setMessage('Je premium abonnement is geactiveerd!')
        } else if (data.subscription?.status === 'pending') {
          setStatus('checking')
          setMessage('Je betaling wordt nog verwerkt. Even geduld...')
          // Retry after 3 seconds
          setTimeout(verifyPayment, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Betaling kon niet worden geverifieerd')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Er is een fout opgetreden bij het verifieren van je betaling')
      }
    }

    verifyPayment()
  }, [searchParams, router, session])

  // Confetti celebration effect (only on success)
  useEffect(() => {
    if (status !== 'success') return

    const duration = 3000
    const animationEnd = Date.now() + duration

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Left side
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#f43f5e', '#e11d48', '#fb7185', '#fda4af', '#0f766e']
      })

      // Right side
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#f43f5e', '#e11d48', '#fb7185', '#fda4af', '#0f766e']
      })
    }, 250)

    return () => clearInterval(interval)
  }, [status])

  // Countdown timer (only on success)
  useEffect(() => {
    if (status !== 'success') return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      router.push('/discover')
    }
  }, [countdown, status, router])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-50 to-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900">Betaling wordt geverifieerd...</p>
          <p className="text-sm text-slate-500 mt-2">Dit duurt maar een paar seconden</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-50 to-stone-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-trust-100 rounded-full blur-3xl opacity-30 -z-10" />

        {status === 'success' ? (
          <>
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-success-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Gefeliciteerd! 🎉
              </h1>
              <p className="text-xl text-slate-600">
                {message}
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-gradient-to-br from-rose-50 to-rose-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Onbeperkt likes
                </p>
                <p className="text-xs text-slate-600">
                  Like zoveel mensen als je wilt
                </p>
              </div>

              <div className="bg-gradient-to-br from-trust-50 to-teal-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-trust-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Premium functies
                </p>
                <p className="text-xs text-slate-600">
                  Alle premium features ontgrendeld
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Zien wie je leuk vindt
                </p>
                <p className="text-xs text-slate-600">
                  Ontdek wie jou een like gaf
                </p>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-blue-50 rounded-xl p-6 mb-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Wat nu?
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                  <span>Begin met liken en chatten zonder limieten</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                  <span>Bekijk wie jou al een like heeft gegeven</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                  <span>Stuur audioberichten naar je matches</span>
                </li>
              </ul>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-3"
            >
              <button
                onClick={() => router.push('/discover')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                Begin met daten
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-sm text-center text-slate-500">
                Je wordt automatisch doorgestuurd over {countdown} seconden...
              </p>
            </motion.div>

            {/* Support Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-slate-500">
                Heb je vragen?{' '}
                <a href="/support" className="text-rose-600 hover:underline font-medium">
                  Contacteer onze support
                </a>
              </p>
            </motion.div>
          </>
        ) : (
          <>
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-12 h-12 text-red-600" />
            </motion.div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Er ging iets mis
              </h1>
              <p className="text-lg text-slate-600">{message}</p>
            </div>

            {/* Error Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/subscription')}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-lg rounded-xl transition-colors"
              >
                Probeer opnieuw
              </button>
              <button
                onClick={() => router.push('/discover')}
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-lg rounded-xl transition-colors"
              >
                Terug naar app
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-900 text-center">
                Heb je hulp nodig?{' '}
                <a href="/support" className="text-rose-600 hover:underline font-medium">
                  Neem contact op met support
                </a>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<PageLoading message="Laden..." />}>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}
