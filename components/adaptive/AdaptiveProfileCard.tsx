/**
 * Adaptive Profile Card - Wereldklasse Dating Card Component
 *
 * Een prachtige, responsive en toegankelijke profielkaart die zich aanpast
 * aan de gekozen UI mode. Bevat:
 *
 * - Drie visueel verschillende modes (Simple, Standard, Advanced)
 * - Swipe animaties met Framer Motion
 * - Keyboard shortcuts voor power users
 * - Haptic feedback support
 * - Full accessibility (ARIA, focus management)
 * - Photo gallery met touch/click navigation
 *
 * @example
 * ```tsx
 * <AdaptiveProfileCard
 *   profile={userProfile}
 *   onLike={() => handleSwipe(true)}
 *   onPass={() => handleSwipe(false)}
 *   onSuperLike={() => handleSuperLike()}
 * />
 * ```
 */

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  X,
  Star,
  MapPin,
  Info,
  MessageCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Users,
} from 'lucide-react'
import { useAdaptiveUI, ShowWhen, ShowIfPreference } from './AdaptiveUIProvider'
import { KEYBOARD_SHORTCUTS, getAriaLabel, triggerHapticFeedback } from '@/lib/adaptive-ui'

// ============================================================================
// TYPES
// ============================================================================

export interface ProfilePhoto {
  id: string
  url: string
  order: number
}

export interface ProfileData {
  id: string
  name: string
  age: number
  photo: string
  photos?: ProfilePhoto[]
  distance: number
  city: string
  bio: string
  interests: string[]
  verified: boolean
  lastActive?: string
  matchScore?: number
  mutualFriends?: number
}

export interface AdaptiveProfileCardProps {
  profile: ProfileData
  onLike: () => void
  onPass: () => void
  onSuperLike?: () => void
  onUndo?: () => void
  onInfo?: () => void
  isLoading?: boolean
  showUndoButton?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SWIPE_THRESHOLD = 100
const SWIPE_VELOCITY_THRESHOLD = 500

// ============================================================================
// SPRING PHYSICS CONFIGURATIONS (Wereldklasse animaties)
// ============================================================================

const springConfig = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
  mass: 0.8,
}

const gentleSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
}

const snappySpring = {
  type: "spring" as const,
  stiffness: 700,
  damping: 35,
  mass: 0.5,
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: springConfig,
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.2 }
  },
}

const overlayVariants = {
  like: { opacity: 1, scale: 1, transition: gentleSpring },
  pass: { opacity: 1, scale: 1, transition: gentleSpring },
  superLike: { opacity: 1, scale: 1, transition: gentleSpring },
  hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.1, transition: snappySpring },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  variant: 'like' | 'pass' | 'superLike' | 'undo' | 'info' | 'message'
  size: 'sm' | 'md' | 'lg' | 'xl'
  label: string
  shortcut?: string
  showLabel?: boolean
}

