/**
 * Stories Carousel - Display stories in discover/home page
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Plus, Play } from 'lucide-react'
import { StoryViewer } from './StoryViewer'

interface Story {
  id: string
  mediaUrl: string
  mediaType: 'PHOTO' | 'VIDEO'
  caption?: string
  createdAt: Date
  expiresAt: Date
  isViewed?: boolean
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

interface MyStory {
  id: string
  mediaUrl: string
  mediaType: 'PHOTO' | 'VIDEO'
  caption?: string
  createdAt: Date
  expiresAt: Date
  viewCount: number
}

interface StoriesCarouselProps {
  onAddStory: () => void
}

export function StoriesCarousel({ onAddStory }: StoriesCarouselProps) {
  const [myStories, setMyStories] = useState<MyStory[]>([])
  const [feed, setFeed] = useState<StoryUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null)
  const [viewingOwnStories, setViewingOwnStories] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories')
      const data = await res.json()
      if (res.ok) {
        setMyStories(data.myStories || [])
        setFeed(data.feed || [])
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewStory = (index: number) => {
    setSelectedUserIndex(index)
  }

  const handleViewOwnStories = () => {
    if (myStories.length > 0) {
      setViewingOwnStories(true)
    } else {
      onAddStory()
    }
  }

  const handleCloseViewer = () => {
    setSelectedUserIndex(null)
    setViewingOwnStories(false)
    fetchStories() // Refresh to update viewed status
  }

  const handleNextUser = () => {
    if (selectedUserIndex !== null && selectedUserIndex < feed.length - 1) {
      setSelectedUserIndex(selectedUserIndex + 1)
    } else {
      handleCloseViewer()
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 p-4 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-12 h-3 bg-gray-200 rounded mt-1 mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  // Don't render if no stories and no add button needed
  if (myStories.length === 0 && feed.length === 0) {
    return null
  }

  return (
    <>
      <div
        ref={scrollRef}
        className="flex gap-3 p-4 overflow-x-auto scrollbar-hide"
      >
        {/* My Story / Add Story */}
        <button
          onClick={handleViewOwnStories}
          className="flex-shrink-0 flex flex-col items-center"
        >
          <div className="relative">
            <div className={`w-16 h-16 rounded-full overflow-hidden ${
              myStories.length > 0
                ? 'ring-2 ring-rose-500 ring-offset-2'
                : 'bg-gray-100'
            }`}>
              {myStories.length > 0 ? (
                <Image
                  src={myStories[0].mediaUrl}
                  alt="Mijn story"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            {myStories.length === 0 && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
            )}
          </div>
          <span className="text-xs text-gray-600 mt-1 truncate max-w-[64px]">
            {myStories.length > 0 ? 'Mijn story' : 'Toevoegen'}
          </span>
        </button>

        {/* Other users' stories */}
        {feed.map((storyUser, index) => (
          <button
            key={storyUser.user.id}
            onClick={() => handleViewStory(index)}
            className="flex-shrink-0 flex flex-col items-center"
          >
            <div className={`w-16 h-16 rounded-full p-0.5 ${
              storyUser.hasUnviewed
                ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                : 'bg-gray-300'
            }`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <Image
                    src={storyUser.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(storyUser.user.name || 'U')}&size=64&background=C34C60&color=fff`}
                    alt={storyUser.user.name || 'Story'}
                    fill
                    className="object-cover"
                  />
                  {storyUser.stories[0]?.mediaType === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={16} className="text-white" fill="white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-600 mt-1 truncate max-w-[64px]">
              {storyUser.user.name?.split(' ')[0] || 'Gebruiker'}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedUserIndex !== null && (
        <StoryViewer
          users={feed}
          initialUserIndex={selectedUserIndex}
          onClose={handleCloseViewer}
          onNextUser={handleNextUser}
        />
      )}

      {/* Own Stories Viewer */}
      {viewingOwnStories && myStories.length > 0 && (
        <StoryViewer
          users={[{
            user: {
              id: 'me',
              name: 'Jij',
              profileImage: null,
            },
            stories: myStories.map(s => ({
              ...s,
              isViewed: true,
            })),
            hasUnviewed: false,
          }]}
          initialUserIndex={0}
          onClose={handleCloseViewer}
          onNextUser={handleCloseViewer}
          isOwnStories
        />
      )}
    </>
  )
}

export default StoriesCarousel
