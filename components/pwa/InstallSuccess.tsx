/**
 * PWA Install Success Celebration
 * Shows confetti and success message after app installation
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Check, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

export function InstallSuccess() {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Check if user just installed the app
    const justInstalled = localStorage.getItem('pwa-install-success')

    if (justInstalled) {
      setShowSuccess(true)
      localStorage.removeItem('pwa-install-success')

      // Fire confetti
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 99999,
        colors: ['#C34C60', '#ed7693', '#FCA5A5', '#0f766e', '#5eead4']
      }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Fire from two sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [])

  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSuccess(false)}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center"
            >
              <Check size={40} className="text-white" strokeWidth={3} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              App Geïnstalleerd! 🎉
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 mb-6"
            >
              Welkom bij Liefde Voor Iedereen! Je kunt de app nu vinden op je beginscherm.
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-6"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-primary-600" />
                </div>
                <span className="text-sm text-gray-700">Snellere toegang tot je matches</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-primary-600" />
                </div>
                <span className="text-sm text-gray-700">Push notificaties voor nieuwe berichten</span>
              </div>
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start met Swipen!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
