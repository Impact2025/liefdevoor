/**
 * useSwipeStack Hook - Production-Ready Swipe Management
 *
 * Manages a stack of swipeable profiles with:
 * - Optimistic updates (instant UI response)
 * - Retry logic with exponential backoff
 * - Undo/rewind functionality
 * - Race condition prevention
 * - Keyboard navigation
 * - Preloading next profiles
 *
 * @author Built with 10 years of Tinder experience
 */

'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { hapticSuccess, hapticImpact, hapticHeavy, hapticError, hapticWarning } from '@/lib/haptics'

// ============================================================================
// TYPES
// ============================================================================

export interface SwipeProfile {
  id: string
  name: string
  age: number
  city: string
  photo: string
  photos?: { id?: string; url: string; order?: number }[]
  profileImage?: string
  distance?: number
  bio?: string
  verified?: boolean
  lastActive?: Date | string
  occupation?: string
  interests?: string[]
  voiceIntro?: string
  compatibility?: number
  compatibilityBreakdown?: {
    interests: number
    location: number
    personality?: number
    loveLanguage?: number
  }
  matchReasons?: string[]
  [key: string]: any
}

export interface SwipeResult {
  success: boolean
  isMatch?: boolean
  match?: any
  limits?: {
    swipesRemaining?: number
    superLikesRemaining?: number
  }
  error?: string
  message?: string
}

export interface SwipeAction {
  userId: string
  direction: 'left' | 'right' | 'up'
  isSuperLike: boolean
  timestamp: number
}

export interface SwipeStackState {
  profiles: SwipeProfile[]
  currentIndex: number
  isAnimating: boolean
  animationDirection: 'left' | 'right' | 'up' | null
  swipeHistory: SwipeAction[]
  pendingSwipes: Map<string, SwipeAction>
  failedSwipes: SwipeAction[]
  lastMatch: any | null
}

export interface UseSwipeStackOptions {
  onMatch?: (match: any) => void
  onSwipeLimitReached?: () => void
  onError?: (error: Error) => void
  enableKeyboard?: boolean
  enablePreload?: boolean
  maxRetries?: number
  retryDelayMs?: number
}

export interface UseSwipeStackReturn {
  // Current state
  currentProfile: SwipeProfile | null
  nextProfiles: SwipeProfile[]
  isAnimating: boolean
  animationDirection: 'left' | 'right' | 'up' | null
  isEmpty: boolean
  remainingCount: number

  // Actions
  swipeLeft: () => void
  swipeRight: () => void
  superLike: () => void
  undo: () => Promise<boolean>

  // State setters (for external control)
  setProfiles: (profiles: SwipeProfile[]) => void
  addProfiles: (profiles: SwipeProfile[]) => void

  // Status
  canUndo: boolean
  lastMatch: any | null
  pendingCount: number

