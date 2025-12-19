/**
 * Typing Indicator Component
 * Shows animated dots when someone is typing
 */

'use client'

import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  userName?: string
  className?: string
}

export function TypingIndicator({ userName, className = '' }: TypingIndicatorProps) {
  return (
    <motion.div
      className={`flex items-center gap-2 text-gray-500 text-sm ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                y: [0, -4, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        {userName && (
          <span className="ml-2 text-xs text-gray-500">
            {userName} is aan het typen...
          </span>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Inline typing indicator for chat bubbles
 */
export function TypingBubble({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`inline-flex items-center gap-1 bg-gray-200 rounded-2xl px-4 py-3 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 bg-gray-500 rounded-full"
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}
