/**
 * DiscoverProfileCard - Wereldklasse Tinder-style Profile Card
 *
 * A beautiful, scrollable profile card for the discover screen.
 * Features:
 * - Full-screen hero photo
 * - Smooth scroll to reveal more info
 * - Online status indicator
 * - Swipe gesture support with spring physics
 * - Premium visual design
 * - React.memo for optimal performance
 * - Accessibility: prefers-reduced-motion support
 * - Gesture cancellation hints
 * - Tablet/landscape optimization
 */

'use client'

import React, { useState, useRef, useCallback, useEffect, memo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, useSpring, useReducedMotion, animate } from 'framer-motion'
import Image from 'next/image'
import { logSwipeBehavior } from '@/app/actions/tracking'
import {
  Heart,
  X,
  Star,
  MapPin,
  Camera,
  Briefcase,
  GraduationCap,
  Ruler,
  Wine,
  Cigarette,
  Baby,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Shield,
  Sparkles,
} from 'lucide-react'
import { CompatibilityBadge } from '@/components/ui/CompatibilityBadge'
import { hapticSuccess, hapticImpact, hapticHeavy, hapticSelection } from '@/lib/haptics'

// ============================================================================
// TYPES
// ============================================================================

export interface ProfilePhoto {
  id: string
  url: string
  order: number
}

export interface DiscoverProfile {
  id: string
  name: string
  age: number
  city: string
  distance: number
  photo: string
  photos?: ProfilePhoto[]
  bio?: string
  verified: boolean
  lastActive?: Date | string
  occupation?: string
  education?: string
  height?: number
  drinking?: string
  smoking?: string
  children?: string
  interests?: string[]
  voiceIntro?: string
  // Compatibility data (WERELDKLASSE matching!)
  compatibility?: number
  compatibilityBreakdown?: {
    overall: number
    interests: number
    bio: number
    location: number
    activity: number
    personality: number
    loveLanguage: number
    lifestyle: number
  }
  matchReasons?: string[]
  matchScore?: number
  matchQuality?: 'excellent' | 'good' | 'fair'
}

export interface DiscoverProfileCardProps {
  profile: DiscoverProfile
  onLike: () => void
  onPass: () => void
  onSuperLike: () => void
  onInfo?: () => void
  isLoading?: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getLastActiveText(lastActive: Date | string | undefined): string {
  if (!lastActive) return ''

  const date = typeof lastActive === 'string' ? new Date(lastActive) : lastActive
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 5) return 'Nu online'
  if (diffMins < 60) return `${diffMins} min geleden online`
  if (diffHours < 24) return `${diffHours} uur geleden online`
  if (diffDays < 7) return `${diffDays} dagen geleden online`
  return 'Meer dan een week geleden online'
}

function getOnlineStatus(lastActive: Date | string | undefined): 'online' | 'recent' | 'away' {
  if (!lastActive) return 'away'

  const date = typeof lastActive === 'string' ? new Date(lastActive) : lastActive
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 15) return 'online'
  if (diffHours < 48) return 'recent'
  return 'away'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SWIPE_THRESHOLD = 100
const SWIPE_VELOCITY_THRESHOLD = 500
const HINT_THRESHOLD = 50 // Show "almost" indicator at 50% of swipe threshold

// Spring configuration for natural, Tinder-like feel
const SPRING_CONFIG = {
  stiffness: 400,
  damping: 30,
  mass: 0.8,
}

