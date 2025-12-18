/**
 * Adaptive UI System - Core Types & Constants
 *
 * Wereldklasse adaptive UI systeem voor "Liefde Voor Iedereen"
 * Gebaseerd op Universal Design principles - werkt voor IEDEREEN
 *
 * @author Liefde Voor Iedereen Team
 * @version 2.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type UIMode = 'simple' | 'standard' | 'advanced'

export interface UIPreferences {
  // Visuele voorkeuren
  largeText: boolean
  highContrast: boolean
  reducedMotion: boolean
  largeTargets: boolean

  // Interactie voorkeuren
  audioFeedback: boolean
  hapticFeedback: boolean
  autoReadAloud: boolean
  keyboardShortcuts: boolean

  // Functionaliteit voorkeuren
  showAdvancedFilters: boolean
  showAnalytics: boolean
  showMatchScore: boolean
  quickActions: boolean

  // Hulp voorkeuren
  showHints: boolean
  showTooltips: boolean
  confirmActions: boolean
  simplifiedLanguage: boolean
  stepByStepMode: boolean
}

export interface AdaptiveUIState {
  mode: UIMode
  preferences: UIPreferences
  isAutoDetected: boolean
  hasCompletedOnboarding: boolean
  detectedCapabilities: DetectedCapabilities
}

export interface DetectedCapabilities {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersDarkMode: boolean
  isTouchDevice: boolean
  isSmallScreen: boolean
  isMediumScreen: boolean
  isLargeScreen: boolean
  hasCoarsePointer: boolean
  supportsHaptics: boolean
  connectionType: 'slow' | 'fast' | 'unknown'
}

export interface ModeConfig {
  id: UIMode
  icon: string
  name: string
  tagline: string
  description: string
  benefits: string[]
  audience: string
  color: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_PREFERENCES: UIPreferences = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  largeTargets: false,
  audioFeedback: false,
  hapticFeedback: true,
  autoReadAloud: false,
  keyboardShortcuts: true,
  showAdvancedFilters: false,
  showAnalytics: false,
  showMatchScore: true,
  quickActions: true,
  showHints: true,
  showTooltips: true,
  confirmActions: true,
  simplifiedLanguage: false,
  stepByStepMode: false,
}

export const MODE_PREFERENCES: Record<UIMode, Partial<UIPreferences>> = {
  simple: {
    largeText: true,
    largeTargets: true,
    showHints: true,
    showTooltips: true,
    confirmActions: true,
    simplifiedLanguage: true,
    stepByStepMode: true,
    showAdvancedFilters: false,
    showAnalytics: false,
    keyboardShortcuts: false,
    quickActions: false,
  },
  standard: {
    largeText: false,
    largeTargets: false,
    showHints: true,
    showTooltips: true,
    confirmActions: true,
    simplifiedLanguage: false,
    stepByStepMode: false,
    showAdvancedFilters: false,
    showAnalytics: false,
    keyboardShortcuts: true,
    quickActions: true,
  },
  advanced: {
    largeText: false,
    largeTargets: false,
    showHints: false,
    showTooltips: false,
    confirmActions: false,
    simplifiedLanguage: false,
    stepByStepMode: false,
    showAdvancedFilters: true,
    showAnalytics: true,
    showMatchScore: true,
    keyboardShortcuts: true,
    quickActions: true,
  },
}

export const MODE_CONFIGS: ModeConfig[] = [
  {
    id: 'simple',
    icon: '🎯',
    name: 'Eenvoudig',
    tagline: 'Duidelijk en overzichtelijk',
    description: 'Grote knoppen, stap-voor-stap begeleiding, eenvoudige taal. Perfect voor iedereen die het rustig aan wil doen.',
    benefits: [
      'Extra grote knoppen en tekst',
      'Duidelijke instructies bij elke stap',
      'Bevestigingen bij belangrijke keuzes',
      'Geen verborgen menu\'s of complexiteit',
    ],
    audience: 'Aangeraden voor: nieuwe gebruikers, rustig tempo',
    color: 'emerald',
  },
  {
    id: 'standard',
    icon: '⚡',
    name: 'Standaard',
    tagline: 'Beste van beide werelden',
    description: 'Moderne interface met slimme functies, maar zonder overbodige complexiteit. Voor de meeste mensen perfect.',
    benefits: [
      'Moderne, intuïtieve interface',
      'Balans tussen functionaliteit en eenvoud',
      'Handige snelkoppelingen',
      'Slim ontworpen voor efficiëntie',
    ],
    audience: 'Aangeraden voor: meeste gebruikers',
    color: 'pink',
  },
  {
    id: 'advanced',
    icon: '🚀',
    name: 'Geavanceerd',
    tagline: 'Maximale controle',
    description: 'Alle features en opties direct beschikbaar. Voor ervaren gebruikers die volledige controle willen.',
    benefits: [
      'Geavanceerde filters en zoekopties',
      'Gedetailleerde statistieken en analytics',
      'Keyboard shortcuts en quick actions',
      'Minimale bevestigingen, maximale snelheid',
    ],
    audience: 'Aangeraden voor: power users, tech-savvy',
    color: 'violet',
  },
]

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  swipe: {
    like: ['l', 'ArrowRight'],
    pass: ['x', 'ArrowLeft'],
    superLike: ['s', 'ArrowUp'],
    undo: ['z', 'u'],
    info: ['i', ' '],
  },
  navigation: {
    nextPhoto: ['ArrowRight', 'd'],
    prevPhoto: ['ArrowLeft', 'a'],
    chat: ['c'],
    matches: ['m'],
    profile: ['p'],
    settings: ['Escape'],
  },
  general: {
    help: ['?', 'F1'],
    search: ['/', 'Ctrl+k'],
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function detectCapabilities(): DetectedCapabilities {
  if (typeof window === 'undefined') {
    return {
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersDarkMode: false,
      isTouchDevice: false,
      isSmallScreen: false,
      isMediumScreen: false,
      isLargeScreen: true,
      hasCoarsePointer: false,
      supportsHaptics: false,
      connectionType: 'unknown',
    }
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = window.innerWidth < 640
  const isMediumScreen = window.innerWidth >= 640 && window.innerWidth < 1024
  const isLargeScreen = window.innerWidth >= 1024
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const supportsHaptics = 'vibrate' in navigator

  // Detect connection type
  let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown'
  if ('connection' in navigator) {
    const conn = (navigator as any).connection
    if (conn?.effectiveType) {
      connectionType = ['slow-2g', '2g', '3g'].includes(conn.effectiveType) ? 'slow' : 'fast'
    }
  }

  return {
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
    isTouchDevice,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    hasCoarsePointer,
    supportsHaptics,
    connectionType,
  }
}

export function detectOptimalMode(capabilities: DetectedCapabilities): UIMode {
  let simpleScore = 0

  // Accessibility preferences strongly suggest simple mode
  if (capabilities.prefersReducedMotion) simpleScore += 3
  if (capabilities.prefersHighContrast) simpleScore += 2

  // Touch device with small screen might benefit from simple mode
  if (capabilities.isTouchDevice && capabilities.isSmallScreen) simpleScore += 1

  // Coarse pointer (touch) can benefit from larger targets
  if (capabilities.hasCoarsePointer) simpleScore += 1

  // Slow connection benefits from simpler UI
  if (capabilities.connectionType === 'slow') simpleScore += 1

  // Decision
  if (simpleScore >= 4) return 'simple'
  if (simpleScore <= 1 && capabilities.isLargeScreen) return 'advanced'
  return 'standard'
}

export function mergePreferences(
  base: UIPreferences,
  override: Partial<UIPreferences>
): UIPreferences {
  return { ...base, ...override }
}

export function getModePreferences(mode: UIMode): UIPreferences {
  return mergePreferences(DEFAULT_PREFERENCES, MODE_PREFERENCES[mode])
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  mode: 'lvie-ui-mode',
  preferences: 'lvie-ui-preferences',
  hasCompletedOnboarding: 'lvie-ui-onboarding',
  isAutoDetected: 'lvie-ui-autodetected',
} as const

// ============================================================================
// ACCESSIBILITY HELPERS
// ============================================================================

export function getAriaLabel(action: string, mode: UIMode): string {
  const labels: Record<string, Record<UIMode, string>> = {
    like: {
      simple: 'Ik vind deze persoon leuk. Druk hier om interesse te tonen.',
      standard: 'Like',
      advanced: 'Like (L)',
    },
    pass: {
      simple: 'Niet nu. Druk hier om door te gaan naar de volgende persoon.',
      standard: 'Pass',
      advanced: 'Pass (X)',
    },
    superLike: {
      simple: 'Super Like! Toon dat je heel erg geïnteresseerd bent.',
      standard: 'Super Like',
      advanced: 'Super Like (S)',
    },
  }
  return labels[action]?.[mode] || action
}

export function triggerHapticFeedback(
  type: 'light' | 'medium' | 'heavy' = 'light',
  preferences: UIPreferences
): void {
  if (!preferences.hapticFeedback || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return
  }

  const patterns: Record<string, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 30],
  }

  navigator.vibrate(patterns[type] || patterns.light)
}
