'use client'

/**
 * World-Class Feedback Survey
 *
 * Typeform-style one-question-at-a-time experience
 * with smooth animations and smart UX
 */

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Send, CheckCircle, Heart, ChevronDown,
  Sparkles, ArrowRight, Gift, MessageCircle
} from 'lucide-react'

// Survey questions configuration
const QUESTIONS = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Hoi! 👋',
    subtitle: 'We zijn benieuwd naar jouw ervaring met Liefde Voor Iedereen.',
    description: 'Dit duurt maar 2 minuten en je krijgt 5 gratis SuperBerichten als dank!',
  },
  {
    id: 'satisfaction',
    type: 'rating',
    title: 'Hoe tevreden ben je overall?',
    subtitle: 'Met Liefde Voor Iedereen als datingsite',
    field: 'satisfaction',
    labels: ['Zeer ontevreden', 'Ontevreden', 'Neutraal', 'Tevreden', 'Zeer tevreden'],
    emojis: ['😞', '😕', '😐', '🙂', '😍']
  },
  {
    id: 'easeOfUse',
    type: 'rating',
    title: 'Hoe makkelijk was het activeren?',
    subtitle: 'Van email tot werkend account',
    field: 'easeOfUse',
    labels: ['Zeer moeilijk', 'Moeilijk', 'Neutraal', 'Makkelijk', 'Zeer makkelijk'],
    emojis: ['😫', '😣', '😐', '😊', '🎉']
  },
  {
    id: 'designRating',
    type: 'rating',
    title: 'Wat vind je van het design?',
    subtitle: 'De look & feel van de nieuwe site',
    field: 'designRating',
    labels: ['Lelijk', 'Matig', 'Oké', 'Mooi', 'Prachtig'],
    emojis: ['👎', '😕', '👌', '👍', '🤩']
  },
  {
    id: 'missingFeatures',
    type: 'multiselect',
    title: 'Wat mis je van OogvoorLiefde?',
    subtitle: 'Selecteer alles wat van toepassing is',
    field: 'missingFeatures',
    options: [
      { id: 'chat_history', label: 'Oude chatgeschiedenis', icon: '💬' },
      { id: 'contacts', label: 'Mijn contacten/favorieten', icon: '⭐' },
      { id: 'photos', label: 'Meer foto opties', icon: '📸' },
      { id: 'search_filters', label: 'Betere zoekfilters', icon: '🔍' },
      { id: 'profile_views', label: 'Profielbezoekers zien', icon: '👀' },
      { id: 'notifications', label: 'Push notificaties', icon: '🔔' },
      { id: 'mobile_app', label: 'Mobile app', icon: '📱' },
      { id: 'nothing', label: 'Ik mis niets!', icon: '✨' },
    ]
  },
  {
    id: 'bestFeature',
    type: 'text',
    title: 'Wat vind je het beste?',
    subtitle: 'Aan de nieuwe Liefde Voor Iedereen',
    field: 'bestFeature',
    placeholder: 'Bijv. het design, de snelheid, de matches...'
  },
  {
    id: 'wouldRecommend',
    type: 'nps',
    title: 'Zou je ons aanbevelen?',
    subtitle: 'Aan vrienden of familie die op zoek zijn naar liefde',
    field: 'wouldRecommend'
  },
  {
    id: 'improvements',
    type: 'textarea',
    title: 'Wat kunnen we verbeteren?',
    subtitle: 'Jouw suggesties helpen ons enorm',
    field: 'improvements',
    placeholder: 'Vertel ons wat beter kan...',
    optional: true
  },
  {
    id: 'thankYou',
    type: 'thankYou'
  }
]

interface SurveyData {
  satisfaction: number
  easeOfUse: number
  designRating: number
  missingFeatures: string[]
  otherMissing: string
  bestFeature: string
  improvements: string
  wouldRecommend: number
  additionalComments: string
}

