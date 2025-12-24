/**
 * Likes Page - See who liked you
 *
 * Shows a grid of users who have liked your profile.
 * Premium feature: See who liked you before matching.
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Sparkles,
  Star,
  Clock,
  MapPin,
  Shield,
  Lock,
  Crown,
  X,
  Check,
} from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { usePost } from '@/hooks'

interface LikeUser {
  id: string
  name: string
  photo: string | null
  age: number | null
  city: string | null
  bio: string | null
  isVerified: boolean
  lastActive: Date | null
}

interface Like {
  id: string
  likedAt: Date
  isSuperLike: boolean
  user: LikeUser
}

export default function LikesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [likes, setLikes] = useState<Like[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<Like | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  const { post: swipePost, isLoading: isSwipeLoading } = usePost('/api/swipe')

  useEffect(() => {
    if (session?.user) {
      fetchLikes()
      fetchSubscription()
    }
  }, [session])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription')
      const data = await response.json()
      if (response.ok) {
        // PLUS and COMPLETE can see who liked them
        setIsPremium(data.isPlus || data.isComplete)
      }
    } catch (err) {
      console.error('Error fetching subscription:', err)
    }
  }

  const fetchLikes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/likes')
      const data = await response.json()

      if (response.ok) {
        setLikes(data.likes)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Er ging iets mis bij het laden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeBack = async (userId: string) => {
    try {
      await swipePost({ swipedId: userId, isLike: true })
      // Remove from likes list after matching
      setLikes(likes.filter((like) => like.user.id !== userId))
      setSelectedUser(null)
      // Show match notification or redirect to chat
      router.push('/matches')
    } catch (err) {
      console.error('Error liking back:', err)
    }
  }

  const handlePass = async (userId: string) => {
    try {
      await swipePost({ swipedId: userId, isLike: false })
      setLikes(likes.filter((like) => like.user.id !== userId))
      setSelectedUser(null)
    } catch (err) {
      console.error('Error passing:', err)
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Zojuist'
    if (hours < 24) return `${hours} uur geleden`
    if (days === 1) return 'Gisteren'
    if (days < 7) return `${days} dagen geleden`
    return `${Math.floor(days / 7)} weken geleden`
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-4 pb-24">
        <div className="max-w-lg mx-auto px-4">
          <div className="mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-4 pb-24 lg:ml-64 lg:pt-6">
      <div className="max-w-lg mx-auto px-4 lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px]">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-bold text-gray-900">Likes</h1>
            {likes.length > 0 && (
              <span className="bg-rose-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                {likes.length}
              </span>
            )}
          </div>
          <p className="text-gray-600">Mensen die jou leuk vinden</p>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
            <button onClick={fetchLikes} className="underline ml-2">
              Opnieuw proberen
            </button>
          </div>
        ) : likes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Nog geen likes
            </h2>
            <p className="text-gray-600 mb-6">
              Wanneer iemand jouw profiel leuk vindt, zie je ze hier. Blijf
              swipen om meer mensen te ontmoeten!
            </p>
            <Button variant="primary" onClick={() => router.push('/discover')}>
              Ga swipen
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Likes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
              <AnimatePresence mode="popLayout">
                {likes.map((like, index) => (
                  <motion.button
                    key={like.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedUser(like)}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group"
                  >
                    {/* Photo */}
                    <Image
                      src={
                        like.user.photo ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          like.user.name || 'U'
                        )}&size=400&background=f43f5e&color=fff`
                      }
                      alt={like.user.name || 'Gebruiker'}
                      fill
                      className={`object-cover transition-transform group-hover:scale-105 ${
                        !isPremium ? 'blur-lg' : ''
                      }`}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Super Like Badge */}
                    {like.isSuperLike && (
                      <div className="absolute top-3 left-3 bg-blue-500 text-white p-1.5 rounded-full">
                        <Star size={14} fill="white" />
                      </div>
                    )}

                    {/* Verified Badge */}
                    {like.user.isVerified && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white p-1.5 rounded-full">
                        <Shield size={14} />
                      </div>
                    )}

                    {/* User Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-bold text-lg truncate">
                        {isPremium ? like.user.name : '???'}
                        {like.user.age && isPremium && (
                          <span className="font-normal">, {like.user.age}</span>
                        )}
                      </h3>
                      {like.user.city && isPremium && (
                        <div className="flex items-center gap-1 text-sm text-white/80">
                          <MapPin size={12} />
                          <span className="truncate">{like.user.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-white/60 mt-1">
                        <Clock size={10} />
                        <span>{getTimeAgo(like.likedAt)}</span>
                      </div>
                    </div>

                    {/* Premium Lock Overlay */}
                    {!isPremium && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <Lock className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Premium Upsell */}
            {!isPremium && likes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">
                      {likes.length} mensen vinden je leuk!
                    </h3>
                    <p className="text-amber-100 text-sm">
                      Upgrade naar Premium om te zien wie
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/subscription')}
                  fullWidth
                  className="bg-white text-amber-600 hover:bg-amber-50"
                >
                  Bekijk Premium
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title=""
        size="md"
      >
        {selectedUser && (
          <div className="text-center">
            {/* Photo */}
            <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src={
                  selectedUser.user.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedUser.user.name || 'U'
                  )}&size=400&background=f43f5e&color=fff`
                }
                alt={selectedUser.user.name || 'Gebruiker'}
                fill
                className="object-cover"
              />
              {selectedUser.isSuperLike && (
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                  <Star size={20} fill="white" />
                </div>
              )}
            </div>

            {/* Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {selectedUser.user.name}
              {selectedUser.user.age && `, ${selectedUser.user.age}`}
            </h2>

            {selectedUser.user.city && (
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-2">
                <MapPin size={16} />
                <span>{selectedUser.user.city}</span>
              </div>
            )}

            {selectedUser.isSuperLike && (
              <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Star size={14} fill="currentColor" />
                Super Like!
              </div>
            )}

            {selectedUser.user.bio && (
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {selectedUser.user.bio}
              </p>
            )}

            <p className="text-sm text-gray-500 mb-6">
              Liked je {getTimeAgo(selectedUser.likedAt)}
            </p>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePass(selectedUser.user.id)}
                disabled={isSwipeLoading}
                className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 shadow-lg flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X size={28} className="text-gray-500" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLikeBack(selectedUser.user.id)}
                disabled={isSwipeLoading}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl flex items-center justify-center disabled:opacity-50"
              >
                <Heart size={36} fill="white" className="text-white" />
              </motion.button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Like terug voor een match!
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
