/**
 * Story Viewer - Full screen story viewing experience
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Pause, Play, Eye, Heart, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Story {
  id: string
  mediaUrl: string
  mediaType: 'PHOTO' | 'VIDEO'
  caption?: string
  createdAt: Date
  expiresAt: Date
  isViewed?: boolean
  viewCount?: number
}

interface StoryUser {
  user: {
    id: string
    name: string
    profileImage: string | null
    isVerified?: boolean
  }
  stories: Story[]
  hasUnviewed: boolean
}

interface StoryViewerProps {
  users: StoryUser[]
  initialUserIndex: number
  onClose: () => void
  onNextUser: () => void
  isOwnStories?: boolean
}

export function StoryViewer({
  users,
  initialUserIndex,
  onClose,
  onNextUser,
  isOwnStories = false,
}: StoryViewerProps) {
  const router = useRouter()
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentUser = users[currentUserIndex]
  const currentStory = currentUser?.stories[currentStoryIndex]
  const STORY_DURATION = currentStory?.mediaType === 'VIDEO' ? 15000 : 5000 // 15s for video, 5s for photo

  // Mark story as viewed
  const markAsViewed = useCallback(async (storyId: string) => {
    if (isOwnStories) return
    try {
      await fetch(`/api/stories/${storyId}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }, [isOwnStories])

  // Progress animation
  useEffect(() => {
    if (!currentStory || isPaused) return

    markAsViewed(currentStory.id)

    const startTime = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        goToNextStory()
      }
    }, 50)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [currentStory, currentStoryIndex, currentUserIndex, isPaused, markAsViewed, STORY_DURATION])

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentStoryIndex, currentUser, currentUserIndex, users.length, onClose])

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1)
      const prevUser = users[currentUserIndex - 1]
      setCurrentStoryIndex(prevUser.stories.length - 1)
      setProgress(0)
    }
  }, [currentStoryIndex, currentUserIndex, users])

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width

    if (x < width / 3) {
      goToPreviousStory()
    } else if (x > (width * 2) / 3) {
      goToNextStory()
    } else {
      setIsPaused(!isPaused)
    }
  }

  const handleLike = async () => {
    // Swipe like on the user
    try {
      await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swipedId: currentUser.user.id,
          isLike: true,
        }),
      })
      // Visual feedback could be added here
      goToNextStory()
    } catch (error) {
      console.error('Error liking:', error)
    }
  }

  const handleMessage = () => {
    // Navigate to chat if matched, otherwise like first
    router.push(`/chat?userId=${currentUser.user.id}`)
    onClose()
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Nu'
    if (hours < 24) return `${hours}u geleden`
    return 'Gisteren'
  }

  if (!currentStory) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
        {currentUser.stories.map((_, index) => (
          <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{
                width: index < currentStoryIndex
                  ? '100%'
                  : index === currentStoryIndex
                  ? `${progress}%`
                  : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            <Image
              src={currentUser.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user.name || 'U')}&size=40&background=C34C60&color=fff`}
              alt={currentUser.user.name || 'User'}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-white font-semibold">{currentUser.user.name}</p>
            <p className="text-white/70 text-sm">{formatTimeAgo(currentStory.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPaused && (
            <button
              onClick={() => setIsPaused(false)}
              className="p-2 rounded-full bg-white/20"
            >
              <Play size={20} className="text-white" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={handleTap}
      >
        {currentStory.mediaType === 'VIDEO' ? (
          <video
            ref={videoRef}
            src={currentStory.mediaUrl}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted={false}
            playsInline
            onPause={() => setIsPaused(true)}
            onPlay={() => setIsPaused(false)}
          />
        ) : (
          <Image
            src={currentStory.mediaUrl}
            alt="Story"
            fill
            className="object-contain"
            priority
          />
        )}
      </div>

      {/* Caption */}
      {currentStory.caption && (
        <div className="absolute bottom-24 left-0 right-0 z-20 px-4">
          <p className="text-white text-center bg-black/30 rounded-xl px-4 py-2">
            {currentStory.caption}
          </p>
        </div>
      )}

      {/* Actions (not for own stories) */}
      {!isOwnStories && (
        <div className="absolute bottom-8 left-0 right-0 z-20 px-4 flex items-center justify-center gap-4">
          <button
            onClick={handleLike}
            className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Heart size={28} className="text-white" />
          </button>
          <button
            onClick={handleMessage}
            className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <MessageCircle size={28} className="text-white" />
          </button>
        </div>
      )}

      {/* View count (for own stories) */}
      {isOwnStories && currentStory.viewCount !== undefined && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-2 text-white">
          <Eye size={20} />
          <span>{currentStory.viewCount} views</span>
        </div>
      )}

      {/* Navigation arrows (desktop) */}
      <button
        onClick={goToPreviousStory}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 z-20"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>
      <button
        onClick={goToNextStory}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 z-20"
      >
        <ChevronRight size={24} className="text-white" />
      </button>
    </motion.div>
  )
}

export default StoryViewer
