/**
 * SwipeCard Component - Production-Ready Swipeable Card
 *
 * A buttery-smooth 60fps swipeable card optimized for:
 * - iOS Safari, Android Chrome, desktop browsers
 * - Touch gestures with velocity detection
 * - Spring physics animations
 * - Visual feedback overlays (like/pass/superlike)
 * - Accessibility (48x48 touch targets, reduced motion)
 * - Memory efficient (no internal swipe state)
 *
 * This component is "dumb" - all swipe logic is handled by the parent via useSwipeStack
 *
 * @author Built with 10 years of Tinder experience
 */

'use client'

import React, { memo, useState, useRef, useCallback, useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
  animate,
  PanInfo,
  AnimatePresence,
} from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  X,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Shield,
  Sparkles,
  Info,
} from 'lucide-react'
import { CompatibilityBadge } from '@/components/ui/CompatibilityBadge'
import { hapticSelection } from '@/lib/haptics'

// ============================================================================
// TYPES
// ============================================================================

export interface SwipeCardProfile {
  id: string
  name: string
  age: number
  city: string
  distance?: number
  photo: string
  photos?: { id?: string; url: string; order?: number }[]
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
}

export interface SwipeCardProps {
  profile: SwipeCardProfile
  isActive: boolean
  stackIndex: number
  isAnimating: boolean
  animationDirection: 'left' | 'right' | 'up' | null
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onSuperLike: () => void
  onAnimationComplete: () => void
  onInfoClick?: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SWIPE_THRESHOLD = 100
const VELOCITY_THRESHOLD = 500
const HINT_THRESHOLD = 50

const SPRING_CONFIG = {
  stiffness: 400,
  damping: 30,
  mass: 0.8,
}

const EXIT_SPRING = {
  stiffness: 300,
  damping: 25,
  mass: 0.5,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getOnlineStatus(lastActive: Date | string | undefined): 'online' | 'recent' | 'away' {
  if (!lastActive) return 'away'
  const date = typeof lastActive === 'string' ? new Date(lastActive) : lastActive
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMins < 15) return 'online'
  if (diffMins < 2880) return 'recent' // 48 hours
  return 'away'
}

function getLastActiveText(lastActive: Date | string | undefined): string {
  if (!lastActive) return ''
  const date = typeof lastActive === 'string' ? new Date(lastActive) : lastActive
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMins < 5) return 'Nu online'
  if (diffMins < 60) return `${diffMins} min geleden`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} uur geleden`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} dagen geleden`
  return 'Meer dan een week geleden'
}

// ============================================================================
// SWIPE CARD COMPONENT
// ============================================================================

