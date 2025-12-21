/**
 * PWA Install Banner
 *
 * Shows a banner prompting users to install the app
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Zap, Bell, Heart } from 'lucide-react'
import { usePWA } from '@/hooks'

export function InstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if banner was dismissed before
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    if (dismissed) {
      const dismissedAt = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24)
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true)
      }
    }

    // Show banner after 5 seconds if installable
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !isDismissed) {
        setShowBanner(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, isDismissed])

  const handleDismiss = () => {
    setShowBanner(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', new Date().toISOString())
  }

  const handleInstall = async () => {
    const installed = await installApp()
    if (installed) {
      setShowBanner(false)
    }
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="p-5">
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                  <Heart size={28} className="text-white" fill="white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Installeer de app
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Voeg toe aan je startscherm voor de beste ervaring
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-1.5 bg-rose-100 rounded-full flex items-center justify-center">
                    <Zap size={18} className="text-rose-600" />
                  </div>
                  <span className="text-xs text-gray-600">Sneller</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-1.5 bg-rose-100 rounded-full flex items-center justify-center">
                    <Bell size={18} className="text-rose-600" />
                  </div>
                  <span className="text-xs text-gray-600">Notificaties</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-1.5 bg-rose-100 rounded-full flex items-center justify-center">
                    <Smartphone size={18} className="text-rose-600" />
                  </div>
                  <span className="text-xs text-gray-600">Volledig scherm</span>
                </div>
              </div>

              {/* Install Button */}
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3.5 rounded-xl font-semibold hover:from-rose-600 hover:to-rose-700 transition-colors"
              >
                <Download size={20} />
                <span>Installeren</span>
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                Gratis, geen app store nodig
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InstallBanner
