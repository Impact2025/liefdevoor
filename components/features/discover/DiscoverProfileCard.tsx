/**
 * DiscoverProfileCard - Wereldklasse Tinder-style Profile Card
 *
 * A beautiful, scrollable profile card for the discover screen.
 * Features:
 * - Full-screen hero photo
 * - Smooth scroll to reveal more info
 * - Online status indicator
 * - Swipe gesture support
 * - Premium visual design
 */

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DiscoverProfileCard({
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)

  // Behavior tracking state
  const [viewStartTime] = useState(Date.now())
  const [maxPhotoViewed, setMaxPhotoViewed] = useState(0)
  const [bioExpanded, setBioExpanded] = useState(false)
  const [voiceIntroPlayed, setVoiceIntroPlayed] = useState(false)
  const [maxScrollDepth, setMaxScrollDepth] = useState(0)

  // Motion values for swipe gestures
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const passOpacity = useTransform(x, [-100, 0], [1, 0])
  const superLikeOpacity = useTransform(y, [-100, 0], [1, 0])

  // Reset state when profile changes (critical for Android)
  useEffect(() => {
    // Reset all state for new profile
    setCurrentPhotoIndex(0)
    setIsScrolled(false)
    setSwipeDirection(null)
    setIsPlayingVoice(false)
    // Reset motion values immediately
    x.set(0)
    y.set(0)
    // Stop any playing audio
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      voiceAudioRef.current = null
    }
  }, [profile.id, x, y])

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
      : [`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=f43f5e&color=fff`]

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

  const handleLike = useCallback(() => {
    if (isLoading || swipeDirection) return // Prevent double-triggers
    hapticSuccess() // Haptic feedback for like
    trackSwipe('RIGHT') // Track behavior
    setSwipeDirection('right')
    // Call onLike after animation starts
    setTimeout(() => {
      onLike()
    }, 150)
  }, [isLoading, swipeDirection, onLike, trackSwipe])

  const handlePass = useCallback(() => {
    if (isLoading || swipeDirection) return // Prevent double-triggers
    hapticImpact() // Haptic feedback for pass
    trackSwipe('LEFT') // Track behavior
    setSwipeDirection('left')
    // Call onPass after animation starts
    setTimeout(() => {
      onPass()
    }, 150)
  }, [isLoading, swipeDirection, onPass, trackSwipe])

  const handleSuperLike = useCallback(() => {
    if (isLoading || swipeDirection) return // Prevent double-triggers
    hapticHeavy() // Haptic feedback for super like
    trackSwipe('UP') // Track behavior
    setSwipeDirection('up')
    // Call onSuperLike after animation starts
    setTimeout(() => {
      onSuperLike()
    }, 150)
  }, [isLoading, swipeDirection, onSuperLike, trackSwipe])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Don't process if already swiping
      if (swipeDirection) return

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
        // Animate back to center
        x.set(0)
        y.set(0)
      }
    },
    [swipeDirection, handleLike, handlePass, handleSuperLike, x, y]
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

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        touchAction: 'none', // Critical for Android - prevents browser handling touch
      }}
      drag={!isLoading && !swipeDirection}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      className={`
        relative w-full h-full max-w-lg mx-auto
        bg-white rounded-3xl overflow-hidden shadow-2xl
        cursor-grab active:cursor-grabbing select-none
        ${swipeDirection === 'left' ? 'translate-x-[-150%] rotate-[-30deg] opacity-0' : ''}
        ${swipeDirection === 'right' ? 'translate-x-[150%] rotate-[30deg] opacity-0' : ''}
        ${swipeDirection === 'up' ? 'translate-y-[-150%] opacity-0' : ''}
        transition-all duration-300
      `}
    >
      {/* Swipe Overlays */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 bg-green-500/30 z-20 pointer-events-none flex items-center justify-center"
      >
        <div className="bg-green-500 text-white px-10 py-5 rounded-2xl text-3xl font-black rotate-[-20deg] border-4 border-white shadow-2xl">
          LEUK! 💚
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute inset-0 bg-red-500/30 z-20 pointer-events-none flex items-center justify-center"
      >
        <div className="bg-red-500 text-white px-10 py-5 rounded-2xl text-3xl font-black rotate-[20deg] border-4 border-white shadow-2xl">
          NEE ✕
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: superLikeOpacity }}
        className="absolute inset-0 bg-blue-500/30 z-20 pointer-events-none flex items-center justify-center"
      >
        <div className="bg-blue-500 text-white px-10 py-5 rounded-2xl text-3xl font-black border-4 border-white shadow-2xl">
          SUPER LIKE! ⭐
        </div>
      </motion.div>

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
            {/* Name & Age */}
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold">{profile.name}</h2>
              <span className="text-2xl font-light">{profile.age}</span>
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
          {profile.interests && profile.interests.length > 0 && (
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

      {/* Fixed Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-30" style={{ touchAction: 'manipulation' }}>
        <div className="flex items-center justify-center gap-5">
          {/* Pass Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handlePass()
            }}
            onClick={handlePass}
            disabled={isLoading || !!swipeDirection}
            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center transition-colors disabled:opacity-50 border-2 border-gray-100 touch-manipulation"
            aria-label="Niet interessant"
          >
            <X size={32} className="text-red-500" strokeWidth={3} />
          </motion.button>

          {/* Super Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleSuperLike()
            }}
            onClick={handleSuperLike}
            disabled={isLoading || !!swipeDirection}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl flex items-center justify-center disabled:opacity-50 touch-manipulation"
            aria-label="Super Like"
          >
            <Star size={26} fill="white" className="text-white" />
          </motion.button>

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleLike()
            }}
            onClick={handleLike}
            disabled={isLoading || !!swipeDirection}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 shadow-xl flex items-center justify-center disabled:opacity-50 touch-manipulation"
            aria-label="Leuk!"
          >
            <Heart size={32} fill="white" className="text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default DiscoverProfileCard