const SwipeCardInner = memo(function SwipeCardInner({
  profile,
  isActive,
  stackIndex,
  isAnimating,
  animationDirection,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onAnimationComplete,
  onInfoClick,
}: SwipeCardProps) {
  // Photo state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)

  // Accessibility
  const prefersReducedMotion = useReducedMotion()

  // Motion values - only used for gesture feedback, not for exit animation
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring-based motion for smooth feel
  const springX = useSpring(x, SPRING_CONFIG)
  const springY = useSpring(y, SPRING_CONFIG)

  // Transforms
  const rotate = useTransform(springX, [-200, 200], [-15, 15])
  const scale = useTransform(
    [springX, springY],
    ([latestX, latestY]: number[]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY)
      return Math.max(0.95, 1 - distance / 1000)
    }
  )

  // Overlay opacities
  const likeOpacity = useTransform(springX, [0, HINT_THRESHOLD, SWIPE_THRESHOLD], [0, 0.3, 1])
  const passOpacity = useTransform(springX, [-SWIPE_THRESHOLD, -HINT_THRESHOLD, 0], [1, 0.3, 0])
  const superLikeOpacity = useTransform(springY, [-SWIPE_THRESHOLD, -HINT_THRESHOLD, 0], [1, 0.3, 0])

  // Photos array
  const photos = profile.photos?.length
    ? profile.photos.map(p => p.url)
    : profile.photo
      ? [profile.photo]
      : [`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=C34C60&color=fff`]

  const onlineStatus = getOnlineStatus(profile.lastActive)
  const lastActiveText = getLastActiveText(profile.lastActive)

  // ============================================================================
  // EXIT ANIMATION EFFECT
  // ============================================================================

  useEffect(() => {
    if (!isAnimating || !animationDirection || !isActive) return

    const exitDistance = window.innerWidth * 1.5

    const exitConfig = prefersReducedMotion
      ? { duration: 0.15 }
      : { type: 'spring' as const, ...EXIT_SPRING }

    if (animationDirection === 'left') {
      animate(x, -exitDistance, {
        ...exitConfig,
        onComplete: onAnimationComplete,
      })
    } else if (animationDirection === 'right') {
      animate(x, exitDistance, {
        ...exitConfig,
        onComplete: onAnimationComplete,
      })
    } else if (animationDirection === 'up') {
      animate(y, -window.innerHeight, {
        ...exitConfig,
        onComplete: onAnimationComplete,
      })
    }
  }, [isAnimating, animationDirection, isActive, x, y, prefersReducedMotion, onAnimationComplete])

  // ============================================================================
  // RESET ON PROFILE CHANGE
  // ============================================================================

  useEffect(() => {
    setCurrentPhotoIndex(0)
    setIsPlayingVoice(false)

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      voiceAudioRef.current = null
    }

    // Reset motion values
    x.set(0)
    y.set(0)
  }, [profile.id, x, y])

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause()
        voiceAudioRef.current = null
      }
    }
  }, [])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!isActive || isAnimating) return

      const { offset, velocity } = info

      // Check if swipe threshold met
      if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD) {
        if (offset.x > 0) {
          onSwipeRight()
        } else {
          onSwipeLeft()
        }
      } else if (offset.y < -SWIPE_THRESHOLD || velocity.y < -VELOCITY_THRESHOLD) {
        onSuperLike()
      } else {
        // Snap back to center
        if (prefersReducedMotion) {
          x.set(0)
          y.set(0)
        } else {
          animate(x, 0, { type: 'spring', ...SPRING_CONFIG })
          animate(y, 0, { type: 'spring', ...SPRING_CONFIG })
        }
      }
    },
    [isActive, isAnimating, onSwipeLeft, onSwipeRight, onSuperLike, x, y, prefersReducedMotion]
  )

  const nextPhoto = useCallback(() => {
    if (currentPhotoIndex < photos.length - 1) {
      hapticSelection()
      setCurrentPhotoIndex(prev => prev + 1)
    }
  }, [currentPhotoIndex, photos.length])

  const prevPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      hapticSelection()
      setCurrentPhotoIndex(prev => prev - 1)
    }
  }, [currentPhotoIndex])

  const toggleVoice = useCallback(() => {
    if (!profile.voiceIntro) return

    if (isPlayingVoice && voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      voiceAudioRef.current.currentTime = 0
      setIsPlayingVoice(false)
    } else {
      const audio = new Audio(profile.voiceIntro)
      voiceAudioRef.current = audio
      audio.onended = () => setIsPlayingVoice(false)
      audio.onerror = () => setIsPlayingVoice(false)
      audio.play()
      setIsPlayingVoice(true)
    }
  }, [profile.voiceIntro, isPlayingVoice])

  // ============================================================================
  // RENDER
  // ============================================================================

  // Stack positioning for non-active cards
  const stackStyle = !isActive ? {
    scale: 1 - stackIndex * 0.02,
    y: stackIndex * 8,
    opacity: 0.6 - stackIndex * 0.2,
  } : {}

  return (
    <motion.div
      style={isActive ? {
        x: springX,
        y: springY,
        rotate,
        scale,
        touchAction: 'none',
      } : stackStyle}
      drag={isActive && !isAnimating}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={isActive ? handleDragEnd : undefined}
      className={`
        absolute inset-0 w-full h-full
        bg-white rounded-3xl overflow-hidden shadow-2xl
        ${isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}
        select-none
      `}
    >
      {/* Swipe Overlays - Only on active card */}
      {isActive && (
        <>
          {/* Like Overlay */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-green-500/30 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="bg-green-500 text-white px-10 py-5 rounded-2xl text-3xl font-black border-4 border-white shadow-2xl -rotate-12">
              LEUK!
            </div>
          </motion.div>

          {/* Pass Overlay */}
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute inset-0 bg-red-500/30 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="bg-red-500 text-white px-10 py-5 rounded-2xl text-3xl font-black border-4 border-white shadow-2xl rotate-12">
              NEE
            </div>
          </motion.div>

          {/* Super Like Overlay */}
          <motion.div
            style={{ opacity: superLikeOpacity }}
            className="absolute inset-0 bg-blue-500/30 z-20 pointer-events-none flex items-center justify-center"
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-10 py-5 rounded-2xl text-3xl font-black border-4 border-white shadow-2xl">
              SUPER LIKE!
            </div>
          </motion.div>
        </>
      )}

      {/* Photo */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhotoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={photos[currentPhotoIndex]}
              alt={`Foto van ${profile.name}`}
              fill
              className="object-cover"
              priority={isActive}
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Photo Indicators */}
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
        {photos.length > 1 && isActive && (
          <div className="absolute inset-0 flex z-5">
            <button
              onClick={prevPhoto}
              disabled={currentPhotoIndex === 0}
              className="flex-1 cursor-pointer focus:outline-none min-w-[48px] min-h-[48px]"
              aria-label="Vorige foto"
            />
            <button
              onClick={nextPhoto}
              disabled={currentPhotoIndex === photos.length - 1}
              className="flex-1 cursor-pointer focus:outline-none min-w-[48px] min-h-[48px]"
              aria-label="Volgende foto"
            />
          </div>
        )}

        {/* Photo Navigation Arrows */}
        {photos.length > 1 && isActive && (
          <>
            {currentPhotoIndex > 0 && (
              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors z-10 min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="Vorige foto"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentPhotoIndex < photos.length - 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors z-10 min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="Volgende foto"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </>
        )}

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {profile.voiceIntro && (
            <button
              onClick={toggleVoice}
              className={`
                p-3 rounded-full backdrop-blur-sm transition-all min-w-[48px] min-h-[48px] flex items-center justify-center
                ${isPlayingVoice ? 'bg-rose-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'}
              `}
              aria-label={isPlayingVoice ? 'Stop stem' : 'Speel stem'}
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

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* User Info */}
        <div className="absolute bottom-24 left-0 right-0 px-6 text-white z-10">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold">{profile.name}</h2>
            <span className="text-2xl font-light">{profile.age}</span>
            {profile.compatibility && profile.compatibility > 0 && (
              <CompatibilityBadge score={profile.compatibility} size="md" showLabel={false} />
            )}
          </div>

          <div className="flex items-center gap-2 text-white/90 mb-1">
            <MapPin size={16} />
            <span>{profile.city}</span>
            {profile.distance !== undefined && profile.distance > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">
                {profile.distance} km
              </span>
            )}
          </div>

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

          {/* Match Reasons */}
          {profile.matchReasons && profile.matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.matchReasons.slice(0, 2).map((reason, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 p-4 z-30 safe-area-inset-bottom"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            {/* Pass Button */}
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={onSwipeLeft}
              disabled={isAnimating}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-100 touch-manipulation active:bg-red-50"
              aria-label="Niet interessant"
            >
              <X size={28} className="text-red-500" strokeWidth={3} />
            </motion.button>

            {/* Super Like Button */}
            <motion.button
              whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={onSuperLike}
              disabled={isAnimating}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              aria-label="Super Like"
            >
              <Star size={24} fill="white" className="text-white" />
            </motion.button>

            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(244, 63, 94, 0.5)' }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={onSwipeRight}
              disabled={isAnimating}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              aria-label="Leuk!"
            >
              <Heart size={28} fill="white" className="text-white" />
            </motion.button>

            {/* Info Button (optional) */}
            {onInfoClick && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onInfoClick}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center touch-manipulation"
                aria-label="Meer info"
              >
                <Info size={20} className="text-white" />
              </motion.button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
})

// ============================================================================
// EXPORT WITH MEMO
// ============================================================================

export const SwipeCard = memo(SwipeCardInner, (prev, next) => {
  // Only re-render when these props change
  return (
    prev.profile.id === next.profile.id &&
    prev.isActive === next.isActive &&
    prev.stackIndex === next.stackIndex &&
    prev.isAnimating === next.isAnimating &&
    prev.animationDirection === next.animationDirection
  )
})

export default SwipeCard
