/**
 * Boost Button Component
 *
 * Shows boost status and allows activating a profile boost
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Crown, Clock, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BoostStatus {
  isActive: boolean
  expiresAt: string | null
  remainingMinutes: number
  boostsRemaining: number
  boostsPerMonth: number
  canBoost: boolean
}

export function BoostButton() {
  const router = useRouter()
  const [boostStatus, setBoostStatus] = useState<BoostStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    fetchBoostStatus()
  }, [])

  // Countdown timer for active boost
  useEffect(() => {
    if (!boostStatus?.isActive || boostStatus.remainingMinutes <= 0) return

    setCountdown(boostStatus.remainingMinutes * 60) // Convert to seconds

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchBoostStatus()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [boostStatus?.isActive, boostStatus?.remainingMinutes])

  const fetchBoostStatus = async () => {
    try {
      const res = await fetch('/api/boost')
      const data = await res.json()
      if (res.ok) {
        setBoostStatus(data)
      }
    } catch (err) {
      console.error('Error fetching boost status:', err)
    }
  }

  const activateBoost = async () => {
    if (isLoading || !boostStatus?.canBoost) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/boost', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        fetchBoostStatus()
        setShowModal(false)
      } else if (res.status === 403) {
        // Show upgrade prompt
        router.push('/prijzen')
      }
    } catch (err) {
      console.error('Error activating boost:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!boostStatus) return null

  // If boost is active, show countdown
  if (boostStatus.isActive && countdown > 0) {
    return (
      <motion.button
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <Zap size={16} fill="white" />
        </motion.div>
        <span>{formatCountdown(countdown)}</span>
      </motion.button>
    )
  }

  // If can't boost (not premium), show upgrade button
  if (!boostStatus.canBoost) {
    return (
      <button
        onClick={() => router.push('/prijzen')}
        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
        title="Upgrade voor Boost"
      >
        <Crown size={16} />
        <span className="hidden sm:inline">Boost</span>
      </button>
    )
  }

  // Can boost - show button
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        disabled={boostStatus.boostsRemaining <= 0}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          boostStatus.boostsRemaining > 0
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        <Zap size={16} />
        <span className="hidden sm:inline">
          {boostStatus.boostsRemaining > 0 ? 'Boost' : 'Op'}
        </span>
        {boostStatus.boostsRemaining > 0 && (
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
            {boostStatus.boostsRemaining}
          </span>
        )}
      </motion.button>

      {/* Boost Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Zap size={40} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Boost je profiel
                </h3>

                <p className="text-gray-600 mb-6">
                  Krijg 30 minuten lang meer zichtbaarheid! Je profiel wordt
                  bovenaan getoond bij andere gebruikers.
                </p>

                <div className="bg-purple-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <Sparkles size={18} />
                    <span className="font-semibold">Boost voordelen:</span>
                  </div>
                  <ul className="space-y-1 text-sm text-purple-600">
                    <li>• Tot 10x meer profielweergaven</li>
                    <li>• Prioriteit in ontdek feed</li>
                    <li>• Meer kans op matches</li>
                  </ul>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                  <Clock size={16} />
                  <span>
                    {boostStatus.boostsRemaining} van {boostStatus.boostsPerMonth}{' '}
                    boosts over deze maand
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={activateBoost}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Activeren...' : 'Activeer Boost'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default BoostButton
