/**
 * useHaptics Hook
 *
 * Provides haptic feedback functionality that respects user preferences.
 * Uses the Vibration API where available.
 *
 * @example
 * ```tsx
 * const { trigger, isSupported } = useHaptics()
 *
 * const handleLike = () => {
 *   trigger('success')
 *   // ... rest of like logic
 * }
 * ```
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useAdaptiveUI } from '@/components/adaptive/AdaptiveUIProvider'

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | number[]

interface UseHapticsReturn {
  /** Trigger haptic feedback */
  trigger: (pattern?: HapticPattern) => void
  /** Whether haptics are supported on this device */
  isSupported: boolean
  /** Whether haptics are enabled in user preferences */
  isEnabled: boolean
}

// Predefined vibration patterns (in milliseconds)
const PATTERNS: Record<string, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30, 10, 30],
  success: [10, 50, 20],
  warning: [30, 30, 30],
  error: [50, 100, 50, 100, 50],
  selection: [5],
}

export function useHaptics(): UseHapticsReturn {
  const { preferences } = useAdaptiveUI()

  const isSupported = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return 'vibrate' in navigator
  }, [])

  const isEnabled = useMemo(() => {
    return preferences.hapticFeedback && isSupported
  }, [preferences.hapticFeedback, isSupported])

  const trigger = useCallback(
    (pattern: HapticPattern = 'light') => {
      if (!isEnabled) return

      try {
        const vibrationPattern = Array.isArray(pattern)
          ? pattern
          : PATTERNS[pattern] || PATTERNS.light

        navigator.vibrate(vibrationPattern)
      } catch (error) {
        // Silently fail - haptics are non-critical
        console.debug('Haptic feedback failed:', error)
      }
    },
    [isEnabled]
  )

  return {
    trigger,
    isSupported,
    isEnabled,
  }
}

/**
 * useSwipeHaptics Hook
 *
 * Pre-configured haptic patterns for swipe actions.
 *
 * @example
 * ```tsx
 * const haptics = useSwipeHaptics()
 *
 * const handleLike = () => {
 *   haptics.like()
 *   // ... rest of like logic
 * }
 * ```
 */
interface SwipeHapticsReturn {
  like: () => void
  pass: () => void
  superLike: () => void
  undo: () => void
  match: () => void
  photoChange: () => void
}

export function useSwipeHaptics(): SwipeHapticsReturn {
  const { trigger } = useHaptics()

  return useMemo(
    () => ({
      like: () => trigger('success'),
      pass: () => trigger('light'),
      superLike: () => trigger('heavy'),
      undo: () => trigger('medium'),
      match: () => trigger([50, 100, 50, 100, 100, 200]), // Celebration pattern
      photoChange: () => trigger('selection'),
    }),
    [trigger]
  )
}

/**
 * useButtonHaptics Hook
 *
 * Generic button haptic feedback.
 *
 * @example
 * ```tsx
 * const buttonHaptics = useButtonHaptics()
 *
 * <button onClick={() => { buttonHaptics.tap(); handleClick(); }}>
 *   Click me
 * </button>
 * ```
 */
interface ButtonHapticsReturn {
  tap: () => void
  press: () => void
  longPress: () => void
}

export function useButtonHaptics(): ButtonHapticsReturn {
  const { trigger } = useHaptics()

  return useMemo(
    () => ({
      tap: () => trigger('light'),
      press: () => trigger('medium'),
      longPress: () => trigger('heavy'),
    }),
    [trigger]
  )
}

export default useHaptics