// Exit animation spring (faster, more decisive)
const EXIT_SPRING_CONFIG = {
  stiffness: 300,
  damping: 25,
  mass: 0.5,
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Memoized component to prevent unnecessary re-renders
// Only re-renders when profile.id, callbacks, or isLoading changes
const DiscoverProfileCardInner = memo(function DiscoverProfileCardInner({
  profile,
  onLike,
  onPass,
  onSuperLike,
  isLoading = false,
}: DiscoverProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)

  // Accessibility: Detect reduced motion preference
  const prefersReducedMotion = useReducedMotion()

  // Swipe lock using ref for more reliable locking (fixes second swipe bug)
  const isSwipingRef = useRef(false)

  // Behavior tracking state
  const [viewStartTime] = useState(Date.now())
  const [maxPhotoViewed, setMaxPhotoViewed] = useState(0)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [voiceIntroPlayed, setVoiceIntroPlayed] = useState(false)
  const [maxScrollDepth, setMaxScrollDepth] = useState(0)

  // Motion values for swipe gestures with spring physics
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring-based values for smooth, natural movement
  const springX = useSpring(x, SPRING_CONFIG)
  const springY = useSpring(y, SPRING_CONFIG)

  // Derived transforms with smooth interpolation
  const rotate = useTransform(springX, [-200, 200], [-15, 15])

  // Dynamic shadow based on tilt (3D effect)
  const shadowX = useTransform(springX, [-200, 200], [20, -20])
  const shadowOpacity = useTransform(
    springX,
    [-200, -50, 0, 50, 200],
    [0.3, 0.15, 0.1, 0.15, 0.3]
  )

  // Swipe indicator opacities with smooth transitions
  const likeOpacity = useTransform(springX, [0, HINT_THRESHOLD, SWIPE_THRESHOLD], [0, 0.3, 1])
  const passOpacity = useTransform(springX, [-SWIPE_THRESHOLD, -HINT_THRESHOLD, 0], [1, 0.3, 0])
  const superLikeOpacity = useTransform(springY, [-SWIPE_THRESHOLD, -HINT_THRESHOLD, 0], [1, 0.3, 0])

  // "Almost there" hint indicators (subtle pulse at 50% threshold)
  const likeHintOpacity = useTransform(springX, [0, HINT_THRESHOLD - 10, HINT_THRESHOLD, SWIPE_THRESHOLD - 10], [0, 0, 0.6, 0])
  const passHintOpacity = useTransform(springX, [-SWIPE_THRESHOLD + 10, -HINT_THRESHOLD, -HINT_THRESHOLD + 10, 0], [0, 0.6, 0, 0])
  const superLikeHintOpacity = useTransform(springY, [-SWIPE_THRESHOLD + 10, -HINT_THRESHOLD, -HINT_THRESHOLD + 10, 0], [0, 0.6, 0, 0])

  // Scale effect during drag (slight shrink for depth)
  const scale = useTransform(
    [springX, springY],
    ([latestX, latestY]: number[]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY)
      return Math.max(0.95, 1 - distance / 1000)
    }
  )

  // Reset state when profile changes - CRITICAL FIX: Remove x,y from deps (they're MotionValues!)
  useEffect(() => {
    console.log('[DiscoverCard] Profile changed, resetting state', { profileId: profile.id })

    // Reset all state for new profile
    setCurrentPhotoIndex(0)
    setIsScrolled(false)
    setSwipeDirection(null)
    setIsPlayingVoice(false)
    setIsExiting(false)

    // Reset swipe lock - CRITICAL for second swipe to work
    isSwipingRef.current = false

    // Reset motion values with spring animation (or instant if reduced motion)
    if (prefersReducedMotion) {
      x.set(0)
      y.set(0)
    } else {
      animate(x, 0, { type: 'spring', ...SPRING_CONFIG })
      animate(y, 0, { type: 'spring', ...SPRING_CONFIG })
    }

    // Stop any playing audio
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      voiceAudioRef.current = null
    }
  }, [profile.id, prefersReducedMotion]) // Only profile.id - MotionValues are refs, not state!

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause()
        voiceAudioRef.current = null
      }
    }
  }, [])

  // Get photos
  const photos = profile.photos?.length
    ? profile.photos.map((p) => p.url)
    : profile.photo
      ? [profile.photo]
      : [`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=C34C60&color=fff`]

  const onlineStatus = getOnlineStatus(profile.lastActive)
  const lastActiveText = getLastActiveText(profile.lastActive)

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    setIsScrolled(target.scrollTop > 50)

    // Track scroll depth for behavior analysis
    const scrollDepth = target.scrollTop / (target.scrollHeight - target.clientHeight)
    setMaxScrollDepth(prev => Math.max(prev, scrollDepth))

    // Bio is considered "expanded" if scrolled past the hero section
    if (target.scrollTop > 300) {
      setBioExpanded(true)
    }
  }, [])

  // Track swipe behavior (non-blocking)
  const trackSwipe = useCallback((direction: 'LEFT' | 'RIGHT' | 'UP') => {
    const viewingDuration = Date.now() - viewStartTime
    logSwipeBehavior({
      targetId: profile.id,
      direction,
      viewingDurationMs: viewingDuration,
      photoViewCount: maxPhotoViewed + 1, // 0-indexed to count
      bioExpanded,
      scrollDepth: maxScrollDepth,
      voiceIntroPlayed,
      platform: typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    }).catch(() => {}) // Silent fail - don't block swipe
  }, [profile.id, viewStartTime, maxPhotoViewed, bioExpanded, maxScrollDepth, voiceIntroPlayed])

  // Animated exit with Framer Motion (consistent, smooth, interruptible)
  const animateExit = useCallback((direction: 'left' | 'right' | 'up', callback: () => void) => {
    setIsExiting(true)
    setSwipeDirection(direction)

    const exitDistance = window.innerWidth * 1.5
    const exitConfig = prefersReducedMotion
      ? { duration: 0.15 }
      : { type: 'spring' as const, ...EXIT_SPRING_CONFIG }

    if (direction === 'left') {
      animate(x, -exitDistance, {
        ...exitConfig,
        onComplete: () => {
          callback()
          isSwipingRef.current = false
        },
      })
    } else if (direction === 'right') {
      animate(x, exitDistance, {
        ...exitConfig,
        onComplete: () => {
          callback()
          isSwipingRef.current = false
        },
      })
    } else {
      animate(y, -window.innerHeight, {
        ...exitConfig,
        onComplete: () => {
          callback()
          isSwipingRef.current = false
        },
      })
    }
  }, [x, y, prefersReducedMotion])

  const handleLike = useCallback(() => {
    // CRITICAL FIX: Use ref-based locking for more reliable double-trigger prevention
    if (isLoading || swipeDirection || isSwipingRef.current || isExiting) {
      console.log('[DiscoverCard] Like blocked', { isLoading, swipeDirection, isSwipingRef: isSwipingRef.current, isExiting })
      return
    }

    console.log('[DiscoverCard] Like triggered', { profileId: profile.id })
    isSwipingRef.current = true // Lock immediately
    hapticSuccess() // Haptic feedback for like
    trackSwipe('RIGHT') // Track behavior

    // Animate exit with Framer Motion
    animateExit('right', onLike)
  }, [isLoading, swipeDirection, isExiting, onLike, trackSwipe, profile.id, animateExit])

  const handlePass = useCallback(() => {
    // CRITICAL FIX: Use ref-based locking for more reliable double-trigger prevention
    if (isLoading || swipeDirection || isSwipingRef.current || isExiting) {
      console.log('[DiscoverCard] Pass blocked', { isLoading, swipeDirection, isSwipingRef: isSwipingRef.current, isExiting })
      return
    }

    console.log('[DiscoverCard] Pass triggered', { profileId: profile.id })
    isSwipingRef.current = true // Lock immediately
    hapticImpact() // Haptic feedback for pass
    trackSwipe('LEFT') // Track behavior

    // Animate exit with Framer Motion
    animateExit('left', onPass)
  }, [isLoading, swipeDirection, isExiting, onPass, trackSwipe, profile.id, animateExit])

  const handleSuperLike = useCallback(() => {
    // CRITICAL FIX: Use ref-based locking for more reliable double-trigger prevention
    if (isLoading || swipeDirection || isSwipingRef.current || isExiting) {
      console.log('[DiscoverCard] SuperLike blocked', { isLoading, swipeDirection, isSwipingRef: isSwipingRef.current, isExiting })
      return
    }

    console.log('[DiscoverCard] SuperLike triggered', { profileId: profile.id })
    isSwipingRef.current = true // Lock immediately
    hapticHeavy() // Haptic feedback for super like
    trackSwipe('UP') // Track behavior

    // Animate exit with Framer Motion
    animateExit('up', onSuperLike)
  }, [isLoading, swipeDirection, isExiting, onSuperLike, trackSwipe, profile.id, animateExit])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // CRITICAL FIX: Check ref-based lock as well
      if (swipeDirection || isSwipingRef.current || isExiting) {
        console.log('[DiscoverCard] DragEnd blocked', { swipeDirection, isSwipingRef: isSwipingRef.current, isExiting })
        return
      }

      const { offset, velocity } = info

      if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD) {
        if (offset.x > 0) {
          handleLike()
        } else {
          handlePass()
        }
      } else if (offset.y < -SWIPE_THRESHOLD || velocity.y < -SWIPE_VELOCITY_THRESHOLD) {
        handleSuperLike()
      } else {
        // Animate back to center with spring physics (natural bounce)
        if (prefersReducedMotion) {
          x.set(0)
          y.set(0)
        } else {
          animate(x, 0, { type: 'spring', ...SPRING_CONFIG })
          animate(y, 0, { type: 'spring', ...SPRING_CONFIG })
        }
      }
    },
    [swipeDirection, isExiting, handleLike, handlePass, handleSuperLike, x, y, prefersReducedMotion]
  )

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      hapticSelection() // Light tap for photo navigation
      const newIndex = currentPhotoIndex + 1
      setCurrentPhotoIndex(newIndex)
      setMaxPhotoViewed(prev => Math.max(prev, newIndex))
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      hapticSelection() // Light tap for photo navigation
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const playVoiceIntro = () => {
    if (!profile.voiceIntro) return

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
    }

    const audio = new Audio(profile.voiceIntro)
    voiceAudioRef.current = audio
    audio.onended = () => setIsPlayingVoice(false)
    audio.onerror = () => setIsPlayingVoice(false)
    audio.play()
    setIsPlayingVoice(true)
    setVoiceIntroPlayed(true) // Track that voice intro was played
  }

  const stopVoiceIntro = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      voiceAudioRef.current.currentTime = 0
    }
    setIsPlayingVoice(false)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // Dynamic box shadow based on tilt
  const boxShadow = useTransform(
    [shadowX, shadowOpacity],
    ([latestShadowX, latestOpacity]: number[]) =>
      `${latestShadowX}px 25px 50px rgba(0, 0, 0, ${latestOpacity})`
  )

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        rotate,
        scale,
        boxShadow: prefersReducedMotion ? '0 25px 50px rgba(0,0,0,0.15)' : boxShadow,
        touchAction: 'none', // Critical for Android - prevents browser handling touch
      }}
      drag={!isLoading && !swipeDirection && !isSwipingRef.current && !isExiting}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      className={`
        relative w-full h-full mx-auto
        bg-white rounded-3xl overflow-hidden
        cursor-grab active:cursor-grabbing select-none
        max-w-lg
        lg:landscape:max-w-md lg:landscape:max-h-[85vh]
        xl:landscape:max-w-lg
      `}
    >
      {/* Swipe Overlays - Full commitment indicators */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 bg-green-500/30 z-20 pointer-events-none flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -20 }}
          animate={{ scale: 1, rotate: -20 }}
          className="bg-green-500 text-white px-10 py-5 rounded-2xl text-3xl font-black border-4 border-white shadow-2xl"
        >
          LEUK!
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute inset-0 bg-red-500/30 z-20 pointer-events-none flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: 20 }}
          animate={{ scale: 1, rotate: 20 }}
          className="bg-red-500 text-white px-10 py-5 rounded-2xl text-3xl font-black border-4 border-white shadow-2xl"
        >
          NEE
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: superLikeOpacity }}
        className="absolute inset-0 bg-blue-500/30 z-20 pointer-events-none flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-10 py-5 rounded-2xl text-3xl font-black border-4 border-white shadow-2xl"
        >
          SUPER LIKE!
        </motion.div>
      </motion.div>

      {/* Gesture Hint Overlays - "Almost there" indicators */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            style={{ opacity: likeHintOpacity }}
            className="absolute inset-0 z-19 pointer-events-none flex items-center justify-end pr-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="bg-green-400/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-lg font-bold border-2 border-white/50"
            >
              Blijf slepen →
            </motion.div>
          </motion.div>

          <motion.div
            style={{ opacity: passHintOpacity }}
            className="absolute inset-0 z-19 pointer-events-none flex items-center justify-start pl-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="bg-red-400/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-lg font-bold border-2 border-white/50"
            >
              ← Blijf slepen
            </motion.div>
          </motion.div>

          <motion.div
            style={{ opacity: superLikeHintOpacity }}
            className="absolute inset-0 z-19 pointer-events-none flex items-start justify-center pt-24"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="bg-blue-400/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-lg font-bold border-2 border-white/50"
            >
              ↑ Blijf slepen
            </motion.div>
          </motion.div>
        </>
      )}

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scroll-smooth snap-y snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch', // Smooth scroll on iOS
          touchAction: 'pan-y', // Allow vertical scroll, but let parent handle horizontal
          overscrollBehaviorY: 'contain', // Prevent pull-to-refresh
          overscrollBehavior: 'contain', // Prevent all overscroll effects
        }}
      >
        {/* Hero Section - Full Screen Photo */}
        <div className="relative h-full min-h-[400px] snap-start">
          {/* Photo with smooth transition */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhotoIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={photos[currentPhotoIndex]}
                  alt={`Foto van ${profile.name}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Photo Navigation Indicators */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-10">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={`
                    flex-1 h-1 rounded-full transition-all duration-300
                    ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'}
                  `}
                />
              ))}
            </div>
          )}

          {/* Photo Navigation Areas */}
          {photos.length > 1 && (
            <div className="absolute inset-0 flex z-5">
              <button
                onClick={prevPhoto}
                disabled={currentPhotoIndex === 0}
                className="flex-1 cursor-pointer focus:outline-none"
                aria-label="Vorige foto"
              />
              <button
                onClick={nextPhoto}
                disabled={currentPhotoIndex === photos.length - 1}
                className="flex-1 cursor-pointer focus:outline-none"
                aria-label="Volgende foto"
              />
            </div>
          )}

          {/* Photo Navigation Arrows */}
          {photos.length > 1 && (
            <>
              {currentPhotoIndex > 0 && (
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors z-10"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {currentPhotoIndex < photos.length - 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors z-10"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </>
          )}

          {/* Top Right Actions */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {profile.voiceIntro && (
              <button
                onClick={isPlayingVoice ? stopVoiceIntro : playVoiceIntro}
                className={`
                  p-3 rounded-full backdrop-blur-sm transition-all
                  ${isPlayingVoice ? 'bg-rose-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'}
                `}
              >
                {isPlayingVoice ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
          </div>

          {/* Verified Badge */}
          {profile.verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold z-10">
              <Shield size={16} />
              Geverifieerd
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* User Info at Bottom - positioned above action buttons */}
          <div className="absolute bottom-24 left-0 right-0 px-6 pb-4 text-white z-10">
            {/* Name & Age + Compatibility Badge */}
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold">{profile.name}</h2>
              <span className="text-2xl font-light">{profile.age}</span>
              {/* WERELDKLASSE: Compatibility Badge */}
              {profile.compatibility && profile.compatibility > 0 && (
                <CompatibilityBadge score={profile.compatibility} size="md" showLabel={false} />
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-white/90 mb-1">
              <MapPin size={16} />
              <span>{profile.city}</span>
              {profile.distance > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">
                  {profile.distance} km
                </span>
              )}
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-2 h-2 rounded-full
                  ${onlineStatus === 'online' ? 'bg-green-400 animate-pulse' : ''}
                  ${onlineStatus === 'recent' ? 'bg-yellow-400' : ''}
                  ${onlineStatus === 'away' ? 'bg-gray-400' : ''}
                `}
              />
              <span className="text-xs text-white/80">{lastActiveText}</span>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="bg-white p-6 space-y-6 snap-start">
          {/* Bio */}
          {profile.bio && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-rose-500" />
                Over {profile.name}
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
            </div>
          )}

          {/* WERELDKLASSE: Waarom jullie matchen */}
          {profile.matchReasons && profile.matchReasons.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Heart size={20} className="text-rose-500" />
                Waarom jullie matchen
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.matchReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Facts */}
          <div className="grid grid-cols-2 gap-3">
            {profile.occupation && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Briefcase size={20} className="text-gray-500" />
                <span className="text-gray-700">{profile.occupation}</span>
              </div>
            )}
            {profile.education && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <GraduationCap size={20} className="text-gray-500" />
                <span className="text-gray-700">{profile.education}</span>
              </div>
            )}
            {profile.height && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Ruler size={20} className="text-gray-500" />
                <span className="text-gray-700">{profile.height} cm</span>
              </div>
            )}
            {profile.drinking && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Wine size={20} className="text-gray-500" />
                <span className="text-gray-700">{profile.drinking}</span>
              </div>
            )}
            {profile.smoking && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Cigarette size={20} className="text-gray-500" />
                <span className="text-gray-700">{profile.smoking}</span>
              </div>
            )}
            {profile.children && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Baby size={20} className="text-gray-500" />
                <span className="text-gray-700">{profile.children}</span>
              </div>
            )}
          </div>

          {/* Interests */}
          {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Interesses</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-medium border border-rose-100"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery Preview */}
          {photos.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Camera size={20} className="text-gray-500" />
                Foto's ({photos.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 6).map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentPhotoIndex(idx)
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`
                      relative aspect-square rounded-xl overflow-hidden
                      ${idx === currentPhotoIndex ? 'ring-2 ring-rose-500 ring-offset-2' : ''}
                    `}
                  >
                    <Image
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spacer for action buttons */}
          <div className="h-24" />
        </div>
      </div>

      {/* Fixed Action Buttons - Premium feel with enhanced animations */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 z-30 safe-area-inset-bottom"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="flex items-center justify-center gap-4 sm:gap-5">
          {/* Pass Button - Enhanced with glow effect */}
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.1, boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handlePass()
            }}
            onClick={handlePass}
            disabled={isLoading || !!swipeDirection || isExiting}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-100 touch-manipulation active:bg-red-50"
            aria-label="Niet interessant"
          >
            <X size={28} className="text-red-500 sm:w-8 sm:h-8" strokeWidth={3} />
          </motion.button>

          {/* Super Like Button - Star with glow */}
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.15, boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)' }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleSuperLike()
            }}
            onClick={handleSuperLike}
            disabled={isLoading || !!swipeDirection || isExiting}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            aria-label="Super Like"
          >
            <Star size={24} fill="white" className="text-white sm:w-6 sm:h-6" />
          </motion.button>

          {/* Like Button - Main action, larger with heart glow */}
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.1, boxShadow: '0 0 25px rgba(244, 63, 94, 0.5)' }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleLike()
            }}
            onClick={handleLike}
            disabled={isLoading || !!swipeDirection || isExiting}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            aria-label="Leuk!"
          >
            <Heart size={28} fill="white" className="text-white sm:w-8 sm:h-8" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
})

// Custom comparison function for memo - only re-render on meaningful changes
function arePropsEqual(prevProps: DiscoverProfileCardProps, nextProps: DiscoverProfileCardProps): boolean {
  // Only re-render if profile ID changes or loading state changes
  // Callbacks are assumed stable (wrapped in useCallback by parent)
  return (
    prevProps.profile.id === nextProps.profile.id &&
    prevProps.isLoading === nextProps.isLoading
  )
}

// Export memoized component with custom comparison
export const DiscoverProfileCard = memo(DiscoverProfileCardInner, arePropsEqual)

export default DiscoverProfileCard