function ActionButton({
  onClick,
  disabled,
  variant,
  size,
  label,
  shortcut,
  showLabel,
}: ActionButtonProps) {
  const { preferences } = useAdaptiveUI()

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
  }

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
  }

  const variantStyles = {
    like: {
      bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      hover: 'hover:from-green-600 hover:to-emerald-700',
      shadow: 'shadow-green-500/30',
      icon: <Heart size={iconSizes[size]} fill="white" />,
    },
    pass: {
      bg: 'bg-white border-2 border-red-400',
      hover: 'hover:bg-red-50 hover:border-red-500',
      shadow: 'shadow-red-500/20',
      icon: <X size={iconSizes[size]} className="text-red-500" />,
    },
    superLike: {
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      hover: 'hover:from-blue-600 hover:to-indigo-700',
      shadow: 'shadow-blue-500/30',
      icon: <Star size={iconSizes[size]} fill="white" className="text-white" />,
    },
    undo: {
      bg: 'bg-white border-2 border-amber-400',
      hover: 'hover:bg-amber-50 hover:border-amber-500',
      shadow: 'shadow-amber-500/20',
      icon: <ChevronLeft size={iconSizes[size]} className="text-amber-600" />,
    },
    info: {
      bg: 'bg-white/20 backdrop-blur-sm',
      hover: 'hover:bg-white/30',
      shadow: '',
      icon: <Info size={iconSizes[size]} className="text-white" />,
    },
    message: {
      bg: 'bg-white border-2 border-gray-300',
      hover: 'hover:bg-gray-50 hover:border-gray-400',
      shadow: '',
      icon: <MessageCircle size={iconSizes[size]} className="text-gray-600" />,
    },
  }

  const style = variantStyles[variant]

  const handleClick = () => {
    if (preferences.hapticFeedback) {
      triggerHapticFeedback(variant === 'superLike' ? 'heavy' : 'medium', preferences)
    }
    onClick()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={handleClick}
        disabled={disabled}
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          ${style.bg} ${style.hover} ${style.shadow}
          shadow-lg transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
        `}
        aria-label={label}
      >
        {style.icon}
      </motion.button>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      )}
      {shortcut && !showLabel && (
        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {shortcut}
        </span>
      )}
    </div>
  )
}

interface PhotoGalleryProps {
  photos: string[]
  name: string
  currentIndex: number
  onIndexChange: (index: number) => void
  showIndicators?: boolean
  showArrows?: boolean
}

function PhotoGallery({
  photos,
  name,
  currentIndex,
  onIndexChange,
  showIndicators = true,
  showArrows = false,
}: PhotoGalleryProps) {
  const { preferences } = useAdaptiveUI()
  const photoX = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const handlePhotoDragEnd = useCallback(
    (_: never, info: PanInfo) => {
      const { offset, velocity } = info
      const PHOTO_SWIPE_THRESHOLD = 50
      const PHOTO_VELOCITY_THRESHOLD = 300

      if (Math.abs(offset.x) > PHOTO_SWIPE_THRESHOLD || Math.abs(velocity.x) > PHOTO_VELOCITY_THRESHOLD) {
        if (offset.x < 0 && currentIndex < photos.length - 1) {
          // Swipe left = next photo
          onIndexChange(currentIndex + 1)
        } else if (offset.x > 0 && currentIndex > 0) {
          // Swipe right = previous photo
          onIndexChange(currentIndex - 1)
        }
      }

      // Reset position
      photoX.set(0)
      setIsDragging(false)
    },
    [currentIndex, photos.length, onIndexChange, photoX]
  )

  return (
    <div className="relative w-full h-full overflow-hidden">
      <motion.div
        style={{ x: photoX }}
        drag={photos.length > 1 && !preferences.reducedMotion ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 35,
          power: 0.15,
          timeConstant: 150,
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handlePhotoDragEnd}
        className={`relative w-full h-full ${isDragging ? 'cursor-grabbing' : ''}`}
      >
        <Image
          src={photos[currentIndex]}
          alt={`Foto van ${name}`}
          fill
          className="object-cover select-none"
          priority
          sizes="(max-width: 768px) 100vw, 500px"
          draggable={false}
        />
      </motion.div>

      {/* Photo Navigation Areas (invisible click zones - fallback) */}
      {photos.length > 1 && !isDragging && (
        <div className="absolute inset-0 flex pointer-events-auto">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 cursor-pointer focus:outline-none"
            aria-label="Vorige foto"
          />
          <button
            onClick={handleNext}
            disabled={currentIndex === photos.length - 1}
            className="flex-1 cursor-pointer focus:outline-none"
            aria-label="Volgende foto"
          />
        </div>
      )}

      {/* Arrow buttons (for simple mode) */}
      {showArrows && photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full
              bg-black/40 text-white hover:bg-black/60 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
            aria-label="Vorige foto"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === photos.length - 1}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full
              bg-black/40 text-white hover:bg-black/60 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
            aria-label="Volgende foto"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Photo Indicators */}
      {showIndicators && photos.length > 1 && (
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className={`
                flex-1 h-1 rounded-full transition-all
                ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}
              `}
              aria-label={`Ga naar foto ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdaptiveProfileCard({
  profile,
  onLike,
  onPass,
  onSuperLike,
  onUndo,
  onInfo,
  isLoading = false,
  showUndoButton = false,
}: AdaptiveProfileCardProps) {
  const { mode, preferences, isSimpleMode, isStandardMode, isAdvancedMode, triggerHaptic } = useAdaptiveUI()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showBio, setShowBio] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Motion values for swipe
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const passOpacity = useTransform(x, [-100, 0], [1, 0])
  const superLikeOpacity = useTransform(y, [-100, 0], [1, 0])

  // Get photos
  const photos = profile.photos?.length
    ? profile.photos.map((p) => p.url)
    : [profile.photo]

  // Fallback image
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=random&color=fff`

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    if (!preferences.keyboardShortcuts || isLoading) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const { like, pass, superLike, info } = KEYBOARD_SHORTCUTS.swipe
      const { nextPhoto, prevPhoto } = KEYBOARD_SHORTCUTS.navigation

      if ((like as readonly string[]).includes(e.key)) {
        e.preventDefault()
        handleLike()
      } else if ((pass as readonly string[]).includes(e.key)) {
        e.preventDefault()
        handlePass()
      } else if ((superLike as readonly string[]).includes(e.key) && onSuperLike) {
        e.preventDefault()
        handleSuperLike()
      } else if ((info as readonly string[]).includes(e.key)) {
        e.preventDefault()
        setShowBio((prev) => !prev)
      } else if ((nextPhoto as readonly string[]).includes(e.key)) {
        e.preventDefault()
        if (currentPhotoIndex < photos.length - 1) {
          setCurrentPhotoIndex((prev) => prev + 1)
        }
      } else if ((prevPhoto as readonly string[]).includes(e.key)) {
        e.preventDefault()
        if (currentPhotoIndex > 0) {
          setCurrentPhotoIndex((prev) => prev - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [preferences.keyboardShortcuts, isLoading, currentPhotoIndex, photos.length])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLike = useCallback(() => {
    if (isLoading) return
    setSwipeDirection('right')
    triggerHaptic('medium')
    setTimeout(() => {
      onLike()
      setSwipeDirection(null)
      x.set(0)
      y.set(0)
    }, 300)
  }, [isLoading, onLike, triggerHaptic, x, y])

  const handlePass = useCallback(() => {
    if (isLoading) return
    setSwipeDirection('left')
    triggerHaptic('light')
    setTimeout(() => {
      onPass()
      setSwipeDirection(null)
      x.set(0)
      y.set(0)
    }, 300)
  }, [isLoading, onPass, triggerHaptic, x, y])

  const handleSuperLike = useCallback(() => {
    if (isLoading || !onSuperLike) return
    setSwipeDirection('up')
    triggerHaptic('heavy')
    setTimeout(() => {
      onSuperLike()
      setSwipeDirection(null)
      x.set(0)
      y.set(0)
    }, 300)
  }, [isLoading, onSuperLike, triggerHaptic, x, y])

  const handleDragEnd = useCallback(
    (_: never, info: PanInfo) => {
      if (preferences.reducedMotion) return

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
        // Snap back
        x.set(0)
        y.set(0)
      }
    },
    [preferences.reducedMotion, handleLike, handlePass, handleSuperLike, x, y]
  )

  // ============================================================================
  // RENDER: SIMPLE MODE
  // ============================================================================

  if (isSimpleMode) {
    return (
      <motion.div
        ref={cardRef}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Photo - Extra large with prominent navigation */}
          <div className="relative aspect-[3/4]">
            <PhotoGallery
              photos={photos}
              name={profile.name}
              currentIndex={currentPhotoIndex}
              onIndexChange={setCurrentPhotoIndex}
              showArrows={true}
            />

            {/* Verified Badge - Very Prominent */}
            {profile.verified && (
              <div className="absolute top-16 right-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                <Shield size={20} />
                Echt Profiel
              </div>
            )}

            {/* Gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* User Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-4xl font-bold mb-2">
                {profile.name}, {profile.age}
              </h2>
              <div className="flex items-center gap-2 text-xl">
                <MapPin size={24} />
                <span>{profile.distance} km weg</span>
                <span className="mx-2">•</span>
                <span>{profile.city}</span>
              </div>
            </div>
          </div>

          {/* Content - Extra Clear */}
          <div className="p-6 space-y-6">
            {/* Bio - Always visible */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800">
                <Info size={20} />
                Over {profile.name}
              </h3>
              <p className="text-lg leading-relaxed text-gray-700">
                {profile.bio || 'Geen bio beschikbaar'}
              </p>
            </div>

            {/* Interests */}
            {profile.interests.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Interesses</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-lg font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <p className="text-lg text-blue-900 flex items-start gap-3">
                <Sparkles className="w-6 h-6 flex-shrink-0 mt-1 text-blue-600" />
                <span>
                  <strong>Vind je {profile.name} leuk?</strong>
                  <br />
                  Druk op het groene hart hieronder. Als {profile.name} jou ook leuk vindt, krijg je een match!
                </span>
              </p>
            </div>

            {/* Action Buttons - Extra Large */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handlePass}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-4 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
                aria-label={getAriaLabel('pass', mode)}
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <X size={32} className="text-gray-600" />
                </div>
                <span className="text-xl font-bold text-gray-700">Niet Nu</span>
              </button>

              <button
                onClick={handleLike}
                disabled={isLoading}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-4 border-green-500 bg-green-50 hover:bg-green-100 hover:border-green-600 transition-all disabled:opacity-50"
                aria-label={getAriaLabel('like', mode)}
              >
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <Heart size={32} className="text-white" fill="white" />
                </div>
                <span className="text-xl font-bold text-green-700">Leuk!</span>
              </button>
            </div>

            {/* Super Like - Explained */}
            {onSuperLike && (
              <div className="border-t-2 border-gray-200 pt-4">
                <button
                  onClick={handleSuperLike}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-blue-50 border-2 border-blue-400 hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  <Star size={24} className="text-blue-600" fill="#3b82f6" />
                  <span className="text-lg font-bold text-blue-700">
                    Super Like (toon extra interesse!)
                  </span>
                </button>
                <p className="text-base text-gray-600 text-center mt-2">
                  {profile.name} ziet direct dat je heel erg geïnteresseerd bent
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // ============================================================================
  // RENDER: STANDARD MODE
  // ============================================================================

  if (isStandardMode) {
    return (
      <motion.div
        ref={cardRef}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          x: preferences.reducedMotion ? 0 : x,
          y: preferences.reducedMotion ? 0 : y,
          rotate: preferences.reducedMotion ? 0 : rotate,
        }}
        drag={!preferences.reducedMotion && !isLoading}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        dragTransition={{
          bounceStiffness: 500,
          bounceDamping: 30,
          power: 0.2,
          timeConstant: 200,
        }}
        onDragEnd={handleDragEnd}
        className={`
          w-full max-w-md mx-auto cursor-grab active:cursor-grabbing
          ${swipeDirection === 'left' ? 'translate-x-[-150%] rotate-[-30deg] opacity-0' : ''}
          ${swipeDirection === 'right' ? 'translate-x-[150%] rotate-[30deg] opacity-0' : ''}
          ${swipeDirection === 'up' ? 'translate-y-[-150%] opacity-0' : ''}
          transition-all duration-300
        `}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Swipe Overlays */}
          <AnimatePresence>
            {!preferences.reducedMotion && (
              <>
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute inset-0 bg-green-500/20 z-10 pointer-events-none flex items-center justify-center"
                >
                  <div className="bg-green-500 text-white px-8 py-4 rounded-xl text-2xl font-bold rotate-[-20deg] border-4 border-white">
                    LEUK!
                  </div>
                </motion.div>
                <motion.div
                  style={{ opacity: passOpacity }}
                  className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none flex items-center justify-center"
                >
                  <div className="bg-red-500 text-white px-8 py-4 rounded-xl text-2xl font-bold rotate-[20deg] border-4 border-white">
                    NEE
                  </div>
                </motion.div>
                <motion.div
                  style={{ opacity: superLikeOpacity }}
                  className="absolute inset-0 bg-blue-500/20 z-10 pointer-events-none flex items-center justify-center"
                >
                  <div className="bg-blue-500 text-white px-8 py-4 rounded-xl text-2xl font-bold border-4 border-white">
                    SUPER LIKE!
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Photo */}
          <div className="relative aspect-[3/4]">
            <PhotoGallery
              photos={photos}
              name={profile.name}
              currentIndex={currentPhotoIndex}
              onIndexChange={setCurrentPhotoIndex}
            />

            {/* Verified Badge */}
            {profile.verified && (
              <div className="absolute top-12 right-3 flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                <Shield size={16} />
                Verified
              </div>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {profile.name}, {profile.age}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} />
                    <span>{profile.distance} km • {profile.city}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowBio(!showBio)}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  aria-label="Toon bio"
                  aria-expanded={showBio}
                >
                  <Info size={24} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-5">
                {showUndoButton && onUndo && (
                  <ActionButton
                    onClick={onUndo}
                    disabled={isLoading}
                    variant="undo"
                    size="md"
                    label="Ongedaan maken"
                  />
                )}
                <ActionButton
                  onClick={handlePass}
                  disabled={isLoading}
                  variant="pass"
                  size="lg"
                  label={getAriaLabel('pass', mode)}
                />
                {onSuperLike && (
                  <ActionButton
                    onClick={handleSuperLike}
                    disabled={isLoading}
                    variant="superLike"
                    size="md"
                    label={getAriaLabel('superLike', mode)}
                  />
                )}
                <ActionButton
                  onClick={handleLike}
                  disabled={isLoading}
                  variant="like"
                  size="lg"
                  label={getAriaLabel('like', mode)}
                />
              </div>
            </div>
          </div>

          {/* Expandable Bio */}
          <AnimatePresence>
            {showBio && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-5 space-y-4 border-t border-gray-100">
                  {/* Bio */}
                  <p className="text-gray-700 leading-relaxed">
                    {profile.bio || 'Geen bio beschikbaar'}
                  </p>

                  {/* Interests */}
                  {profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  // ============================================================================
  // RENDER: ADVANCED MODE
  // ============================================================================

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        x: preferences.reducedMotion ? 0 : x,
        y: preferences.reducedMotion ? 0 : y,
        rotate: preferences.reducedMotion ? 0 : rotate,
      }}
      drag={!preferences.reducedMotion && !isLoading}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragTransition={{
        bounceStiffness: 500,
        bounceDamping: 30,
        power: 0.2,
        timeConstant: 200,
      }}
      onDragEnd={handleDragEnd}
      className={`
        w-full max-w-md mx-auto cursor-grab active:cursor-grabbing
        ${swipeDirection === 'left' ? 'translate-x-[-150%] rotate-[-30deg] opacity-0' : ''}
        ${swipeDirection === 'right' ? 'translate-x-[150%] rotate-[30deg] opacity-0' : ''}
        ${swipeDirection === 'up' ? 'translate-y-[-150%] opacity-0' : ''}
        transition-all duration-200
      `}
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Compact Photo */}
        <div className="relative aspect-[4/3]">
          <PhotoGallery
            photos={photos}
            name={profile.name}
            currentIndex={currentPhotoIndex}
            onIndexChange={setCurrentPhotoIndex}
            showIndicators={true}
          />

          {/* Top Badges */}
          <div className="absolute top-2 right-2 flex gap-2">
            {profile.verified && (
              <span className="bg-blue-500 text-white p-1.5 rounded text-xs font-bold">
                <Shield size={14} />
              </span>
            )}
            <button
              onClick={() => onInfo?.() || setShowBio(!showBio)}
              className="bg-black/50 text-white p-1.5 rounded hover:bg-black/70 transition"
              aria-label="Meer info"
            >
              <Info size={14} />
            </button>
          </div>

          {/* Quick Info Pill */}
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm font-semibold">
            {profile.name}, {profile.age} • {profile.distance}km
          </div>

          {/* Match Score (Advanced only) */}
          {profile.matchScore && (
            <div className="absolute bottom-2 right-2 bg-rose-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              {profile.matchScore}% match
            </div>
          )}
        </div>

        {/* Dense Info Layout */}
        <div className="p-4 space-y-3">
          {/* Interests - Compact */}
          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Bio - Truncated */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {profile.bio || 'Geen bio'}
          </p>

          {/* Action Bar - Compact with shortcuts */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex gap-2">
              <div className="group relative">
                <ActionButton
                  onClick={handlePass}
                  disabled={isLoading}
                  variant="pass"
                  size="sm"
                  label="Pass (X)"
                  shortcut="X"
                />
              </div>
              {onSuperLike && (
                <div className="group relative">
                  <ActionButton
                    onClick={handleSuperLike}
                    disabled={isLoading}
                    variant="superLike"
                    size="sm"
                    label="Super Like (S)"
                    shortcut="S"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <ActionButton
                onClick={() => {}}
                disabled={isLoading}
                variant="message"
                size="sm"
                label="Bericht"
              />
              <div className="group relative">
                <ActionButton
                  onClick={handleLike}
                  disabled={isLoading}
                  variant="like"
                  size="sm"
                  label="Like (L)"
                  shortcut="L"
                />
              </div>
            </div>
          </div>

          {/* Stats Bar (Advanced only) */}
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            {profile.lastActive && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {profile.lastActive}
              </span>
            )}
            {profile.matchScore && (
              <span className="text-rose-600 font-semibold">{profile.matchScore}% match</span>
            )}
            {profile.mutualFriends !== undefined && profile.mutualFriends > 0 && (
              <span className="flex items-center gap-1">
                <Users size={12} />
                {profile.mutualFriends} gemeenschappelijk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <ShowIfPreference preference="showHints">
        <div className="mt-3 text-center text-xs text-gray-400">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">L</kbd> Like •{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">X</kbd> Pass •{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">S</kbd> Super Like •{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">I</kbd> Info
        </div>
      </ShowIfPreference>
    </motion.div>
  )
}

export default AdaptiveProfileCard
