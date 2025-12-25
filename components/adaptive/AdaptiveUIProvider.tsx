/**
 * Adaptive UI Provider - Wereldklasse Context System
 *
 * Biedt een adaptief UI systeem dat automatisch of manueel
 * de beste ervaring selecteert voor elke gebruiker.
 *
 * Features:
 * - Auto-detectie van browser/device capabilities
 * - 3 modes: Simple, Standard, Advanced
 * - Persistentie via localStorage
 * - Real-time preference updates
 * - Keyboard shortcuts support
 * - Accessibility-first design
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <AdaptiveUIProvider>
 *   {children}
 * </AdaptiveUIProvider>
 *
 * // In components
 * const { mode, preferences, setMode } = useAdaptiveUI()
 * ```
 */

'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  type UIMode,
  type UIPreferences,
  type AdaptiveUIState,
  type DetectedCapabilities,
  DEFAULT_PREFERENCES,
  MODE_PREFERENCES,
  STORAGE_KEYS,
  detectCapabilities,
  detectOptimalMode,
  mergePreferences,
  triggerHapticFeedback,
  getVisionImpairedPreferences,
  shouldSuggestVisionImpairedMode,
} from '@/lib/adaptive-ui'

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface AdaptiveUIContextType {
  // State
  mode: UIMode
  preferences: UIPreferences
  isAutoDetected: boolean
  hasCompletedOnboarding: boolean
  capabilities: DetectedCapabilities

  // Mode helpers
  isSimpleMode: boolean
  isStandardMode: boolean
  isAdvancedMode: boolean
  isVisionImpairedMode: boolean

  // Actions
  setMode: (mode: UIMode, isManual?: boolean) => void
  updatePreferences: (prefs: Partial<UIPreferences>) => void
  enableVisionImpairedMode: () => void
  disableVisionImpairedMode: () => void
  resetToDefaults: () => void
  completeOnboarding: () => void

  // Utilities
  triggerHaptic: (type?: 'light' | 'medium' | 'heavy') => void
  announceToScreenReader: (message: string) => void
}

// ============================================================================
// CONTEXT
// ============================================================================

const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

interface AdaptiveUIProviderProps {
  children: ReactNode
  defaultMode?: UIMode
  forceMode?: UIMode // For testing/demos
}

