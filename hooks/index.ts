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

// Real-time
export { useWebSocket, useTypingIndicator } from './useWebSocket'

// Matching
export { useCompatibility, getCompatibilityColor, getCompatibilityLabel } from './useCompatibility'
