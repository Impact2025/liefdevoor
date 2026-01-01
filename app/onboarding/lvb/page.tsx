'use client'

/**
 * LVB Onboarding - Vereenvoudigde 4-staps onboarding voor LVB gebruikers
 *
 * Stappen:
 * 1. Foto uploaden
 * 2. Wat zoek je? (vriendschap/liefde)
 * 3. Vertel over jezelf (3 simpele vragen)
 * 4. Klaar! Confetti
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Heart, Camera, Users, Sparkles, Check, ArrowRight, Volume2 } from 'lucide-react'
import Image from 'next/image'
import Confetti from 'react-confetti'

import { useAccessibility } from '@/contexts/AccessibilityContext'
import { SimplifiedProgress } from '@/components/onboarding/SimplifiedProgress'
import { GuidanceButton } from '@/components/ui/GuidanceButton'
import { VisualConsentFlow } from '@/components/consent/VisualConsentFlow'

const STEPS = ['Foto', 'Doel', 'Over jou', 'Klaar!']
const TOTAL_STEPS = 4

export default function LVBOnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { speakForced, isLVBMode } = useAccessibility()

  const [currentStep, setCurrentStep] = useState(0) // 0 = consent, 1-4 = steps
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Form data
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [goal, setGoal] = useState<'friends' | 'love' | 'both' | null>(null)
  const [personality, setPersonality] = useState({
    outgoing: null as 'yes' | 'no' | null,
    active: null as 'yes' | 'no' | null,
    serious: null as 'yes' | 'no' | null,
  })

  // Check auth and redirect
  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // Check if already onboarded
    const checkOnboarding = async () => {
      try {
        const response = await fetch('/api/onboarding/status')
        if (response.ok) {
          const data = await response.json()
          if (data.isOnboarded) {
            router.push('/discover')
            return
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboarding()
  }, [status, router])

  // Save step to server
  const saveStep = useCallback(async (stepData: Record<string, unknown>) => {
    try {
      await fetch('/api/onboarding/step', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: currentStep, data: stepData, mode: 'SIMPLE' }),
      })
    } catch (error) {
      console.error('Error saving step:', error)
    }
  }, [currentStep])

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    setIsSaving(true)
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'SIMPLE',
          lvbMode: true,
        }),
      })

      setShowConfetti(true)

      // Navigate after confetti
      setTimeout(() => {
        router.push('/discover')
      }, 3000)
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsSaving(false)
    }
  }, [router])

  // Step handlers
  const handleConsentAccept = () => {
    setCurrentStep(1)
    if (isLVBMode) {
      speakForced('Super! Nu gaan we je profiel maken. We beginnen met een foto van jezelf.')
    }
  }

  const handleConsentDecline = () => {
    router.push('/')
  }

  const handlePhotoNext = () => {
    saveStep({ photoUrl })
    setCurrentStep(2)
    if (isLVBMode) {
      speakForced('Goed zo! Nu vertellen wat je zoekt. Wil je vrienden maken of zoek je de liefde?')
    }
  }

  const handleGoalSelect = (selectedGoal: 'friends' | 'love' | 'both') => {
    setGoal(selectedGoal)
    saveStep({ goal: selectedGoal })
    setCurrentStep(3)
    if (isLVBMode) {
      speakForced('Prima! Nu een paar vragen over jezelf. Beantwoord met Ja of Nee.')
    }
  }

  const handlePersonalityNext = () => {
    saveStep({ personality })
    setCurrentStep(4)
    if (isLVBMode) {
      speakForced('Geweldig! Je profiel is klaar. Je kunt nu mensen ontmoeten!')
    }
    completeOnboarding()
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For demo purposes, use a local URL
      // In production, upload to storage
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
    }
  }

  // Loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Heart className="w-10 h-10 text-white fill-white" />
          </motion.div>
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-xl text-purple-800">Even geduld...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 400}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-200 safe-top">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/LiefdevoorIedereen_logo.png"
              alt="Liefde Voor Iedereen"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Progress - only show after consent */}
          {currentStep > 0 && currentStep <= TOTAL_STEPS && (
            <SimplifiedProgress
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              stepNames={STEPS}
            />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Consent */}
          {currentStep === 0 && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <VisualConsentFlow
                type="registration"
                onAccept={handleConsentAccept}
                onDecline={handleConsentDecline}
              />
            </motion.div>
          )}

          {/* Step 1: Photo */}
          {currentStep === 1 && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center space-y-6"
            >
              <div className="mb-8">
                <Camera className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Voeg een foto toe
                </h2>
                <p className="text-xl text-slate-600">
                  Zo weten anderen wie je bent
                </p>
              </div>

              {/* Photo preview/upload */}
              <div className="relative mx-auto w-48 h-48">
                {photoUrl ? (
                  <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-purple-300">
                    <Image
                      src={photoUrl}
                      alt="Je foto"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setPhotoUrl(null)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg"
                    >
                      <span className="text-red-500">✕</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full border-4 border-dashed border-purple-300 rounded-3xl cursor-pointer hover:bg-purple-100 transition-colors">
                    <Camera className="w-12 h-12 text-purple-400 mb-2" />
                    <span className="text-lg text-purple-600 font-medium">
                      Kies foto
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="pt-6">
                <GuidanceButton
                  label={photoUrl ? 'Verder' : 'Later toevoegen'}
                  icon={<ArrowRight className="w-6 h-6" />}
                  audioText={photoUrl
                    ? 'Klik hier om door te gaan naar de volgende stap.'
                    : 'Je kunt ook later een foto toevoegen. Klik hier om door te gaan.'
                  }
                  onClick={handlePhotoNext}
                  variant={photoUrl ? 'success' : 'secondary'}
                  size="xlarge"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Goal */}
          {currentStep === 2 && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center space-y-6"
            >
              <div className="mb-8">
                <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Wat zoek je?
                </h2>
                <p className="text-xl text-slate-600">
                  Kies wat je wilt vinden
                </p>
              </div>

              <div className="space-y-4">
                <GuidanceButton
                  label="Vrienden"
                  icon={<Users className="w-8 h-8" />}
                  audioText="Klik hier als je op zoek bent naar vriendschap. Leuke mensen om mee te praten en dingen mee te doen."
                  onClick={() => handleGoalSelect('friends')}
                  variant={goal === 'friends' ? 'success' : 'secondary'}
                  size="xlarge"
                />

                <GuidanceButton
                  label="De liefde"
                  icon={<Heart className="w-8 h-8" />}
                  audioText="Klik hier als je op zoek bent naar een relatie. Iemand om verliefd op te worden."
                  onClick={() => handleGoalSelect('love')}
                  variant={goal === 'love' ? 'success' : 'secondary'}
                  size="xlarge"
                />

                <GuidanceButton
                  label="Allebei"
                  icon={<Sparkles className="w-8 h-8" />}
                  audioText="Klik hier als je zowel vrienden als de liefde wilt vinden. Je staat open voor alles!"
                  onClick={() => handleGoalSelect('both')}
                  variant={goal === 'both' ? 'success' : 'secondary'}
                  size="xlarge"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Personality (3 simple questions) */}
          {currentStep === 3 && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Vertel over jezelf
                </h2>
                <p className="text-xl text-slate-600">
                  Beantwoord met Ja of Nee
                </p>
              </div>

              {/* Question 1 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200">
                <p className="text-xl font-bold text-slate-900 mb-4 text-center">
                  Ben je graag onder de mensen?
                </p>
                <div className="flex gap-4">
                  <GuidanceButton
                    label="Ja"
                    icon={<span className="text-2xl">👋</span>}
                    onClick={() => setPersonality(p => ({ ...p, outgoing: 'yes' }))}
                    variant={personality.outgoing === 'yes' ? 'success' : 'secondary'}
                    size="large"
                    showAudioButton={false}
                  />
                  <GuidanceButton
                    label="Nee"
                    icon={<span className="text-2xl">🏠</span>}
                    onClick={() => setPersonality(p => ({ ...p, outgoing: 'no' }))}
                    variant={personality.outgoing === 'no' ? 'success' : 'secondary'}
                    size="large"
                    showAudioButton={false}
                  />
                </div>
              </div>

              {/* Question 2 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200">
                <p className="text-xl font-bold text-slate-900 mb-4 text-center">
                  Hou je van buiten zijn?
                </p>
                <div className="flex gap-4">
                  <GuidanceButton
                    label="Ja"
                    icon={<span className="text-2xl">🌳</span>}
                    onClick={() => setPersonality(p => ({ ...p, active: 'yes' }))}
                    variant={personality.active === 'yes' ? 'success' : 'secondary'}
                    size="large"
                    showAudioButton={false}
                  />
                  <GuidanceButton
                    label="Nee"
                    icon={<span className="text-2xl">📺</span>}
                    onClick={() => setPersonality(p => ({ ...p, active: 'no' }))}
                    variant={personality.active === 'no' ? 'success' : 'secondary'}
                    size="large"
                    showAudioButton={false}
                  />
                </div>
              </div>

              {/* Question 3 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200">
                <p className="text-xl font-bold text-slate-900 mb-4 text-center">
                  Ben je op zoek naar iets serieus?
                </p>
                <div className="flex gap-4">
                  <GuidanceButton
                    label="Ja"
                    icon={<span className="text-2xl">💍</span>}
                    onClick={() => setPersonality(p => ({ ...p, serious: 'yes' }))}
                    variant={personality.serious === 'yes' ? 'success' : 'secondary'}
                    size="large"
                    showAudioButton={false}
                  />
                  <GuidanceButton
                    label="Nee"
                    icon={<span className="text-2xl">🎉</span>}
                    onClick={() => setPersonality(p => ({ ...p, serious: 'no' }))}
                    variant={personality.serious === 'no' ? 'success' : 'secondary'}
                    size="large"
                    showAudioButton={false}
                  />
                </div>
              </div>

              {/* Next button */}
              <GuidanceButton
                label="Klaar!"
                icon={<Check className="w-8 h-8" />}
                audioText="Klik hier als je klaar bent met je antwoorden. Je profiel wordt dan opgeslagen."
                onClick={handlePersonalityNext}
                variant="success"
                size="xlarge"
                disabled={!personality.outgoing || !personality.active || !personality.serious}
                loading={isSaving}
              />
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Check className="w-16 h-16 text-white" />
              </motion.div>

              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Gefeliciteerd! 🎉
              </h2>
              <p className="text-2xl text-slate-600 mb-8">
                Je profiel is klaar!
              </p>

              <p className="text-xl text-slate-500">
                Je wordt doorgestuurd naar de app...
              </p>

              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mt-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