export function AdaptiveUIProvider({
  children,
  defaultMode = 'standard',
  forceMode,
}: AdaptiveUIProviderProps) {
  // State
  const [mode, setModeState] = useState<UIMode>(forceMode || defaultMode)
  const [preferences, setPreferences] = useState<UIPreferences>(DEFAULT_PREFERENCES)
  const [isAutoDetected, setIsAutoDetected] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [capabilities, setCapabilities] = useState<DetectedCapabilities>(() => detectCapabilities())
  const [isHydrated, setIsHydrated] = useState(false)

  // Screen reader announcer ref
  const announcerRef = React.useRef<HTMLDivElement>(null)

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Skip if force mode is set
    if (forceMode) {
      setIsHydrated(true)
      return
    }

    // Detect capabilities
    const caps = detectCapabilities()
    setCapabilities(caps)

    // Load saved preferences from localStorage
    try {
      const savedMode = localStorage.getItem(STORAGE_KEYS.mode) as UIMode | null
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.preferences)
      const savedOnboarding = localStorage.getItem(STORAGE_KEYS.hasCompletedOnboarding)
      const savedAutoDetected = localStorage.getItem(STORAGE_KEYS.isAutoDetected)

      if (savedMode && ['simple', 'standard', 'advanced'].includes(savedMode)) {
        setModeState(savedMode)
        setIsAutoDetected(savedAutoDetected === 'true')
      } else {
        // Auto-detect optimal mode for new users
        const optimalMode = detectOptimalMode(caps)
        setModeState(optimalMode)
        setIsAutoDetected(true)
      }

      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(mergePreferences(DEFAULT_PREFERENCES, parsed))
      }

      if (savedOnboarding === 'true') {
        setHasCompletedOnboarding(true)
      }
    } catch (error) {
      console.warn('Failed to load adaptive UI preferences:', error)
    }

    setIsHydrated(true)
  }, [forceMode])

  // ============================================================================
  // CAPABILITY LISTENERS
  // ============================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Listen for media query changes
    const mediaQueries = [
      { query: '(prefers-reduced-motion: reduce)', key: 'prefersReducedMotion' },
      { query: '(prefers-contrast: high)', key: 'prefersHighContrast' },
      { query: '(prefers-color-scheme: dark)', key: 'prefersDarkMode' },
    ]

    const handlers: Array<{ mql: MediaQueryList; handler: () => void }> = []

    mediaQueries.forEach(({ query, key }) => {
      const mql = window.matchMedia(query)
      const handler = () => {
        setCapabilities((prev) => ({
          ...prev,
          [key]: mql.matches,
        }))

        // Auto-update preferences based on system changes
        if (key === 'prefersReducedMotion' && mql.matches) {
          setPreferences((prev) => ({ ...prev, reducedMotion: true }))
        }
        if (key === 'prefersHighContrast' && mql.matches) {
          setPreferences((prev) => ({ ...prev, highContrast: true }))
        }
      }

      mql.addEventListener('change', handler)
      handlers.push({ mql, handler })
    })

    // Resize listener for screen size
    const handleResize = () => {
      setCapabilities((prev) => ({
        ...prev,
        isSmallScreen: window.innerWidth < 640,
        isMediumScreen: window.innerWidth >= 640 && window.innerWidth < 1024,
        isLargeScreen: window.innerWidth >= 1024,
      }))
    }

    window.addEventListener('resize', handleResize)

    return () => {
      handlers.forEach(({ mql, handler }) => {
        mql.removeEventListener('change', handler)
      })
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const setMode = useCallback((newMode: UIMode, isManual = true) => {
    if (forceMode) return // Ignore if force mode is set

    setModeState(newMode)
    setIsAutoDetected(!isManual)

    // Update preferences based on mode
    const modePrefs = MODE_PREFERENCES[newMode]
    setPreferences((prev) => mergePreferences(prev, modePrefs))

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.mode, newMode)
      localStorage.setItem(STORAGE_KEYS.isAutoDetected, String(!isManual))
    } catch (error) {
      console.warn('Failed to save mode:', error)
    }
  }, [forceMode])

  const updatePreferences = useCallback((newPrefs: Partial<UIPreferences>) => {
    setPreferences((prev) => {
      const updated = mergePreferences(prev, newPrefs)

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated))
      } catch (error) {
        console.warn('Failed to save preferences:', error)
      }

      return updated
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    const caps = detectCapabilities()
    const optimalMode = detectOptimalMode(caps)

    setModeState(optimalMode)
    setPreferences(mergePreferences(DEFAULT_PREFERENCES, MODE_PREFERENCES[optimalMode]))
    setIsAutoDetected(true)

    try {
      localStorage.removeItem(STORAGE_KEYS.mode)
      localStorage.removeItem(STORAGE_KEYS.preferences)
      localStorage.removeItem(STORAGE_KEYS.isAutoDetected)
    } catch (error) {
      console.warn('Failed to reset preferences:', error)
    }
  }, [])

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true)
    try {
      localStorage.setItem(STORAGE_KEYS.hasCompletedOnboarding, 'true')
    } catch (error) {
      console.warn('Failed to save onboarding state:', error)
    }
  }, [])

  const enableVisionImpairedMode = useCallback(() => {
    const visionImpairedPrefs = getVisionImpairedPreferences()
    updatePreferences(visionImpairedPrefs)
    announceToScreenReader('Slechtzienden modus ingeschakeld. Extra groot lettertype en hoog contrast zijn nu actief.')
  }, [updatePreferences])

  const disableVisionImpairedMode = useCallback(() => {
    updatePreferences({
      visionImpairedMode: false,
      extraHighContrast: false,
      textToSpeech: false,
    })
    announceToScreenReader('Slechtzienden modus uitgeschakeld.')
  }, [updatePreferences])

  // ============================================================================
  // UTILITIES
  // ============================================================================

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    triggerHapticFeedback(type, preferences)
  }, [preferences])

  const announceToScreenReader = useCallback((message: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])

  // ============================================================================
  // MEMOIZED VALUE
  // ============================================================================

  const value = useMemo<AdaptiveUIContextType>(() => ({
    mode,
    preferences,
    isAutoDetected,
    hasCompletedOnboarding,
    capabilities,
    isSimpleMode: mode === 'simple',
    isStandardMode: mode === 'standard',
    isAdvancedMode: mode === 'advanced',
    isVisionImpairedMode: preferences.visionImpairedMode,
    setMode,
    updatePreferences,
    enableVisionImpairedMode,
    disableVisionImpairedMode,
    resetToDefaults,
    completeOnboarding,
    triggerHaptic,
    announceToScreenReader,
  }), [
    mode,
    preferences,
    isAutoDetected,
    hasCompletedOnboarding,
    capabilities,
    setMode,
    updatePreferences,
    enableVisionImpairedMode,
    disableVisionImpairedMode,
    resetToDefaults,
    completeOnboarding,
    triggerHaptic,
    announceToScreenReader,
  ])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Add CSS custom properties for adaptive styling
  // Only compute after hydration to prevent SSR mismatch
  const cssVariables = useMemo(() => {
    // During SSR, use minimal variables to prevent hydration mismatch
    if (!isHydrated) {
      return {
        '--adaptive-text-scale': '1',
        '--adaptive-target-min': '44px',
        '--adaptive-spacing-scale': '1',
        '--adaptive-animation-duration': '200ms',
        '--adaptive-transition': 'all 200ms ease',
      }
    }

    // After hydration, use full preferences
    const vars: Record<string, string> = {
      '--adaptive-text-scale': preferences.visionImpairedMode ? '1.25' : preferences.largeText ? '1.125' : '1',
      '--adaptive-target-min': preferences.visionImpairedMode ? '56px' : preferences.largeTargets ? '56px' : '44px',
      '--adaptive-spacing-scale': preferences.largeTargets ? '1.25' : '1',
      '--adaptive-animation-duration': preferences.reducedMotion ? '0ms' : '200ms',
      '--adaptive-transition': preferences.reducedMotion ? 'none' : 'all 200ms ease',
      '--adaptive-contrast-mode': preferences.extraHighContrast ? 'aaa' : preferences.highContrast ? 'aa' : 'normal',
    }
    return vars
  }, [preferences, isHydrated])

  return (
    <AdaptiveUIContext.Provider value={value}>
      {/* CSS Variables Container */}
      <div
        style={cssVariables as React.CSSProperties}
        className="contents"
        suppressHydrationWarning
      >
        {/* Screen Reader Announcer */}
        <div
          ref={announcerRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Hydration wrapper to prevent flash */}
        <div className={isHydrated ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity 100ms' }}>
          {children}
        </div>
      </div>
    </AdaptiveUIContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useAdaptiveUI(): AdaptiveUIContextType {
  const context = useContext(AdaptiveUIContext)

  if (!context) {
    throw new Error(
      'useAdaptiveUI must be used within an AdaptiveUIProvider. ' +
      'Wrap your app with <AdaptiveUIProvider> in your root layout.'
    )
  }

  return context
}

// ============================================================================
// CONDITIONAL RENDER COMPONENTS
// ============================================================================

interface AdaptiveProps {
  simple?: ReactNode
  standard?: ReactNode
  advanced?: ReactNode
  children?: ReactNode
}

/**
 * Render different content based on UI mode
 *
 * @example
 * ```tsx
 * <Adaptive
 *   simple={<SimpleBio user={user} />}
 *   standard={<StandardBio user={user} />}
 *   advanced={<AdvancedBio user={user} />}
 * />
 * ```
 */
export function Adaptive({ simple, standard, advanced, children }: AdaptiveProps) {
  const { mode } = useAdaptiveUI()

  switch (mode) {
    case 'simple':
      return <>{simple ?? children}</>
    case 'standard':
      return <>{standard ?? children}</>
    case 'advanced':
      return <>{advanced ?? children}</>
    default:
      return <>{children}</>
  }
}

interface ShowWhenProps {
  mode: UIMode | UIMode[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Conditionally show content based on mode
 *
 * @example
 * ```tsx
 * <ShowWhen mode="simple">
 *   <HelpText>Druk op het groene hart als je iemand leuk vindt</HelpText>
 * </ShowWhen>
 *
 * <ShowWhen mode={['standard', 'advanced']}>
 *   <KeyboardShortcuts />
 * </ShowWhen>
 * ```
 */
export function ShowWhen({ mode: targetMode, children, fallback }: ShowWhenProps) {
  const { mode } = useAdaptiveUI()

  const shouldShow = Array.isArray(targetMode)
    ? targetMode.includes(mode)
    : targetMode === mode

  return shouldShow ? <>{children}</> : <>{fallback}</>
}

interface HideWhenProps {
  mode: UIMode | UIMode[]
  children: ReactNode
}

/**
 * Hide content for specific modes
 *
 * @example
 * ```tsx
 * <HideWhen mode="simple">
 *   <AdvancedFilters />
 * </HideWhen>
 * ```
 */
export function HideWhen({ mode: targetMode, children }: HideWhenProps) {
  const { mode } = useAdaptiveUI()

  const shouldHide = Array.isArray(targetMode)
    ? targetMode.includes(mode)
    : targetMode === mode

  return shouldHide ? null : <>{children}</>
}

// ============================================================================
// PREFERENCE-BASED COMPONENTS
// ============================================================================

interface ShowIfPreferenceProps {
  preference: keyof UIPreferences
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Show content based on user preference
 *
 * @example
 * ```tsx
 * <ShowIfPreference preference="showHints">
 *   <Hint>Swipe right to like someone</Hint>
 * </ShowIfPreference>
 * ```
 */
export function ShowIfPreference({ preference, children, fallback }: ShowIfPreferenceProps) {
  const { preferences } = useAdaptiveUI()

  return preferences[preference] ? <>{children}</> : <>{fallback}</>
}

// ============================================================================
// EXPORTS
// ============================================================================

export { type AdaptiveUIContextType }
