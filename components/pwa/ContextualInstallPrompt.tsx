/**
 * Contextual Install Prompt
 * Smart install prompt that triggers at optimal moments
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Heart, MessageCircle, Zap } from 'lucide-react'
import { useContextualInstall } from '@/hooks/useContextualInstall'

interface ContextualInstallPromptProps {
  trigger?: 'first_match' | 'multiple_swipes' | 'return_visit' | 'message_sent' | 'profile_complete' | 'timed'
  delay?: number
}

const triggerMessages = {
  first_match: {
    title: 'Je hebt een match! 🎉',
    description: 'Installeer de app om direct notificaties te krijgen bij nieuwe matches en berichten.',
    icon: Heart
  },
  multiple_swipes: {
    title: 'Je bent lekker bezig! 🔥',
    description: 'Installeer de app voor snellere toegang en blijf altijd verbonden met je matches.',
    icon: Zap
  },
  return_visit: {
    title: 'Welkom terug! 👋',
    description: 'Installeer de app op je startscherm voor directe toegang tot je matches.',
    icon: Heart
  },
  message_sent: {
    title: 'Eerste bericht verstuurd! 💬',
    description: 'Mis geen antwoord! Installeer de app voor instant berichten notificaties.',
    icon: MessageCircle
  },
  profile_complete: {
    title: 'Profiel compleet! ✨',
    description: 'Nu is het tijd om te matchen! Installeer de app voor de beste ervaring.',
    icon: Heart
  },
  timed: {
    title: 'Installeer de app',
    description: 'Krijg snellere toegang en push notificaties voor nieuwe matches.',
    icon: Heart
  }
}

export function ContextualInstallPrompt({
  trigger = 'timed',
  delay = 2000
}: ContextualInstallPromptProps) {
  const { shouldShow, handleInstall, handleDismiss } = useContextualInstall({
    trigger,
    delay
  })

  const message = triggerMessages[trigger]
  const Icon = message.icon

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-primary-100 overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="p-5">
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <Icon size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {message.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {message.description}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-1.5 bg-primary-100 rounded-full flex items-center justify-center">
                    <Zap size={18} className="text-primary-600" />
                  </div>
                  <span className="text-xs text-gray-600">Sneller</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-1.5 bg-primary-100 rounded-full flex items-center justify-center">
                    <MessageCircle size={18} className="text-primary-600" />
                  </div>
                  <span className="text-xs text-gray-600">Notificaties</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-1.5 bg-primary-100 rounded-full flex items-center justify-center">
                    <Heart size={18} className="text-primary-600" fill="currentColor" />
                  </div>
                  <span className="text-xs text-gray-600">Altijd online</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 px-4 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Later
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Download size={18} />
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
