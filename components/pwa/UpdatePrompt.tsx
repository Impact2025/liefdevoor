/**
 * PWA Update Prompt
 * Shows when a new version of the app is available
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import { usePWA } from '@/hooks'
import { useState } from 'react'

export function UpdatePrompt() {
  const { isUpdateAvailable, updateApp } = usePWA()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isUpdateAvailable) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-primary-200 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-hover px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">Update Beschikbaar</span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-700 text-sm mb-4">
              Er is een nieuwe versie van Liefde Voor Iedereen beschikbaar met verbeteringen en nieuwe features!
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Track update dismissal
                  if (window.gtag) {
                    window.gtag('event', 'pwa_update_dismissed', {
                      event_category: 'PWA'
                    })
                  }
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2.5 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Later
              </button>
              <button
                onClick={() => {
                  setIsUpdating(true)
                  // Track update
                  if (window.gtag) {
                    window.gtag('event', 'pwa_updated', {
                      event_category: 'PWA'
                    })
                  }
                  updateApp()
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Updaten...' : 'Nu Updaten'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
