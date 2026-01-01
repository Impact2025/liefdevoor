'use client'

/**
 * SafetyWarningModal - LVB-vriendelijke veiligheidswaarschuwing
 *
 * Features:
 * - Oranje achtergrond (waarschuwing)
 * - Groot icoon
 * - Simpele tekst
 * - Twee grote knoppen: Ja/Nee
 * - Audio uitleg
 */

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Shield, Volume2, X } from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { GuidanceButton } from '@/components/ui/GuidanceButton'

export type WarningType = 'phone' | 'iban' | 'money' | 'scam' | 'personal' | 'generic'

interface SafetyWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  type?: WarningType
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  detectedContent?: string // The content that triggered the warning
}

// Warning configurations by type
const warningConfigs: Record<WarningType, {
  title: string
  message: string
  audioText: string
  icon: React.ReactNode
}> = {
  phone: {
    title: 'Telefoonnummer delen?',
    message: 'Je staat op het punt om een telefoonnummer te delen. Dit is privé informatie.',
    audioText: 'Pas op! Je wilt een telefoonnummer delen. Dit is privé informatie. Weet je zeker dat je dit wilt doen? Als je de andere persoon niet goed kent, is het beter om dit niet te doen.',
    icon: <AlertTriangle className="w-16 h-16 text-amber-600" />,
  },
  iban: {
    title: 'Bankgegevens delen?',
    message: 'Je staat op het punt om een bankrekening nummer te delen. Deel dit NOOIT met iemand die je niet kent!',
    audioText: 'Grote waarschuwing! Je wilt bankgegevens delen. Dit is heel gevaarlijk! Deel nooit je bankrekening met iemand die je online hebt ontmoet. Oplichters kunnen hier misbruik van maken.',
    icon: <Shield className="w-16 h-16 text-red-600" />,
  },
  money: {
    title: 'Geld bespreken?',
    message: 'Je bericht bevat woorden over geld. Stuur nooit geld naar iemand die je online hebt ontmoet.',
    audioText: 'Let op! Je bericht gaat over geld. Stuur nooit geld naar iemand die je online hebt ontmoet. Ook niet voor noodgevallen. Dit is vaak oplichterij.',
    icon: <AlertTriangle className="w-16 h-16 text-amber-600" />,
  },
  scam: {
    title: 'Mogelijk verdacht bericht',
    message: 'Dit bericht bevat inhoud die vaak voorkomt bij oplichterij. Wees voorzichtig!',
    audioText: 'Waarschuwing! Dit bericht lijkt op berichten die oplichters sturen. Wees heel voorzichtig. Deel geen persoonlijke informatie en stuur geen geld.',
    icon: <Shield className="w-16 h-16 text-red-600" />,
  },
  personal: {
    title: 'Privégegevens delen?',
    message: 'Je staat op het punt om privégegevens te delen. Weet je zeker dat je dit wilt?',
    audioText: 'Je wilt privégegevens delen. Denk goed na of je deze persoon genoeg vertrouwt. Het is oké om nee te zeggen.',
    icon: <AlertTriangle className="w-16 h-16 text-amber-600" />,
  },
  generic: {
    title: 'Weet je het zeker?',
    message: 'Denk even na voordat je dit doet.',
    audioText: 'Wacht even. Denk goed na voordat je verder gaat. Is dit wat je wilt doen?',
    icon: <AlertTriangle className="w-16 h-16 text-amber-600" />,
  },
}

export function SafetyWarningModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  type = 'generic',
  title,
  message,
  confirmLabel = 'Ja, ik weet het zeker',
  cancelLabel = 'Nee, stop',
  detectedContent,
}: SafetyWarningModalProps) {
  const { speakForced, stopSpeaking, isLVBMode } = useAccessibility()

  const config = warningConfigs[type]
  const displayTitle = title || config.title
  const displayMessage = message || config.message
  const audioText = config.audioText

  // Auto-play audio when modal opens in LVB mode
  useEffect(() => {
    if (isOpen && isLVBMode) {
      const timer = setTimeout(() => {
        speakForced(audioText)
      }, 500)
      return () => {
        clearTimeout(timer)
        stopSpeaking()
      }
    }
  }, [isOpen, isLVBMode, audioText, speakForced, stopSpeaking])

  const handleConfirm = useCallback(() => {
    stopSpeaking()
    onConfirm()
  }, [stopSpeaking, onConfirm])

  const handleCancel = useCallback(() => {
    stopSpeaking()
    onCancel()
  }, [stopSpeaking, onCancel])

  const handleClose = useCallback(() => {
    stopSpeaking()
    onClose()
  }, [stopSpeaking, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl max-w-lg w-full shadow-2xl border-4 border-amber-400 overflow-hidden"
            role="alertdialog"
            aria-labelledby="warning-title"
            aria-describedby="warning-message"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-200 transition-colors"
              aria-label="Sluiten"
            >
              <X className="w-6 h-6 text-amber-800" />
            </button>

            {/* Warning Header */}
            <div className="bg-amber-400 px-8 py-6 flex items-center gap-4">
              {config.icon}
              <div>
                <h2
                  id="warning-title"
                  className="text-2xl md:text-3xl font-bold text-amber-900"
                >
                  {displayTitle}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Audio button */}
              {isLVBMode && (
                <button
                  onClick={() => speakForced(audioText)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-200 text-amber-800 rounded-full font-semibold hover:bg-amber-300 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                  Luister uitleg
                </button>
              )}

              {/* Message */}
              <p
                id="warning-message"
                className="text-xl text-amber-900 leading-relaxed"
              >
                {displayMessage}
              </p>

              {/* Show detected content if available */}
              {detectedContent && (
                <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-4">
                  <p className="text-amber-800 font-medium text-sm mb-1">
                    Gevonden in je bericht:
                  </p>
                  <p className="text-amber-900 font-mono text-lg">
                    {detectedContent}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-4 pt-4">
                {/* Cancel button (preferred action) */}
                <GuidanceButton
                  label={cancelLabel}
                  icon={<span className="text-2xl">🛑</span>}
                  audioText="Klik hier om te stoppen en terug te gaan. Dit is de veilige keuze."
                  onClick={handleCancel}
                  variant="danger"
                  size="large"
                  showAudioButton={false}
                />

                {/* Confirm button */}
                <GuidanceButton
                  label={confirmLabel}
                  icon={<span className="text-2xl">✓</span>}
                  audioText="Klik hier als je zeker weet wat je doet. Let op: dit kan risicovol zijn."
                  onClick={handleConfirm}
                  variant="secondary"
                  size="normal"
                  showAudioButton={false}
                />
              </div>

              {/* Safety tip */}
              <p className="text-sm text-amber-700 text-center pt-2">
                💡 Bij twijfel: kies altijd voor &quot;Nee, stop&quot;
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SafetyWarningModal