export default function FeedbackPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime] = useState(Date.now())
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({})

  const [data, setData] = useState<SurveyData>({
    satisfaction: 0,
    easeOfUse: 0,
    designRating: 0,
    missingFeatures: [],
    otherMissing: '',
    bestFeature: '',
    improvements: '',
    wouldRecommend: -1,
    additionalComments: ''
  })

  const question = QUESTIONS[currentQuestion]
  const progress = (currentQuestion / (QUESTIONS.length - 1)) * 100

  const updateData = (field: keyof SurveyData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleMissingFeature = (id: string) => {
    setData(prev => {
      // If selecting "nothing", clear others
      if (id === 'nothing') {
        return { ...prev, missingFeatures: prev.missingFeatures.includes('nothing') ? [] : ['nothing'] }
      }
      // If selecting something else, remove "nothing"
      const filtered = prev.missingFeatures.filter(f => f !== 'nothing')
      return {
        ...prev,
        missingFeatures: filtered.includes(id)
          ? filtered.filter(f => f !== id)
          : [...filtered, id]
      }
    })
  }

  const canProceed = useCallback(() => {
    if (!question) return false
    switch (question.type) {
      case 'welcome':
        return true
      case 'rating':
        return data[question.field as keyof SurveyData] > 0
      case 'nps':
        return data.wouldRecommend >= 0
      case 'multiselect':
        return data.missingFeatures.length > 0
      case 'text':
        return (data[question.field as keyof SurveyData] as string).trim().length > 0
      case 'textarea':
        return question.optional || (data[question.field as keyof SurveyData] as string).trim().length > 0
      default:
        return true
    }
  }, [question, data])

  const trackQuestionTime = useCallback(() => {
    if (question?.id) {
      setQuestionTimes(prev => ({
        ...prev,
        [question.id]: Date.now()
      }))
    }
  }, [question?.id])

  const goNext = useCallback(async () => {
    if (!canProceed()) return

    trackQuestionTime()

    // If we're on the last question before thank you, submit
    if (currentQuestion === QUESTIONS.length - 2) {
      await handleSubmit()
      return
    }

    setDirection(1)
    setCurrentQuestion(prev => Math.min(prev + 1, QUESTIONS.length - 1))
  }, [canProceed, currentQuestion, trackQuestionTime])

  const goBack = () => {
    if (currentQuestion > 0) {
      setDirection(-1)
      setCurrentQuestion(prev => prev - 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canProceed, goNext])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      // Track completion time
      const completionTime = Math.round((Date.now() - startTime) / 1000)

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          completionTime,
          questionTimes
        })
      })

      if (!response.ok) {
        throw new Error('Er ging iets mis')
      }

      setSubmitted(true)
      setDirection(1)
      setCurrentQuestion(QUESTIONS.length - 1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  }

  // Render different question types
  const renderQuestion = () => {
    if (!question) return null

    switch (question.type) {
      case 'welcome':
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-200"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-slate-800 mb-4"
            >
              {question.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-600 mb-4"
            >
              {question.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium"
            >
              <Gift className="w-4 h-4" />
              {question.description}
            </motion.div>
          </div>
        )

      case 'rating':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{question.title}</h2>
            <p className="text-slate-500 mb-10">{question.subtitle}</p>

            <div className="flex justify-center gap-3 sm:gap-6 mb-6">
              {[1, 2, 3, 4, 5].map((rating, index) => {
                const isSelected = data[question.field as keyof SurveyData] === rating
                const emoji = question.emojis?.[index]

                return (
                  <motion.button
                    key={rating}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      updateData(question.field as keyof SurveyData, rating)
                      // Auto-advance after selection with delay
                      setTimeout(() => goNext(), 400)
                    }}
                    className={`relative group`}
                  >
                    <div className={`
                      w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl
                      transition-all duration-200 border-2
                      ${isSelected
                        ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-200 scale-110'
                        : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-md'
                      }
                    `}>
                      <span className={isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0 transition-all'}>
                        {emoji}
                      </span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isSelected ? 1 : 0,
                        y: isSelected ? 0 : 10
                      }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    >
                      <span className="text-xs font-medium text-rose-600">
                        {question.labels?.[index]}
                      </span>
                    </motion.div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )

      case 'nps':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{question.title}</h2>
            <p className="text-slate-500 mb-10">{question.subtitle}</p>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                const isSelected = data.wouldRecommend === score
                const isDetractor = score <= 6
                const isPassive = score >= 7 && score <= 8
                const isPromoter = score >= 9

                let bgColor = 'bg-slate-100 hover:bg-slate-200'
                let selectedBg = 'bg-slate-500'

                if (isDetractor) {
                  bgColor = 'bg-red-50 hover:bg-red-100'
                  selectedBg = 'bg-red-500'
                } else if (isPassive) {
                  bgColor = 'bg-amber-50 hover:bg-amber-100'
                  selectedBg = 'bg-amber-500'
                } else if (isPromoter) {
                  bgColor = 'bg-emerald-50 hover:bg-emerald-100'
                  selectedBg = 'bg-emerald-500'
                }

                return (
                  <motion.button
                    key={score}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      updateData('wouldRecommend', score)
                      setTimeout(() => goNext(), 400)
                    }}
                    className={`
                      w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-bold text-lg transition-all
                      ${isSelected
                        ? `${selectedBg} text-white shadow-lg scale-110`
                        : `${bgColor} text-slate-700`
                      }
                    `}
                  >
                    {score}
                  </motion.button>
                )
              })}
            </div>

            <div className="flex justify-between text-xs text-slate-400 px-2 max-w-md mx-auto">
              <span>Zeker niet</span>
              <span>Absoluut!</span>
            </div>

            {data.wouldRecommend >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                {data.wouldRecommend <= 6 && (
                  <p className="text-red-600 text-sm">
                    Wat jammer! We willen graag weten wat we kunnen verbeteren.
                  </p>
                )}
                {data.wouldRecommend >= 7 && data.wouldRecommend <= 8 && (
                  <p className="text-amber-600 text-sm">
                    Bedankt! Wat zou je een 9 of 10 geven?
                  </p>
                )}
                {data.wouldRecommend >= 9 && (
                  <p className="text-emerald-600 text-sm flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4 fill-current" /> Geweldig, dankjewel!
                  </p>
                )}
              </motion.div>
            )}
          </div>
        )

      case 'multiselect':
        return (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">{question.title}</h2>
            <p className="text-slate-500 mb-8 text-center">{question.subtitle}</p>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {question.options?.map((option, index) => {
                const isSelected = data.missingFeatures.includes(option.id)

                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMissingFeature(option.id)}
                    className={`
                      p-4 rounded-xl text-left transition-all border-2 flex items-center gap-3
                      ${isSelected
                        ? 'border-rose-500 bg-rose-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`font-medium ${isSelected ? 'text-rose-700' : 'text-slate-700'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <CheckCircle className="w-5 h-5 text-rose-500" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{question.title}</h2>
            <p className="text-slate-500 mb-8">{question.subtitle}</p>

            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={data[question.field as keyof SurveyData] as string}
                onChange={(e) => updateData(question.field as keyof SurveyData, e.target.value)}
                placeholder={question.placeholder}
                autoFocus
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-center"
              />
              <p className="text-sm text-slate-400 mt-3">
                Druk op Enter om door te gaan
              </p>
            </div>
          </div>
        )

      case 'textarea':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{question.title}</h2>
            <p className="text-slate-500 mb-8">{question.subtitle}</p>

            <div className="max-w-md mx-auto">
              <textarea
                value={data[question.field as keyof SurveyData] as string}
                onChange={(e) => updateData(question.field as keyof SurveyData, e.target.value)}
                placeholder={question.placeholder}
                rows={4}
                autoFocus
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none transition-all resize-none"
              />
              {question.optional && (
                <p className="text-sm text-slate-400 mt-3">
                  Dit is optioneel - je mag ook overslaan
                </p>
              )}
            </div>
          </div>
        )

      case 'thankYou':
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-slate-800 mb-4"
            >
              Dankjewel! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-600 mb-6"
            >
              Jouw feedback helpt ons om Liefde Voor Iedereen nog beter te maken.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl mb-8"
            >
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-amber-800">+5 SuperBerichten</p>
                <p className="text-sm text-amber-600">Toegevoegd aan je account!</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300"
              >
                <Heart className="w-5 h-5" />
                Ontdek nieuwe matches
              </Link>
            </motion.div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Image
            src="/images/LiefdevoorIedereen_logo.png"
            alt="Liefde Voor Iedereen"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
          {question?.type !== 'welcome' && question?.type !== 'thankYou' && (
            <span className="text-sm text-slate-400">
              {currentQuestion} / {QUESTIONS.length - 2}
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {question?.type !== 'welcome' && question?.type !== 'thankYou' && (
        <div className="px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full"
            >
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer with navigation */}
      {question?.type !== 'thankYou' && (
        <footer className="p-4 sm:p-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {currentQuestion > 0 && question?.type !== 'welcome' ? (
              <button
                onClick={goBack}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                ← Terug
              </button>
            ) : (
              <div />
            )}

            {question?.type === 'welcome' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goNext}
                className="ml-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200 flex items-center gap-2"
              >
                Start de survey
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : question?.type === 'multiselect' || question?.type === 'text' || question?.type === 'textarea' ? (
              <motion.button
                whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                onClick={goNext}
                disabled={!canProceed() || submitting}
                className={`
                  px-6 py-3 font-semibold rounded-xl transition-all flex items-center gap-2
                  ${canProceed()
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-pink-600'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verzenden...
                  </>
                ) : currentQuestion === QUESTIONS.length - 2 ? (
                  <>
                    <Send className="w-5 h-5" />
                    Verstuur
                  </>
                ) : (
                  <>
                    Volgende
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            ) : (
              <div className="text-sm text-slate-400 flex items-center gap-1">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                Selecteer om door te gaan
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
