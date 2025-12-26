'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, MessageCircle, HelpCircle, X, Loader2, PartyPopper, Calendar } from 'lucide-react'
import confetti from 'canvas-confetti'

interface VibeCheckPromptProps {
  matchId: string
  partnerName: string
  onClose?: () => void
}

type VibeCheckAnswer = 'wil_date' | 'meer_chatten' | 'twijfel'

interface VibeCheckState {
  id?: string
  status: 'none' | 'pending' | 'waiting' | 'completed' | 'expired'
  myAnswer?: VibeCheckAnswer | null
  theirAnswer?: VibeCheckAnswer | null
  bothWantDate?: boolean
  canCreate?: boolean
  expiresAt?: string
}

const answerOptions = [
  {
    value: 'wil_date' as const,
    label: 'Ik wil een date!',
    emoji: '💕',
    description: 'Tijd om elkaar in het echt te ontmoeten',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    borderColor: 'border-rose-300',
  },
  {
    value: 'meer_chatten' as const,
    label: 'Nog even chatten',
    emoji: '💬',
    description: 'Ik wil je eerst beter leren kennen',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-300',
  },
  {
    value: 'twijfel' as const,
    label: 'Ik twijfel nog',
    emoji: '🤔',
    description: 'Ik weet het nog niet zeker',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    borderColor: 'border-amber-300',
  },
]

export default function VibeCheckPrompt({ matchId, partnerName, onClose }: VibeCheckPromptProps) {
  const [state, setState] = useState<VibeCheckState>({ status: 'none' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Fetch current vibe check status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}/vibe-check`)
      if (res.ok) {
        const data = await res.json()
        setState(data)

        // Show result screen if completed
        if (data.status === 'completed' && data.bothWantDate) {
          setShowResult(true)
          // Trigger confetti!
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ec4899', '#f43f5e', '#fb7185'],
            })
          }, 300)
        }
      }
    } catch (error) {
      console.error('Error fetching vibe check:', error)
    } finally {
      setIsLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Submit answer
  const submitAnswer = async (answer: VibeCheckAnswer) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/matches/${matchId}/vibe-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      })

      if (res.ok) {
        const data = await res.json()
        setState(prev => ({
          ...prev,
          ...data,
          myAnswer: answer,
        }))

        if (data.bothWantDate) {
          setShowResult(true)
          // Trigger confetti!
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 },
              colors: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af'],
            })
          }, 200)
        }
      }
    } catch (error) {
      console.error('Error submitting vibe check:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Start new vibe check
  const startVibeCheck = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/matches/${matchId}/vibe-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (res.ok) {
        const data = await res.json()
        setState(prev => ({
          ...prev,
          id: data.id,
          status: 'pending',
          expiresAt: data.expiresAt,
        }))
      }
    } catch (error) {
      console.error('Error starting vibe check:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    )
  }

  // Result screen - both want a date!
  if (showResult && state.bothWantDate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 text-white text-center relative overflow-hidden"
      >
        {/* Sparkle decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          />
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <PartyPopper className="w-16 h-16 mx-auto mb-4" />

          <h2 className="text-2xl font-bold mb-2">
            It&apos;s a match!
          </h2>

          <p className="text-white/90 mb-6">
            Jullie willen allebei een date! 💕
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-white text-rose-600 font-semibold px-8 py-3 rounded-2xl shadow-lg flex items-center gap-2 mx-auto"
          >
            <Calendar className="w-5 h-5" />
            Plan jullie date
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  // Waiting for partner to answer
  if (state.status === 'waiting' || (state.status === 'pending' && state.myAnswer)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 text-center border border-indigo-100"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center"
        >
          <Sparkles className="w-7 h-7 text-indigo-600" />
        </motion.div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Wachten op {partnerName}...
        </h3>

        <p className="text-slate-600 text-sm mb-4">
          Je hebt geantwoord! Zodra {partnerName} ook antwoordt,
          <br />zie je het resultaat.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-slate-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Vibe Check actief
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600 block mx-auto"
          >
            Sluiten
          </button>
        )}
      </motion.div>
    )
  }

  // Answer the vibe check
  if (state.status === 'pending' && !state.myAnswer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100"
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center"
          >
            <Heart className="w-7 h-7 text-rose-500" />
          </motion.div>

          <h3 className="text-xl font-bold text-slate-800 mb-1">
            Vibe Check!
          </h3>
          <p className="text-slate-500 text-sm">
            Wat is de vibe tussen jou en {partnerName}?
          </p>
        </div>

        <div className="space-y-3">
          {answerOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => submitAnswer(option.value)}
              disabled={isSubmitting}
              className={`w-full p-4 rounded-2xl border-2 ${option.borderColor} ${option.bgColor}
                transition-all flex items-center gap-4 text-left disabled:opacity-50`}
            >
              <span className="text-3xl">{option.emoji}</span>
              <div>
                <span className="font-semibold text-slate-800 block">
                  {option.label}
                </span>
                <span className="text-sm text-slate-500">
                  {option.description}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Je antwoord is anoniem tot jullie allebei hebben geantwoord
        </p>
      </motion.div>
    )
  }

  // Can start a vibe check
  if (state.canCreate && (state.status === 'none' || state.status === 'completed' || state.status === 'expired')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 text-center border border-rose-100"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center cursor-pointer"
          onClick={startVibeCheck}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Tijd voor een Vibe Check?
        </h3>

        <p className="text-slate-600 text-sm mb-4">
          Ontdek wat {partnerName} van jullie connectie vindt!
          <br />
          <span className="text-slate-400">
            Antwoorden blijven anoniem tot jullie allebei klaar zijn.
          </span>
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startVibeCheck}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Start Vibe Check'
          )}
        </motion.button>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600 block mx-auto"
          >
            Later
          </button>
        )}
      </motion.div>
    )
  }

  // Not enough interaction yet
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50 rounded-3xl p-6 text-center border border-slate-200"
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <MessageCircle className="w-7 h-7 text-slate-400" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Vibe Check komt eraan!
      </h3>

      <p className="text-slate-500 text-sm">
        Chat nog even verder met {partnerName}.
        <br />
        Na een paar dagen of berichten kun je een Vibe Check starten!
      </p>

      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 text-sm text-slate-400 hover:text-slate-600"
        >
          Begrepen
        </button>
      )}
    </motion.div>
  )
}
