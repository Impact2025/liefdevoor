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

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  X,
  Star,
  MapPin,
  ChevronDown,
  Clock,
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
  MoreHorizontal,
  Shield,
  Sparkles,
} from 'lucide-react'

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

  // Motion values for swipe gestures
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const passOpacity = useTransform(x, [-100, 0], [1, 0])
  const superLikeOpacity = useTransform(y, [-100, 0], [1, 0])

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
  }, [])

  const handleLike = useCallback(() => {
    if (isLoading) return
    setSwipeDirection('right')
    setTimeout(() => {
      onLike()
      setSwipeDirection(null)
      x.set(0)
      y.set(0)
    }, 300)
  }, [isLoading, onLike, x, y])

  const handlePass = useCallback(() => {
    if (isLoading) return
    setSwipeDirection('left')
    setTimeout(() => {
      onPass()
      setSwipeDirection(null)
      x.set(0)
      y.set(0)
    }, 300)
  }, [isLoading, onPass, x, y])

  const handleSuperLike = useCallback(() => {
    if (isLoading) return
    setSwipeDirection('up')
    setTimeout(() => {
      onSuperLike()
      setSwipeDirection(null)
      x.set(0)
      y.set(0)
    }, 300)
  }, [isLoading, onSuperLike, x, y])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
        x.set(0)
        y.set(0)
      }
    },
    [handleLike, handlePass, handleSuperLike, x, y]
  )

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
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
  }

  const stopVoiceIntro = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
      voiceAudioRef.current.currentTime = 0
    }
    setIsPlayingVoice(false)
  }

  const scrollToInfo = () => {
    scrollContainerRef.current?.scrollTo({
      top: window.innerHeight * 0.6,
      behavior: 'smooth',
    })
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
      }}
      drag={!isLoading}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className={`
        relative w-full h-[calc(100vh-180px)] max-w-lg mx-auto
        bg-white rounded-3xl overflow-hidden shadow-2xl
        cursor-grab active:cursor-grabbing
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
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Hero Section - Full Screen Photo */}
        <div className="relative h-[85%] min-h-[500px] snap-start">
          {/* Photo */}
          <div className="absolute inset-0">
            <Image
              src={photos[currentPhotoIndex]}
              alt={`Foto van ${profile.name}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 500px"
            />
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

          {/* User Info at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            {/* Name & Age */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-bold">{profile.name}</h2>
              <span className="text-3xl font-light">{profile.age}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <MapPin size={18} />
              <span className="text-lg">{profile.city}</span>
              {profile.distance > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm ml-2">
                  {profile.distance} km
                </span>
              )}
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`
                  w-2.5 h-2.5 rounded-full
                  ${onlineStatus === 'online' ? 'bg-green-400 animate-pulse' : ''}
                  ${onlineStatus === 'recent' ? 'bg-yellow-400' : ''}
                  ${onlineStatus === 'away' ? 'bg-gray-400' : ''}
                `}
              />
              <span className="text-sm text-white/80">{lastActiveText}</span>
            </div>

            {/* Scroll Indicator */}
            <button
              onClick={scrollToInfo}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <ChevronDown size={20} className="animate-bounce" />
              <span className="text-sm font-medium">
                Wil je alles weten over {profile.name}? Scrol verder voor meer info! 👀
              </span>
            </button>
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
      <div
        className={`
          absolute bottom-0 left-0 right-0 p-4
          bg-gradient-to-t from-white via-white/95 to-transparent
          transition-opacity duration-300
          ${isScrolled ? 'opacity-100' : 'opacity-100'}
        `}
      >
        <div className="flex items-center justify-center gap-4">
          {/* Pass Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePass}
            disabled={isLoading}
            className="w-14 h-14 rounded-full bg-white border-2 border-red-400 hover:border-red-500 hover:bg-red-50 shadow-lg flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Niet interessant"
          >
            <X size={28} className="text-red-500" />
          </motion.button>

          {/* Super Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSuperLike}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center disabled:opacity-50"
            aria-label="Super Like"
          >
            <Star size={22} fill="white" className="text-white" />
          </motion.button>

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl flex items-center justify-center disabled:opacity-50"
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
