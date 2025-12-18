/**
 * useAdaptiveKeyboard Hook
 *
 * Keyboard shortcuts handler that respects user preferences.
 * Only activates when keyboard shortcuts are enabled in preferences.
 *
 * @example
 * ```tsx
 * useAdaptiveKeyboard({
 *   'l': () => handleLike(),
 *   'x': () => handlePass(),
 *   's': () => handleSuperLike(),
 * })
 * ```
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useAdaptiveUI } from '@/components/adaptive/AdaptiveUIProvider'

type KeyHandler = (event: KeyboardEvent) => void

interface KeyMap {
  [key: string]: KeyHandler
}

interface UseAdaptiveKeyboardOptions {
  /** Only trigger when no modifier keys are pressed */
  requireNoModifiers?: boolean
  /** Disable keyboard shortcuts entirely */
  disabled?: boolean
  /** Allow shortcuts to fire when focused on input elements */
  allowInInput?: boolean
}

export function useAdaptiveKeyboard(
  keyMap: KeyMap,
  options: UseAdaptiveKeyboardOptions = {}
) {
  const { preferences } = useAdaptiveUI()
  const {
    requireNoModifiers = true,
    disabled = false,
    allowInInput = false,
  } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if keyboard shortcuts are enabled
      if (!preferences.keyboardShortcuts || disabled) {
        return
      }

      // Check if we're in an input field
      if (!allowInInput) {
        const target = event.target as HTMLElement
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        if (isInput) {
          return
        }
      }

      // Check for modifier keys if required
      if (requireNoModifiers) {
        if (event.ctrlKey || event.altKey || event.metaKey) {
          return
        }
      }

      // Find matching handler
      const key = event.key.toLowerCase()
      const handler = keyMap[key] || keyMap[event.key]

      if (handler) {
        handler(event)
      }
    },
    [keyMap, preferences.keyboardShortcuts, disabled, allowInInput, requireNoModifiers]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * useSwipeKeyboard Hook
 *
 * Pre-configured keyboard shortcuts for swipe actions.
 *
 * @example
 * ```tsx
 * useSwipeKeyboard({
 *   onLike: () => handleLike(),
 *   onPass: () => handlePass(),
 *   onSuperLike: () => handleSuperLike(),
 *   onInfo: () => setShowInfo(true),
 * })
 * ```
 */
interface SwipeKeyboardActions {
  onLike?: () => void
  onPass?: () => void
  onSuperLike?: () => void
  onUndo?: () => void
  onInfo?: () => void
  onNextPhoto?: () => void
  onPrevPhoto?: () => void
}

export function useSwipeKeyboard(
  actions: SwipeKeyboardActions,
  disabled = false
) {
  const keyMap: KeyMap = {}

  if (actions.onLike) {
    keyMap['l'] = (e) => {
      e.preventDefault()
      actions.onLike?.()
    }
    keyMap['arrowright'] = (e) => {
      e.preventDefault()
      actions.onLike?.()
    }
  }

  if (actions.onPass) {
    keyMap['x'] = (e) => {
      e.preventDefault()
      actions.onPass?.()
    }
    keyMap['arrowleft'] = (e) => {
      e.preventDefault()
      actions.onPass?.()
    }
  }

  if (actions.onSuperLike) {
    keyMap['s'] = (e) => {
      e.preventDefault()
      actions.onSuperLike?.()
    }
    keyMap['arrowup'] = (e) => {
      e.preventDefault()
      actions.onSuperLike?.()
    }
  }

  if (actions.onUndo) {
    keyMap['z'] = (e) => {
      e.preventDefault()
      actions.onUndo?.()
    }
    keyMap['u'] = (e) => {
      e.preventDefault()
      actions.onUndo?.()
    }
  }

  if (actions.onInfo) {
    keyMap['i'] = (e) => {
      e.preventDefault()
      actions.onInfo?.()
    }
    keyMap[' '] = (e) => {
      e.preventDefault()
      actions.onInfo?.()
    }
  }

  if (actions.onNextPhoto) {
    keyMap['d'] = (e) => {
      e.preventDefault()
      actions.onNextPhoto?.()
    }
  }

  if (actions.onPrevPhoto) {
    keyMap['a'] = (e) => {
      e.preventDefault()
      actions.onPrevPhoto?.()
    }
  }

  useAdaptiveKeyboard(keyMap, { disabled })
}

export default useAdaptiveKeyboard
