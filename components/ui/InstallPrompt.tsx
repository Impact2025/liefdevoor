/**
 * PWA Install Prompt Component
 * Shows a banner to encourage app installation
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Smartphone } from 'lucide-react'
import { usePWA } from '@/hooks'

interface InstallPromptProps {
  delay?: number // Delay before showing (ms)
}

export function InstallPrompt({ delay = 5000 }: InstallPromptProps) {
  const { isInstallable, isInstalled, installApp } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed, 10)
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
        return
      }
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !dismissed) {
        setShowPrompt(true)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, dismissed, delay])

  const handleInstall = async () => {
    const installed = await installApp()
    if (installed) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-rose-500 to-purple-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Smartphone className="w-5 h-5" />
                <span className="font-semibold">Installeer de App</span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-4">
                Installeer Liefde Voor Iedereen op je telefoon voor de beste ervaring:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Snellere toegang
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Push notificaties
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Werkt offline
                </li>
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Later
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Installeren
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * iOS Safari Install Instructions
 */
export function IOSInstallInstructions() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    if (isIOS && isSafari && !isStandalone) {
      const dismissed = localStorage.getItem('ios-install-dismissed')
      if (!dismissed) {
        setTimeout(() => setShow(true), 3000)
      }
    }
  }, [])

  if (!show) return null

  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-50"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => {
          setShow(false)
          localStorage.setItem('ios-install-dismissed', 'true')
        }}
        className="absolute top-2 right-2 text-gray-400"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="font-semibold text-gray-800 mb-2">Installeer de App</h3>
      <p className="text-sm text-gray-600 mb-3">
        Voeg deze app toe aan je beginscherm:
      </p>
      <ol className="text-sm text-gray-600 space-y-2">
        <li className="flex items-center gap-2">
          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">1</span>
          Tik op het <strong>Deel</strong> icoon onderaan
        </li>
        <li className="flex items-center gap-2">
          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">2</span>
          Scroll en tik op <strong>"Zet op beginscherm"</strong>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">3</span>
          Tik op <strong>"Voeg toe"</strong>
        </li>
      </ol>
    </motion.div>
  )
}
