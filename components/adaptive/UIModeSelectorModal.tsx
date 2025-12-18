/**
 * UI Mode Selector Modal - Wereldklasse Onboarding Experience
 *
 * Een prachtige, toegankelijke modal voor het selecteren van de UI mode.
 * Kan gebruikt worden tijdens onboarding of vanuit settings.
 *
 * Features:
 * - Animated cards met Framer Motion
 * - Keyboard navigation (Tab, Enter, Arrow keys)
 * - Touch-friendly op mobile
 * - Focus trap voor accessibility
 * - Responsive design
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Sparkles, Zap, Rocket, ChevronRight, Info } from 'lucide-react'
import { useAdaptiveUI } from './AdaptiveUIProvider'
import { type UIMode, MODE_CONFIGS } from '@/lib/adaptive-ui'

// ============================================================================
// TYPES
// ============================================================================

interface UIModeSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  showOnboarding?: boolean
  title?: string
  subtitle?: string
}

// ============================================================================
// ICONS
// ============================================================================

const ModeIcons: Record<UIMode, React.ComponentType<{ className?: string }>> = {
  simple: ({ className }) => (
    <div className={`flex items-center justify-center ${className}`}>
      <Sparkles className="w-8 h-8" />
    </div>
  ),
  standard: ({ className }) => (
    <div className={`flex items-center justify-center ${className}`}>
      <Zap className="w-8 h-8" />
    </div>
  ),
  advanced: ({ className }) => (
    <div className={`flex items-center justify-center ${className}`}>
      <Rocket className="w-8 h-8" />
    </div>
  ),
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
}

const cardVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  selected: {
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
}

const checkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', damping: 15, stiffness: 400 },
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UIModeSelectorModal({
  isOpen,
  onClose,
  showOnboarding = false,
  title,
  subtitle,
}: UIModeSelectorModalProps) {
  const { mode: currentMode, setMode, preferences, completeOnboarding } = useAdaptiveUI()
  const [selectedMode, setSelectedMode] = useState<UIMode>(currentMode)
  const [focusedIndex, setFocusedIndex] = useState(
    MODE_CONFIGS.findIndex((c) => c.id === currentMode)
  )
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Sync selected mode with current mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMode(currentMode)
      setFocusedIndex(MODE_CONFIGS.findIndex((c) => c.id === currentMode))
    }
  }, [isOpen, currentMode])

  // Focus trap and escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (!showOnboarding) {
            onClose()
          }
          break
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => (prev + 1) % MODE_CONFIGS.length)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => (prev - 1 + MODE_CONFIGS.length) % MODE_CONFIGS.length)
          break
        case 'Enter':
        case ' ':
          if (document.activeElement?.getAttribute('data-mode-card')) {
            e.preventDefault()
            setSelectedMode(MODE_CONFIGS[focusedIndex].id)
          }
          break
        case 'Tab':
          // Keep focus within modal
          if (modalRef.current) {
            const focusables = modalRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            const first = focusables[0] as HTMLElement
            const last = focusables[focusables.length - 1] as HTMLElement

            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault()
              last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault()
              first.focus()
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, showOnboarding, focusedIndex])

  // Focus first element on open
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      setTimeout(() => {
        firstFocusableRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleConfirm = useCallback(() => {
    setMode(selectedMode, true)
    if (showOnboarding) {
      completeOnboarding()
    }
    onClose()
  }, [selectedMode, setMode, showOnboarding, completeOnboarding, onClose])

  const getModeColorClasses = (modeId: UIMode, isSelected: boolean) => {
    const colors = {
      simple: {
        bg: isSelected ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300',
        icon: 'text-emerald-600',
        badge: 'bg-emerald-600',
      },
      standard: {
        bg: isSelected ? 'bg-pink-50 border-pink-500' : 'bg-white border-gray-200 hover:border-pink-300',
        icon: 'text-pink-600',
        badge: 'bg-pink-600',
      },
      advanced: {
        bg: isSelected ? 'bg-violet-50 border-violet-500' : 'bg-white border-gray-200 hover:border-violet-300',
        icon: 'text-violet-600',
        badge: 'bg-violet-600',
      },
    }
    return colors[modeId]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={showOnboarding ? undefined : onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mode-selector-title"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 id="mode-selector-title" className="text-2xl font-bold mb-2">
                    {title || (showOnboarding ? 'Welkom! Kies jouw ervaring' : 'Pas jouw ervaring aan')}
                  </h2>
                  <p className="text-pink-100 max-w-xl">
                    {subtitle || 'Selecteer de modus die het beste bij jou past. Je kunt dit altijd later wijzigen in de instellingen.'}
                  </p>
                </div>
                {!showOnboarding && (
                  <button
                    ref={firstFocusableRef}
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Sluiten"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Mode Cards */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {MODE_CONFIGS.map((config, index) => {
                  const isSelected = selectedMode === config.id
                  const isFocused = focusedIndex === index
                  const colors = getModeColorClasses(config.id, isSelected)
                  const IconComponent = ModeIcons[config.id]

                  return (
                    <motion.button
                      key={config.id}
                      data-mode-card="true"
                      variants={cardVariants}
                      initial="idle"
                      whileHover="hover"
                      whileTap="tap"
                      animate={isSelected ? 'selected' : 'idle'}
                      onClick={() => {
                        setSelectedMode(config.id)
                        setFocusedIndex(index)
                      }}
                      className={`
                        relative text-left p-5 rounded-xl border-2 transition-all
                        focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                        ${colors.bg}
                        ${isFocused ? 'ring-2 ring-pink-500 ring-offset-2' : ''}
                      `}
                      aria-pressed={isSelected}
                      aria-label={`${config.name}: ${config.tagline}`}
                    >
                      {/* Selected Indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            variants={checkVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className={`absolute -top-2 -right-2 w-8 h-8 ${colors.badge} text-white rounded-full flex items-center justify-center shadow-lg`}
                          >
                            <Check className="w-5 h-5" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Icon & Name */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl ${isSelected ? colors.badge : 'bg-gray-100'} ${isSelected ? 'text-white' : colors.icon} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{config.name}</h3>
                          <p className="text-sm text-gray-600">{config.tagline}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                        {config.description}
                      </p>

                      {/* Benefits */}
                      <ul className="space-y-2 mb-4">
                        {config.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? colors.icon : 'text-green-600'}`} />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Audience */}
                      <p className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                        {config.audience}
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <strong>Geen zorgen!</strong> Je kunt dit altijd wijzigen in je instellingen.
                  Experimenteer en kies wat het beste voelt voor jou.
                  {preferences.reducedMotion && (
                    <span className="block mt-1 text-blue-700">
                      We hebben gedetecteerd dat je voorkeur hebt voor minder beweging - dit wordt automatisch toegepast.
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
                {!showOnboarding && (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors text-center sm:text-left"
                  >
                    Annuleren
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className={`
                    flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white shadow-lg
                    bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
                    transition-all ${showOnboarding ? 'w-full sm:w-auto' : 'ml-auto'}
                  `}
                >
                  {showOnboarding ? 'Aan de slag!' : 'Opslaan'}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default UIModeSelectorModal
