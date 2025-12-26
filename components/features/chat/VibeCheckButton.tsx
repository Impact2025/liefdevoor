'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import VibeCheckPrompt from './VibeCheckPrompt'

interface VibeCheckButtonProps {
  matchId: string
  partnerName: string
  variant?: 'floating' | 'inline' | 'header'
}

export default function VibeCheckButton({
  matchId,
  partnerName,
  variant = 'floating',
}: VibeCheckButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasActiveVibeCheck, setHasActiveVibeCheck] = useState(false)
  const [canCreate, setCanCreate] = useState(false)

  // Check vibe check status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/vibe-check`)
        if (res.ok) {
          const data = await res.json()
          setHasActiveVibeCheck(data.status === 'pending' && !data.myAnswer)
          setCanCreate(data.canCreate || false)
        }
      } catch (error) {
        console.error('Error checking vibe status:', error)
      }
    }

    checkStatus()
    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [matchId])

  // Don't show if can't create and no active vibe check
  if (!canCreate && !hasActiveVibeCheck) {
    return null
  }

  if (variant === 'header') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={`relative p-2 rounded-full transition-colors ${
            hasActiveVibeCheck
              ? 'bg-rose-100 text-rose-600'
              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          {hasActiveVibeCheck && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm"
              >
                <VibeCheckPrompt
                  matchId={matchId}
                  partnerName={partnerName}
                  onClose={() => setIsOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  if (variant === 'inline') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className={`w-full py-3 px-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors ${
            hasActiveVibeCheck
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          {hasActiveVibeCheck ? 'Beantwoord Vibe Check!' : 'Start Vibe Check'}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm"
              >
                <VibeCheckPrompt
                  matchId={matchId}
                  partnerName={partnerName}
                  onClose={() => setIsOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Floating variant (default)
  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          hasActiveVibeCheck
            ? 'bg-gradient-to-r from-rose-500 to-pink-500'
            : 'bg-white border-2 border-rose-200'
        }`}
      >
        <Sparkles className={`w-6 h-6 ${hasActiveVibeCheck ? 'text-white' : 'text-rose-500'}`} />
        {hasActiveVibeCheck && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-rose-500 text-xs font-bold"
          >
            !
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <VibeCheckPrompt
                matchId={matchId}
                partnerName={partnerName}
                onClose={() => setIsOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
