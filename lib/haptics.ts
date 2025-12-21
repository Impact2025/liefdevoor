/**
 * Haptic Feedback Utilities
 *
 * Provides haptic feedback for different interactions on supported devices
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  warning: [30, 30, 30],
  error: [50, 100, 50],
  selection: 5,
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator
}

/**
 * Trigger haptic feedback with a specific pattern
 */
export function haptic(pattern: HapticPattern = 'medium'): void {
  if (!isHapticSupported()) return

  const vibrationPattern = HAPTIC_PATTERNS[pattern]
  navigator.vibrate(vibrationPattern)
}

/**
 * Trigger light tap feedback (button press)
 */
export function hapticTap(): void {
  haptic('light')
}

/**
 * Trigger medium impact feedback (important action)
 */
export function hapticImpact(): void {
  haptic('medium')
}

/**
 * Trigger heavy impact feedback (significant action)
 */
export function hapticHeavy(): void {
  haptic('heavy')
}

/**
 * Trigger success feedback (match, message sent, etc.)
 */
export function hapticSuccess(): void {
  haptic('success')
}

/**
 * Trigger warning feedback (limit reached, etc.)
 */
export function hapticWarning(): void {
  haptic('warning')
}

/**
 * Trigger error feedback (failed action)
 */
export function hapticError(): void {
  haptic('error')
}

/**
 * Trigger selection feedback (selecting option)
 */
export function hapticSelection(): void {
  haptic('selection')
}

/**
 * Custom hook wrapper for haptic feedback
 */
export function useHaptics() {
  return {
    isSupported: isHapticSupported(),
    tap: hapticTap,
    impact: hapticImpact,
    heavy: hapticHeavy,
    success: hapticSuccess,
    warning: hapticWarning,
    error: hapticError,
    selection: hapticSelection,
    custom: haptic,
  }
}
