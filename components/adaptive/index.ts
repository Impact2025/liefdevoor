/**
 * Adaptive UI System - Public Exports
 *
 * Wereldklasse adaptive UI systeem voor "Liefde Voor Iedereen"
 *
 * @example
 * ```tsx
 * // Import everything you need
 * import {
 *   AdaptiveUIProvider,
 *   useAdaptiveUI,
 *   Adaptive,
 *   ShowWhen,
 *   HideWhen,
 *   ShowIfPreference,
 *   UIModeSelectorModal,
 *   AdaptiveProfileCard,
 * } from '@/components/adaptive'
 *
 * // Wrap your app
 * function App() {
 *   return (
 *     <AdaptiveUIProvider>
 *       <YourApp />
 *     </AdaptiveUIProvider>
 *   )
 * }
 *
 * // Use in components
 * function MyComponent() {
 *   const { mode, setMode, preferences } = useAdaptiveUI()
 *
 *   return (
 *     <Adaptive
 *       simple={<SimpleVersion />}
 *       standard={<StandardVersion />}
 *       advanced={<AdvancedVersion />}
 *     />
 *   )
 * }
 * ```
 */

// Provider & Context
export {
  AdaptiveUIProvider,
  useAdaptiveUI,
  Adaptive,
  ShowWhen,
  HideWhen,
  ShowIfPreference,
  type AdaptiveUIContextType,
} from './AdaptiveUIProvider'

// Modal
export {
  UIModeSelectorModal,
  default as UIModeSelectorModalDefault,
} from './UIModeSelectorModal'

// Profile Card
export {
  AdaptiveProfileCard,
  default as AdaptiveProfileCardDefault,
  type ProfileData,
  type ProfilePhoto,
  type AdaptiveProfileCardProps,
} from './AdaptiveProfileCard'

// Re-export types from lib
export type {
  UIMode,
  UIPreferences,
  AdaptiveUIState,
  DetectedCapabilities,
  ModeConfig,
} from '@/lib/adaptive-ui'

// Re-export constants
export {
  DEFAULT_PREFERENCES,
  MODE_PREFERENCES,
  MODE_CONFIGS,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS,
} from '@/lib/adaptive-ui'

// Re-export utility functions
export {
  detectCapabilities,
  detectOptimalMode,
  mergePreferences,
  getModePreferences,
  getAriaLabel,
  triggerHapticFeedback,
} from '@/lib/adaptive-ui'
