'use client'

/**
 * AccessibilityWelcome - Wereldklasse Welkomstscherm
 *
 * Automatisch getoond na registratie voor gebruikers die via
 * een toegankelijkheidsgerichte landing page komen.
 *
 * Features:
 * - Auto-detect registrationSource
 * - Explain enabled accessibility features
 * - Text-to-speech introduction
 * - Large buttons & high contrast
 * - Keyboard accessible
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  Volume2,
  Type,
  Hand,
  Check,
  Settings,
  ArrowRight,
  X,
  Play,
  Pause
} from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import Link from 'next/link'

interface AccessibilityWelcomeProps {
  source?: string | null
  onDismiss: () => void
}

export default function AccessibilityWelcome({ source, onDismiss }: AccessibilityWelcomeProps) {
  const { settings, speak, stopSpeaking, isSpeaking } = useAccessibility()
  const [hasPlayed, setHasPlayed] = useState(false)

  const isValidSource = source === 'visueel' || source === 'lvb'
  const isVisualSource = source === 'visueel'
  const _isLVBSource = source === 'lvb'

  const features = isVisualSource
    ? [
        {
          icon: Eye,
          title: 'Extra Hoog Contrast',
          description: 'WCAG AAA compliant (7:1 ratio) voor maximale leesbaarheid',
          enabled: settings.extraHighContrast,
        },
        {
          icon: Volume2,
          title: 'Text-to-Speech',
          description: 'Laat tekst voorlezen met een druk op de knop',
          enabled: settings.textToSpeech,
        },
        {
          icon: Type,
          title: 'Grote Tekst (125%)',
          description: 'Alle tekst 25% groter voor beter lezen',
          enabled: settings.largeTextMode,
        },
        {
          icon: Hand,
          title: 'Grote Knoppen (56px)',
          description: 'Minimaal 56px touch targets voor gemakkelijk gebruik',
          enabled: settings.largeTargetsMode,
        },
      ]
    : [
        {
          icon: Type,
          title: 'Grote Tekst',
          description: 'Duidelijke, grote letters',
          enabled: settings.largeTextMode,
        },
        {
          icon: Hand,
          title: 'Grote Knoppen',
          description: 'Makkelijk om op te klikken',
          enabled: settings.largeTargetsMode,
        },
      ]

  const welcomeMessage = isVisualSource
    ? `Welkom bij Liefde Voor Iedereen! We hebben speciale toegankelijkheidsopties voor je ingeschakeld omdat je via onze slechtzienden-vriendelijke pagina komt. Je kunt deze later altijd aanpassen in de instellingen.`
    : `Welkom bij Liefde Voor Iedereen! We hebben alles simpel gemaakt. Grote letters en grote knoppen zodat alles makkelijk is.`

  const handlePlayIntro = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(welcomeMessage)
      setHasPlayed(true)
    }
  }

  useEffect(() => {
    // Auto-play intro if text-to-speech is enabled (only for visueel)
    if (isValidSource && isVisualSource && settings.textToSpeech && !hasPlayed) {
      const timer = setTimeout(() => {
        speak(welcomeMessage)
        setHasPlayed(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isValidSource, isVisualSource, settings.textToSpeech, hasPlayed, speak, welcomeMessage])

  // Don't show for non-accessibility sources
  if (!isValidSource) {
    return null
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          role="dialog"
          aria-labelledby="accessibility-welcome-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="accessibility-welcome-title"
                  className="text-3xl font-bold text-slate-900 mb-2"
                >
                  Toegankelijkheid Ingeschakeld! 🎉
                </h2>
                <p className="text-lg text-slate-600">
                  Je ervaring is geoptimaliseerd
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Sluiten"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Welcome Message */}
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-sky-500 p-3 rounded-xl flex-shrink-0">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {welcomeMessage}
                  </p>

                  {/* Play Audio Button (for visueel users) */}
                  {isVisualSource && settings.textToSpeech && (
                    <button
                      onClick={handlePlayIntro}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors"
                      aria-label={isSpeaking ? 'Stop voorlezen' : 'Lees bericht voor'}
                    >
                      {isSpeaking ? (
                        <>
                          <Pause className="w-5 h-5" />
                          Stop voorlezen
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          {hasPlayed ? 'Opnieuw beluisteren' : 'Luister'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Wat hebben we voor je ingeschakeld:
              </h3>
              <div className="grid gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 ${
                        feature.enabled
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg flex-shrink-0 ${
                          feature.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                          {feature.title}
                          {feature.enabled && (
                            <Check className="w-5 h-5 text-emerald-600" />
                          )}
                        </h4>
                        <p className="text-slate-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/settings?tab=accessibility"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Pas Instellingen Aan
              </Link>
              <button
                onClick={onDismiss}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors"
                autoFocus
              >
                Naar Mijn Profiel
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
