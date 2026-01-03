'use client'

/**
 * SimplifiedProgress - LVB-vriendelijke progressie-indicator
 *
 * Features:
 * - Grote cirkels met nummers
 * - "Stap X van Y" tekst
 * - Audio: "Je bent bij stap X"
 * - Kleur verandert bij voltooiing
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Volume2 } from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'

interface SimplifiedProgressProps {
  currentStep: number
  totalSteps: number
  stepNames?: string[] // Optional step names
  className?: string
}

export function SimplifiedProgress({
  currentStep,
  totalSteps,
  stepNames,
  className = '',
}: SimplifiedProgressProps) {
  const { speakForced, isLVBMode } = useAccessibility()

  // Announce step change in LVB mode
  useEffect(() => {
    if (isLVBMode) {
      const stepName = stepNames?.[currentStep - 1]
      const text = stepName
        ? `Je bent nu bij stap ${currentStep} van ${totalSteps}: ${stepName}`
        : `Je bent nu bij stap ${currentStep} van ${totalSteps}`

      const timer = setTimeout(() => {
        speakForced(text)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [currentStep, totalSteps, stepNames, isLVBMode, speakForced])

  const handleAudioClick = () => {
    const stepName = stepNames?.[currentStep - 1]
    const completedText = currentStep > 1
      ? `Je hebt ${currentStep - 1} ${currentStep - 1 === 1 ? 'stap' : 'stappen'} voltooid.`
      : ''
    const text = stepName
      ? `Je bent nu bij stap ${currentStep} van ${totalSteps}: ${stepName}. ${completedText}`
      : `Je bent nu bij stap ${currentStep} van ${totalSteps}. ${completedText}`
    speakForced(text)
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Main progress text */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <span className="text-2xl font-bold text-slate-900">
            Stap {currentStep} van {totalSteps}
          </span>

          {/* Audio button */}
          {isLVBMode && (
            <button
              onClick={handleAudioClick}
              className="p-2 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-colors"
              aria-label="Lees stap voor"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </motion.div>

        {/* Step name if available */}
        {stepNames?.[currentStep - 1] && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-slate-600"
          >
            {stepNames[currentStep - 1]}
          </motion.span>
        )}
      </div>

      {/* Progress circles */}
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isPending = stepNumber > currentStep

          return (
            <div key={index} className="flex-1 flex items-center">
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  opacity: 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: index * 0.1
                }}
                className={`
                  relative flex items-center justify-center
                  w-14 h-14 rounded-full font-bold text-xl
                  transition-colors duration-300
                  ${isCompleted
                    ? 'bg-teal-600 text-white'
                    : isCurrent
                      ? 'bg-rose-500 text-white ring-4 ring-rose-200'
                      : 'bg-slate-200 text-slate-400'
                  }
                `}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={
                  isCompleted
                    ? `Stap ${stepNumber}: Voltooid`
                    : isCurrent
                      ? `Stap ${stepNumber}: Huidige stap`
                      : `Stap ${stepNumber}: Nog te doen`
                }
              >
                {isCompleted ? (
                  <Check className="w-7 h-7" />
                ) : (
                  stepNumber
                )}

                {/* Pulse animation for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-rose-500"
                    initial={{ opacity: 0.5, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </motion.div>

              {/* Connecting line */}
              {index < totalSteps - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <motion.div
                    className={`h-full rounded-full ${
                      isCompleted ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    style={{ originX: 0 }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar alternative (mobile-friendly) */}
      <div className="mt-4 md:hidden">
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-rose-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

export default SimplifiedProgress
