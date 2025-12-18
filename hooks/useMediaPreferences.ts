/**
 * useMediaPreferences Hook
 *
 * Detects and tracks user media preferences like reduced motion,
 * high contrast, dark mode, etc. Automatically updates when
 * system preferences change.
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion, prefersHighContrast, prefersDarkMode } = useMediaPreferences()
 *
 * const animationDuration = prefersReducedMotion ? 0 : 200
 * ```
 */

'use client'

import { useState, useEffect } from 'react'

interface MediaPreferences {
  /** User prefers reduced motion */
  prefersReducedMotion: boolean
  /** User prefers high contrast */
  prefersHighContrast: boolean
  /** User prefers dark color scheme */
  prefersDarkMode: boolean
  /** User prefers more contrast */
  prefersMoreContrast: boolean
  /** User prefers less transparency */
  prefersReducedTransparency: boolean
  /** Device uses coarse pointer (touch) */
  hasCoarsePointer: boolean
  /** Device is a touch device */
  isTouchDevice: boolean
  /** Screen width category */
  screenSize: 'sm' | 'md' | 'lg' | 'xl'
  /** Device pixel ratio for high-DPI displays */
  devicePixelRatio: number
}

const defaultPreferences: MediaPreferences = {
  prefersReducedMotion: false,
  prefersHighContrast: false,
  prefersDarkMode: false,
  prefersMoreContrast: false,
  prefersReducedTransparency: false,
  hasCoarsePointer: false,
  isTouchDevice: false,
  screenSize: 'lg',
  devicePixelRatio: 1,
}

export function useMediaPreferences(): MediaPreferences {
  const [preferences, setPreferences] = useState<MediaPreferences>(defaultPreferences)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Helper to check media query
    const checkMedia = (query: string): boolean => {
      return window.matchMedia(query).matches
    }

    // Get screen size category
    const getScreenSize = (): 'sm' | 'md' | 'lg' | 'xl' => {
      const width = window.innerWidth
      if (width < 640) return 'sm'
      if (width < 1024) return 'md'
      if (width < 1280) return 'lg'
      return 'xl'
    }

    // Initial check
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: checkMedia('(prefers-reduced-motion: reduce)'),
        prefersHighContrast: checkMedia('(prefers-contrast: high)'),
        prefersDarkMode: checkMedia('(prefers-color-scheme: dark)'),
        prefersMoreContrast: checkMedia('(prefers-contrast: more)'),
        prefersReducedTransparency: checkMedia('(prefers-reduced-transparency: reduce)'),
        hasCoarsePointer: checkMedia('(pointer: coarse)'),
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        screenSize: getScreenSize(),
        devicePixelRatio: window.devicePixelRatio || 1,
      })
    }

    updatePreferences()

    // Media queries to watch
    const mediaQueries = [
      '(prefers-reduced-motion: reduce)',
      '(prefers-contrast: high)',
      '(prefers-color-scheme: dark)',
      '(prefers-contrast: more)',
      '(prefers-reduced-transparency: reduce)',
      '(pointer: coarse)',
    ]

    // Create listeners
    const listeners: Array<{ mql: MediaQueryList; handler: () => void }> = []

    mediaQueries.forEach((query) => {
      const mql = window.matchMedia(query)
      const handler = () => updatePreferences()
      mql.addEventListener('change', handler)
      listeners.push({ mql, handler })
    })

    // Resize listener for screen size
    const handleResize = () => updatePreferences()
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      listeners.forEach(({ mql, handler }) => {
        mql.removeEventListener('change', handler)
      })
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return preferences
}

/**
 * useReducedMotion Hook
 *
 * Simple hook to check if user prefers reduced motion.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 *
 * return (
 *   <motion.div animate={{ opacity: 1 }} transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}>
 *     Content
 *   </motion.div>
 * )
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

/**
 * useDarkMode Hook
 *
 * Detects system dark mode preference.
 *
 * @example
 * ```tsx
 * const prefersDarkMode = useDarkMode()
 *
 * return (
 *   <div className={prefersDarkMode ? 'bg-gray-900' : 'bg-white'}>
 *     Content
 *   </div>
 * )
 * ```
 */
export function useDarkMode(): boolean {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    setPrefersDarkMode(mql.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches)
    }

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return prefersDarkMode
}

/**
 * useIsTouchDevice Hook
 *
 * Detects if device is primarily touch-based.
 *
 * @example
 * ```tsx
 * const isTouchDevice = useIsTouchDevice()
 *
 * return (
 *   <button className={isTouchDevice ? 'py-4 px-6' : 'py-2 px-4'}>
 *     Click me
 *   </button>
 * )
 * ```
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkTouch = () => {
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches
      const hasTouchStart = 'ontouchstart' in window
      const hasMaxTouchPoints = navigator.maxTouchPoints > 0

      setIsTouchDevice(hasCoarsePointer || hasTouchStart || hasMaxTouchPoints)
    }

    checkTouch()

    const mql = window.matchMedia('(pointer: coarse)')
    const handler = () => checkTouch()
    mql.addEventListener('change', handler)

    return () => mql.removeEventListener('change', handler)
  }, [])

  return isTouchDevice
}

export default useMediaPreferences
