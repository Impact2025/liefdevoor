/**
 * iOS Web Push Permissions
 * Handles push notification permissions for iOS 16.4+ Safari
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Heart, MessageCircle } from 'lucide-react'

export function IOSPushPermissions() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if iOS Safari 16.4+
    const checkIOS = () => {
      const ua = navigator.userAgent
      const isIOSDevice = /iPad|iPhone|iPod/.test(ua)
      const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)

      // Check Safari version (needs 16.4+)
      const match = ua.match(/Version\/(\d+)\.(\d+)/)
      const majorVersion = match ? parseInt(match[1], 10) : 0
      const minorVersion = match ? parseInt(match[2], 10) : 0
      const supportsWebPush = majorVersion > 16 || (majorVersion === 16 && minorVersion >= 4)

      return isIOSDevice && isSafari && supportsWebPush
    }

    setIsIOS(checkIOS())

    // Check current permission state
    if ('Notification' in window) {
      setPermissionState(Notification.permission)
    }

    // Show prompt if iOS, installed as PWA, and permission not yet granted
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('ios-push-dismissed')

    if (checkIOS() && isStandalone && Notification.permission === 'default' && !dismissed) {
      // Show after 10 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [])

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      setPermissionState(permission)

      if (permission === 'granted') {
        // Subscribe to push notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready

          // Request push subscription (requires VAPID keys)
          // This would connect to your push notification API
          console.log('[iOS Push] Permission granted')

          // Track analytics
          if (window.gtag) {
            window.gtag('event', 'ios_push_enabled', {
              event_category: 'PWA'
            })
          }
        }

        setShowPrompt(false)
      } else {
        // Track denial
        if (window.gtag) {
          window.gtag('event', 'ios_push_denied', {
            event_category: 'PWA'
          })
        }
      }
    } catch (error) {
      console.error('[iOS Push] Permission error:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('ios-push-dismissed', new Date().toISOString())

    if (window.gtag) {
      window.gtag('event', 'ios_push_dismissed', {
        event_category: 'PWA'
      })
    }
  }

  // Don't show if not iOS or permission already handled
  if (!isIOS || permissionState !== 'default') return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center">
              <Bell size={32} className="text-white" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Mis geen match!
            </h2>

            <p className="text-gray-600 text-center mb-6">
              Krijg direct een melding wanneer je een nieuwe match of bericht hebt.
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart size={18} className="text-primary-600" fill="currentColor" />
                </div>
                <span className="text-sm text-gray-700">Direct notificaties bij nieuwe matches</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-primary-600" />
                </div>
                <span className="text-sm text-gray-700">Instant berichten van je matches</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={requestPermission}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Sta Notificaties Toe
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Misschien Later
              </button>
            </div>

            {/* Info text */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Je kunt dit later altijd wijzigen in je instellingen
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
