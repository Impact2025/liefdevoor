/**
 * Custom Hooks Index
 *
 * Central export point for all custom hooks.
 */

// User & Data Hooks
export { useCurrentUser } from './useCurrentUser'
export { useMatches } from './useMatches'
export { useNotifications } from './useNotifications'
export { useDiscoverUsers } from './useDiscoverUsers'

// API Hooks
export { useApi, usePost, usePut, useDelete } from './useApi'

// Utility Hooks
export { useDebounce } from './useDebounce'
export { useLocalStorage } from './useLocalStorage'
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery'
export { useIntersectionObserver, useInfiniteScroll } from './useIntersectionObserver'

// Audio Hooks
export { useAudioRecorder, formatDuration } from './useAudioRecorder'

// PWA & Notifications
export { usePWA } from './usePWA'
export { usePushNotifications } from './usePushNotifications'
export { useAppBadge, AppBadgeManager } from './useAppBadge'
export { useContextualInstall, trackUserAction } from './useContextualInstall'

// Real-time
export { useWebSocket, useTypingIndicator } from './useWebSocket'

// Matching
export { useCompatibility, getCompatibilityColor, getCompatibilityLabel } from './useCompatibility'

// Onboarding
export { useOnboardingGuard, useOnboardingPageGuard } from './useOnboardingGuard'

// Swipe Stack - WERELDKLASSE swipe management
export { useSwipeStack } from './useSwipeStack'
export type { SwipeProfile, SwipeResult, SwipeAction, UseSwipeStackOptions, UseSwipeStackReturn } from './useSwipeStack'