  // Animation control
  onAnimationComplete: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_DURATION_MS = 300
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY_MS = 1000
const SWIPE_COOLDOWN_MS = 100 // Minimum time between swipes

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useSwipeStack(
  initialProfiles: SwipeProfile[] = [],
  options: UseSwipeStackOptions = {}
): UseSwipeStackReturn {
  const {
    onMatch,
    onSwipeLimitReached,
    onError,
    enableKeyboard = true,
    enablePreload = true,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  } = options

  // Core state
  const [profiles, setProfilesState] = useState<SwipeProfile[]>(initialProfiles)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | 'up' | null>(null)
  const [swipeHistory, setSwipeHistory] = useState<SwipeAction[]>([])
  const [lastMatch, setLastMatch] = useState<any | null>(null)
  const [pendingSwipes, setPendingSwipes] = useState<Map<string, SwipeAction>>(new Map())

  // Refs for race condition prevention
  const isSwipingRef = useRef(false)
  const lastSwipeTimeRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef<Map<string, number>>(new Map())

  // Computed values
  const currentProfile = profiles[0] || null
  const nextProfiles = profiles.slice(1, 4) // Preview next 3 cards
  const isEmpty = profiles.length === 0
  const remainingCount = profiles.length
  const canUndo = swipeHistory.length > 0
  const pendingCount = pendingSwipes.size

  // ============================================================================
  // API CALL WITH RETRY LOGIC
  // ============================================================================

  const executeSwipeAPI = useCallback(async (
    action: SwipeAction,
    retryCount = 0
  ): Promise<SwipeResult> => {
    try {
      const controller = new AbortController()
      abortControllerRef.current = controller

      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({
          swipedId: action.userId,
          isLike: action.direction === 'right' || action.direction === 'up',
          isSuperLike: action.isSuperLike,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check for swipe/superlike limit - don't retry these
        if (response.status === 403) {
          if (data.error === 'swipe_limit_reached' || data.error === 'superlike_limit_reached') {
            onSwipeLimitReached?.()
            return { success: false, error: data.error, message: data.message }
          }
        }
        throw new Error(data.message || 'Swipe failed')
      }

      return {
        success: true,
        isMatch: data.data?.isMatch || false,
        match: data.data?.match,
        limits: data.data?.limits,
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { success: false, error: 'aborted' }
      }

      // Retry logic with exponential backoff
      if (retryCount < maxRetries) {
        const delay = retryDelayMs * Math.pow(2, retryCount)
        console.warn(`[SwipeStack] Retry ${retryCount + 1}/${maxRetries} in ${delay}ms`)

        await new Promise(resolve => setTimeout(resolve, delay))
        return executeSwipeAPI(action, retryCount + 1)
      }

      console.error('[SwipeStack] Max retries reached:', error)
      onError?.(error as Error)
      return { success: false, error: (error as Error).message }
    }
  }, [maxRetries, retryDelayMs, onSwipeLimitReached, onError])

  // ============================================================================
  // CORE SWIPE FUNCTION
  // ============================================================================

  const executeSwipe = useCallback(async (
    direction: 'left' | 'right' | 'up'
  ) => {
    // Prevent rapid-fire swipes
    const now = Date.now()
    if (now - lastSwipeTimeRef.current < SWIPE_COOLDOWN_MS) {
      console.log('[SwipeStack] Swipe blocked: cooldown')
      return
    }

    // Prevent concurrent swipes
    if (isSwipingRef.current || isAnimating) {
      console.log('[SwipeStack] Swipe blocked: already swiping')
      return
    }

    // Check if we have a profile to swipe
    if (!currentProfile) {
      console.log('[SwipeStack] Swipe blocked: no profile')
      return
    }

    console.log('[SwipeStack] Executing swipe:', { direction, profileId: currentProfile.id })

    // Lock swipe
    isSwipingRef.current = true
    lastSwipeTimeRef.current = now

    // Create swipe action
    const action: SwipeAction = {
      userId: currentProfile.id,
      direction,
      isSuperLike: direction === 'up',
      timestamp: now,
    }

    // Haptic feedback
    if (direction === 'right') {
      hapticSuccess()
    } else if (direction === 'up') {
      hapticHeavy()
    } else {
      hapticImpact()
    }

    // OPTIMISTIC UPDATE: Start animation immediately
    setAnimationDirection(direction)
    setIsAnimating(true)

    // Add to pending swipes
    setPendingSwipes(prev => new Map(prev).set(action.userId, action))

    // Wait for animation to complete before removing from stack
    // The animation duration is controlled by the card component
  }, [currentProfile, isAnimating])

  // ============================================================================
  // ANIMATION COMPLETE HANDLER
  // ============================================================================

  const onAnimationComplete = useCallback(async () => {
    if (!animationDirection || !currentProfile) {
      setIsAnimating(false)
      setAnimationDirection(null)
      isSwipingRef.current = false
      return
    }

    console.log('[SwipeStack] Animation complete, processing swipe')

    const action = pendingSwipes.get(currentProfile.id)
    if (!action) {
      console.warn('[SwipeStack] No pending action found')
      setIsAnimating(false)
      setAnimationDirection(null)
      isSwipingRef.current = false
      return
    }

    // Remove profile from stack IMMEDIATELY (optimistic)
    const swipedProfile = currentProfile
    setProfilesState(prev => prev.slice(1))

    // Add to history for undo
    setSwipeHistory(prev => [...prev, action])

    // Reset animation state
    setIsAnimating(false)
    setAnimationDirection(null)

    // Execute API call in background
    const result = await executeSwipeAPI(action)

    // Remove from pending
    setPendingSwipes(prev => {
      const next = new Map(prev)
      next.delete(action.userId)
      return next
    })

    if (result.success) {
      console.log('[SwipeStack] Swipe successful:', result)

      // Handle match
      if (result.isMatch && result.match) {
        setLastMatch(result.match)
        onMatch?.(result.match)
      }
    } else if (result.error !== 'aborted' && result.error !== 'swipe_limit_reached' && result.error !== 'superlike_limit_reached') {
      // API call failed - add profile back to stack
      console.error('[SwipeStack] Swipe failed, rolling back')
      hapticError()

      // Roll back optimistic update
      setProfilesState(prev => [swipedProfile, ...prev])
      setSwipeHistory(prev => prev.slice(0, -1))
    } else if (result.error === 'superlike_limit_reached') {
      // Super like limit reached - roll back but don't show error (user can still normal swipe)
      console.log('[SwipeStack] Super like limit reached, rolling back')
      hapticWarning()
      setProfilesState(prev => [swipedProfile, ...prev])
      setSwipeHistory(prev => prev.slice(0, -1))
    }

    // Unlock swipe
    isSwipingRef.current = false
  }, [animationDirection, currentProfile, pendingSwipes, executeSwipeAPI, onMatch])

  // ============================================================================
  // SWIPE ACTIONS
  // ============================================================================

  const swipeLeft = useCallback(() => {
    executeSwipe('left')
  }, [executeSwipe])

  const swipeRight = useCallback(() => {
    executeSwipe('right')
  }, [executeSwipe])

  const superLike = useCallback(() => {
    executeSwipe('up')
  }, [executeSwipe])

  // ============================================================================
  // UNDO FUNCTIONALITY
  // ============================================================================

  const undo = useCallback(async (): Promise<boolean> => {
    if (!canUndo) return false

    try {
      const response = await fetch('/api/swipe/rewind', { method: 'POST' })
      const data = await response.json()

      if (response.ok && data.user) {
        // Add user back to top of stack
        setProfilesState(prev => [data.user, ...prev])

        // Remove from history
        setSwipeHistory(prev => prev.slice(0, -1))

        hapticSuccess()
        return true
      } else if (response.status === 403) {
        // Premium feature
        hapticWarning()
        onSwipeLimitReached?.()
        return false
      }

      return false
    } catch (error) {
      console.error('[SwipeStack] Undo failed:', error)
      hapticError()
      return false
    }
  }, [canUndo, onSwipeLimitReached])

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================

  const setProfiles = useCallback((newProfiles: SwipeProfile[]) => {
    setProfilesState(newProfiles)
    // Reset state when profiles change
    setIsAnimating(false)
    setAnimationDirection(null)
    isSwipingRef.current = false
  }, [])

  const addProfiles = useCallback((newProfiles: SwipeProfile[]) => {
    setProfilesState(prev => {
      // Filter out duplicates
      const existingIds = new Set(prev.map(p => p.id))
      const uniqueNew = newProfiles.filter(p => !existingIds.has(p.id))
      return [...prev, ...uniqueNew]
    })
  }, [])

  // ============================================================================
  // KEYBOARD NAVIGATION
  // ============================================================================

  useEffect(() => {
    if (!enableKeyboard) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          swipeLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          swipeRight()
          break
        case 'ArrowUp':
          e.preventDefault()
          superLike()
          break
        case 'ArrowDown':
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey || e.key === 'ArrowDown') {
            e.preventDefault()
            undo()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboard, swipeLeft, swipeRight, superLike, undo])

  // ============================================================================
  // PRELOADING
  // ============================================================================

  useEffect(() => {
    if (!enablePreload) return

    // Preload images for next 3 profiles
    nextProfiles.forEach(profile => {
      const photoUrl = profile.photo || profile.photos?.[0]?.url || profile.profileImage
      if (photoUrl) {
        const img = new Image()
        img.src = photoUrl
      }
    })
  }, [nextProfiles, enablePreload])

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // ============================================================================
  // SYNC WITH EXTERNAL PROFILES
  // ============================================================================

  useEffect(() => {
    if (initialProfiles.length > 0 && profiles.length === 0) {
      setProfilesState(initialProfiles)
    }
  }, [initialProfiles])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Current state
    currentProfile,
    nextProfiles,
    isAnimating,
    animationDirection,
    isEmpty,
    remainingCount,

    // Actions
    swipeLeft,
    swipeRight,
    superLike,
    undo,

    // State setters
    setProfiles,
    addProfiles,

    // Status
    canUndo,
    lastMatch,
    pendingCount,

    // Animation control
    onAnimationComplete,
  }
}

export default useSwipeStack
