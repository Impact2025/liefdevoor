/**
 * De Selectie - Top Picks Page
 *
 * Shows daily curated top picks based on:
 * - Profile quality
 * - Activity level
 * - Compatibility
 * - Distance
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  Clock,
  MapPin,
  Shield,
  Heart,
  X,
  Sparkles,
  Crown,
  MessageCircle,
  ChevronRight,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { usePost, useMatches } from '@/hooks'

interface TopPick {
  id: string
  name: string
  age: number | null
  bio: string | null
  photo: string | null
  photos: { url: string }[]
  city: string | null
  distance: number
  isVerified: boolean
  lastActive: Date
  matchScore: number
  occupation: string | null
}

interface Match {
  id: string
  otherUser: {
    id: string
    name: string | null
    profileImage: string | null
  }
  lastMessage?: {
    content: string | null
    createdAt: Date
  } | null
  unreadCount?: number
}

export default function SelectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topPicks, setTopPicks] = useState<TopPick[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshIn, setRefreshIn] = useState(0)
  const [selectedPick, setSelectedPick] = useState<TopPick | null>(null)
  const [activeTab, setActiveTab] = useState<'picks' | 'matches'>('picks')

  const { matches, isLoading: matchesLoading } = useMatches()
  const { post: swipePost, isLoading: isSwipeLoading } = usePost('/api/swipe')

  useEffect(() => {
    if (session?.user) {
      fetchTopPicks()
    }
  }, [session])

  const fetchTopPicks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/top-picks')
      const data = await response.json()

      if (response.ok) {
        setTopPicks(data.picks)
        setRefreshIn(data.refreshIn)
      }
    } catch (err) {
      console.error('Error fetching top picks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (userId: string) => {
    try {
      const result = await swipePost({ swipedId: userId, isLike: true })
      setTopPicks(topPicks.filter((p) => p.id !== userId))
      setSelectedPick(null)

      // Check if it's a match
      if (result?.isMatch) {
        router.push(`/chat/${result.match.id}`)
      }
    } catch (err) {
      console.error('Error liking:', err)
    }
  }

  const handleSuperLike = async (userId: string) => {
    try {
      const result = await swipePost({ swipedId: userId, isLike: true, isSuperLike: true })
      setTopPicks(topPicks.filter((p) => p.id !== userId))
      setSelectedPick(null)

      if (result?.isMatch) {
        router.push(`/chat/${result.match.id}`)
      }
    } catch (err) {
      console.error('Error super liking:', err)
    }
  }

  const handlePass = async (userId: string) => {
    try {
      await swipePost({ swipedId: userId, isLike: false })
      setTopPicks(topPicks.filter((p) => p.id !== userId))
      setSelectedPick(null)
    } catch (err) {
      console.error('Error passing:', err)
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return 'Nu online'
    if (hours < 24) return `${hours}u geleden`
    return `${Math.floor(hours / 24)}d geleden`
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 pt-4 pb-24">
        <div className="max-w-lg mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 gap-3">
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
    <div className="min-h-screen bg-stone-50 pt-4 pb-24">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-6 h-6 text-amber-500" fill="currentColor" />
            <h1 className="text-2xl font-bold text-gray-900">De Selectie</h1>
          </div>
          <p className="text-gray-600">Speciaal voor jou geselecteerd</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('picks')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'picks'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={18} />
              Top Picks
            </span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'matches'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              Matches
              {matches && matches.length > 0 && (
                <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {matches.length}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Top Picks Tab */}
        {activeTab === 'picks' && (
          <>
            {/* Refresh Timer */}
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <RefreshCw size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Nieuwe picks over</p>
                  <p className="text-sm text-gray-600">{refreshIn} uur</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-600">{topPicks.length}</p>
                <p className="text-xs text-gray-500">picks vandaag</p>
              </div>
            </div>

            {topPicks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                  <Star className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Alle picks bekeken!
                </h2>
                <p className="text-gray-600 mb-6">
                  Je hebt alle top picks van vandaag gezien. Kom morgen terug voor nieuwe matches!
                </p>
                <Button variant="secondary" onClick={() => router.push('/discover')}>
                  Ga swipen
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence mode="popLayout">
                  {topPicks.map((pick, index) => (
                    <motion.button
                      key={pick.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedPick(pick)}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group"
                    >
                      {/* Photo */}
                      <Image
                        src={
                          pick.photo ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            pick.name || 'U'
                          )}&size=400&background=f43f5e&color=fff`
                        }
                        alt={pick.name || 'Gebruiker'}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Top Pick Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                        <Star size={12} fill="white" />
                        TOP PICK
                      </div>

                      {/* Match Score */}
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                        {pick.matchScore}% match
                      </div>

                      {/* Verified Badge */}
                      {pick.isVerified && (
                        <div className="absolute top-12 right-3 bg-blue-500 text-white p-1.5 rounded-full">
                          <Shield size={12} />
                        </div>
                      )}

                      {/* User Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold text-lg truncate">
                          {pick.name}
                          {pick.age && <span className="font-normal">, {pick.age}</span>}
                        </h3>
                        {pick.occupation && (
                          <p className="text-sm text-white/80 truncate">{pick.occupation}</p>
                        )}
                        {pick.city && (
                          <div className="flex items-center gap-1 text-xs text-white/70 mt-1">
                            <MapPin size={10} />
                            <span>{pick.city}</span>
                            {pick.distance > 0 && <span>• {pick.distance} km</span>}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <>
            {matchesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !matches || matches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Nog geen matches
                </h2>
                <p className="text-gray-600 mb-6">
                  Wanneer jullie allebei like geven, verschijnt de match hier!
                </p>
                <Button variant="primary" onClick={() => router.push('/discover')}>
                  Start met swipen
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {matches.map((match: Match, index: number) => (
                  <motion.button
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/chat/${match.id}`)}
                    className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          match.otherUser.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            match.otherUser.name || 'U'
                          )}&size=100&background=f43f5e&color=fff`
                        }
                        alt={match.otherUser.name || 'Match'}
                        fill
                        className="object-cover"
                      />
                      {(match.unreadCount ?? 0) > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {match.unreadCount}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {match.otherUser.name}
                      </h3>
                      {match.lastMessage ? (
                        <p className="text-sm text-gray-500 truncate">
                          {match.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-rose-500 font-medium">
                          Stuur het eerste bericht! 👋
                        </p>
                      )}
                    </div>

                    <ChevronRight size={20} className="text-gray-400" />
                  </motion.button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pick Detail Modal */}
      <Modal
        isOpen={!!selectedPick}
        onClose={() => setSelectedPick(null)}
        title=""
        size="lg"
      >
        {selectedPick && (
          <div>
            {/* Photo */}
            <div className="relative h-80 -mx-6 -mt-6 mb-4">
              <Image
                src={
                  selectedPick.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedPick.name || 'U'
                  )}&size=400&background=f43f5e&color=fff`
                }
                alt={selectedPick.name || 'Gebruiker'}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  <Star size={14} fill="white" />
                  TOP PICK
                </div>
                {selectedPick.isVerified && (
                  <div className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    <Shield size={14} />
                    Geverifieerd
                  </div>
                )}
              </div>

              {/* Match Score */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-lg font-bold text-rose-500">{selectedPick.matchScore}%</span>
                <span className="text-sm text-gray-600 ml-1">match</span>
              </div>

              {/* Name */}
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-3xl font-bold">
                  {selectedPick.name}
                  {selectedPick.age && <span className="font-normal">, {selectedPick.age}</span>}
                </h2>
                {selectedPick.city && (
                  <div className="flex items-center gap-1 text-white/90 mt-1">
                    <MapPin size={16} />
                    <span>{selectedPick.city}</span>
                    {selectedPick.distance > 0 && (
                      <span className="ml-2">• {selectedPick.distance} km</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="px-2">
              {selectedPick.occupation && (
                <p className="text-gray-600 mb-2">💼 {selectedPick.occupation}</p>
              )}

              {selectedPick.bio && (
                <p className="text-gray-700 mb-4">{selectedPick.bio}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Clock size={14} />
                <span>{getTimeAgo(selectedPick.lastActive)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePass(selectedPick.id)}
                  disabled={isSwipeLoading}
                  className="w-14 h-14 rounded-full bg-white border-2 border-gray-300 hover:border-red-400 shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                  <X size={26} className="text-gray-500" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuperLike(selectedPick.id)}
                  disabled={isSwipeLoading}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                  <Star size={24} fill="white" className="text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLike(selectedPick.id)}
                  disabled={isSwipeLoading}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl flex items-center justify-center disabled:opacity-50"
                >
                  <Heart size={32} fill="white" className="text-white" />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
