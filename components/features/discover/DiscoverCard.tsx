/**
 * DiscoverCard Component
 *
 * Swipeable card showing user profile in discover feed
 */

'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Avatar, Badge, Button, Modal, CompatibilityBadge } from '@/components/ui'
import { usePost } from '@/hooks'
import type { DiscoverUser, SwipeResult } from '@/lib/types'

export interface DiscoverCardProps {
  user: DiscoverUser
  onSwipe?: (userId: string, isLike: boolean) => void
  onMatch?: (match: any) => void
}

export function DiscoverCard({ user, onSwipe, onMatch }: DiscoverCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showBio, setShowBio] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null)

  const { post, isLoading } = usePost<SwipeResult>('/api/swipe', {
    onSuccess: (data) => {
      if (data?.isMatch && data.match) {
        onMatch?.(data.match)
      }
    },
  })

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSwipe = async (isLike: boolean) => {
    if (isLoading || isAnimating) return

    setIsAnimating(true)
    setAnimationDirection(isLike ? 'right' : 'left')

    setTimeout(async () => {
      await post({ swipedId: user.id, isLike })
      onSwipe?.(user.id, isLike)
      setIsAnimating(false)
      setAnimationDirection(null)
    }, 300)
  }

  // Use photos if available, otherwise fall back to profileImage
  // Generate unique fallback based on user ID to ensure variety
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=400&background=random&color=fff`

  const photoUrls = user.photos && user.photos.length > 0
    ? user.photos.map(p => p.url)
    : user.profileImage
      ? [user.profileImage]
      : [fallbackImage]

  const nextPhoto = () => {
    if (currentPhotoIndex < photoUrls.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1)
    }
  }

  const previousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1)
    }
  }

  const currentPhoto = {
    url: imageError ? fallbackImage : (photoUrls[currentPhotoIndex] || photoUrls[0]),
    order: currentPhotoIndex,
  }

  const handleImageError = () => {
    console.log('Image failed to load, using fallback')
    setImageError(true)
  }

  // Voice intro playback functions
  const playVoiceIntro = () => {
    if (!user.voiceIntro) return

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause()
    }

    const audio = new Audio(user.voiceIntro)
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

  return (
    <>
      <div
        className={`
          relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl
          transition-all duration-300
          ${animationDirection === 'left' ? 'translate-x-[-150%] rotate-[-30deg] opacity-0' : ''}
          ${animationDirection === 'right' ? 'translate-x-[150%] rotate-[30deg] opacity-0' : ''}
        `}
      >
        {/* Photo */}
        <div className="relative w-full h-full">
          <Image
            src={currentPhoto.url}
            alt={user.name || 'User photo'}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 500px"
            onError={handleImageError}
            unoptimized={currentPhoto.url.includes('ui-avatars.com')}
          />

          {/* Photo navigation indicators */}
          {photoUrls.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
              {photoUrls.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Photo navigation areas */}
          <div className="absolute inset-0 flex">
            <button
              onClick={previousPhoto}
              className="flex-1 cursor-pointer focus:outline-none"
              disabled={currentPhotoIndex === 0}
              aria-label="Previous photo"
            />
            <button
              onClick={nextPhoto}
              className="flex-1 cursor-pointer focus:outline-none"
              disabled={currentPhotoIndex === photoUrls.length - 1}
              aria-label="Next photo"
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* User info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold">
                    {user.name}, {user.birthDate && calculateAge(user.birthDate)}
                  </h2>
                  {user.compatibility && user.compatibility > 0 && (
                    <CompatibilityBadge score={user.compatibility} size="md" showLabel={false} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {user.city && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {user.city}
                    </span>
                  )}
                  {user.distance && (
                    <Badge variant="default" size="sm">
                      {user.distance}km verwijderd
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {/* Voice intro button - only show if user has voice intro */}
                {user.voiceIntro && (
                  <button
                    onClick={isPlayingVoice ? stopVoiceIntro : playVoiceIntro}
                    className={`p-3 backdrop-blur-sm rounded-full transition-colors ${
                      isPlayingVoice
                        ? 'bg-rose-500 hover:bg-rose-600'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                    aria-label={isPlayingVoice ? 'Stop voice intro' : 'Play voice intro'}
                    title="Stem introductie"
                  >
                    {isPlayingVoice ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    )}
                  </button>
                )}

                {/* Bio button */}
                <button
                  onClick={() => setShowBio(!showBio)}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  aria-label="Show bio"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleSwipe(false)}
                disabled={isLoading || isAnimating}
                className="w-16 h-16 rounded-full shadow-lg"
                aria-label="Pass"
              >
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => handleSwipe(true)}
                disabled={isLoading || isAnimating}
                className="w-20 h-20 rounded-full shadow-xl"
                aria-label="Like"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Modal */}
      <Modal
        isOpen={showBio}
        onClose={() => {
          setShowBio(false)
          stopVoiceIntro() // Stop playing when closing modal
        }}
        title={`Over ${user.name}`}
        size="md"
      >
        <div className="space-y-4">
          {/* Compatibility Score Header */}
          {user.compatibility && user.compatibility > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-800">Match Score</span>
                <CompatibilityBadge score={user.compatibility} size="lg" />
              </div>

              {/* Compatibility Breakdown */}
              {user.compatibilityBreakdown && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                    <span className="text-gray-600">Interesses</span>
                    <span className="font-medium text-gray-800">{user.compatibilityBreakdown.interests}%</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                    <span className="text-gray-600">Locatie</span>
                    <span className="font-medium text-gray-800">{user.compatibilityBreakdown.location}%</span>
                  </div>
                  {user.compatibilityBreakdown.personality && (
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-gray-600">Personality</span>
                      <span className="font-medium text-gray-800">{user.compatibilityBreakdown.personality}%</span>
                    </div>
                  )}
                  {user.compatibilityBreakdown.loveLanguage && (
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-gray-600">Love Language</span>
                      <span className="font-medium text-gray-800">{user.compatibilityBreakdown.loveLanguage}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Match Reasons */}
          {user.matchReasons && user.matchReasons.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Waarom jullie matchen</h3>
              <div className="flex flex-wrap gap-2">
                {user.matchReasons.map((reason, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm border border-rose-100"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Voice intro in modal */}
          {user.voiceIntro && (
            <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-4 rounded-xl border border-rose-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={isPlayingVoice ? stopVoiceIntro : playVoiceIntro}
                  className={`p-3 rounded-full transition-all ${
                    isPlayingVoice
                      ? 'bg-rose-500 text-white shadow-lg scale-105'
                      : 'bg-white text-rose-500 hover:bg-stone-50 shadow'
                  }`}
                >
                  {isPlayingVoice ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <div>
                  <p className="font-medium text-gray-800">🎤 Stem introductie</p>
                  <p className="text-sm text-gray-500">
                    {isPlayingVoice ? 'Aan het afspelen...' : 'Luister naar de stem van ' + user.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bio text */}
          {user.bio ? (
            <p className="text-gray-700">{user.bio}</p>
          ) : (
            <p className="text-gray-500 italic">Geen bio beschikbaar</p>
          )}

          {/* Interests */}
          {user.interests && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Interesses</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.split(',').map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
