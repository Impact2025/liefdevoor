/**
 * Discover Page - Wereldklasse Tinder-style Interface
 *
 * The main discovery screen featuring:
 * - Full-screen scrollable profile cards
 * - Smooth swipe animations
 * - Match celebrations with confetti
 * - Premium filter options
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Filter,
  Sparkles,
  Camera,
  Shield,
  Settings2,
  X,
} from 'lucide-react'
import { DiscoverProfileCard } from '@/components/features/discover/DiscoverProfileCard'
import { useDiscoverUsers, usePost, useCurrentUser } from '@/hooks'
import { Modal, Button, Input, Select, Alert } from '@/components/ui'
import { Gender } from '@prisma/client'
import type { DiscoverFilters, SwipeResult } from '@/lib/types'
import confetti from 'canvas-confetti'
import Image from 'next/image'

export default function DiscoverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { user: currentUser } = useCurrentUser()
  const [showFilters, setShowFilters] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [matchData, setMatchData] = useState<any>(null)
  const [filters, setFilters] = useState<DiscoverFilters>({ minAge: 18, maxAge: 99 })
  const { users, isLoading, error, refetch, setUsers } = useDiscoverUsers(filters)

  // Check if user needs onboarding (no photos)
  useEffect(() => {
    if (currentUser && !onboardingDismissed) {
      const hasPhotos = currentUser.photos && currentUser.photos.length > 0
      if (!hasPhotos && !currentUser.profileImage) {
        setShowOnboarding(true)
      }
    }
  }, [currentUser, onboardingDismissed])

  // Confetti celebration for matches
  const celebrateMatch = useCallback(() => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    // Multi-stage confetti burst
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#EC4899', '#F472B6', '#FCA5A5'],
    })

    fire(0.2, {
      spread: 60,
      colors: ['#F43F5E', '#FB7185', '#FDA4AF'],
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#EC4899', '#F472B6', '#FCA5A5'],
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#F43F5E', '#FB7185'],
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#EC4899', '#F472B6'],
    })
  }, [])

  const { post: swipePost, isLoading: isSwipeLoading } = usePost<SwipeResult>('/api/swipe', {
    onSuccess: (data) => {
      if (data?.isMatch && data.match) {
        setMatchData(data.match)
        setShowMatchModal(true)
        setTimeout(celebrateMatch, 100)
      }
    },
  })

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
    return age
  }

  const convertToProfileData = (user: any) => ({
    id: user.id,
    name: user.name || 'Onbekend',
    age: user.birthDate ? calculateAge(user.birthDate) : 0,
    photo: user.profileImage || user.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&size=400&background=f43f5e&color=fff`,
    photos: user.photos,
    distance: user.distance || 0,
    city: user.city || '',
    bio: user.bio || '',
    interests: user.interests || [],
    verified: user.isVerified || false,
    lastActive: user.lastActive || user.updatedAt,
    occupation: user.occupation,
    education: user.education,
    height: user.height,
    drinking: user.drinking,
    smoking: user.smoking,
    children: user.children,
    voiceIntro: user.voiceIntro,
  })

  const handleLike = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    const currentUser = users[0]
    await swipePost({ swipedId: currentUser.id, isLike: true })
    setUsers(users.slice(1))
  }, [users, isSwipeLoading, swipePost, setUsers])

  const handlePass = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    const currentUser = users[0]
    await swipePost({ swipedId: currentUser.id, isLike: false })
    setUsers(users.slice(1))
  }, [users, isSwipeLoading, swipePost, setUsers])

  const handleSuperLike = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    const currentUser = users[0]
    await swipePost({ swipedId: currentUser.id, isLike: true, isSuperLike: true })
    setUsers(users.slice(1))
  }, [users, isSwipeLoading, swipePost, setUsers])

  const applyFilters = () => {
    refetch(filters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({ minAge: 18, maxAge: 99 })
    refetch({ minAge: 18, maxAge: 99 })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="animate-pulse">
            <div className="h-[70vh] bg-gray-200 rounded-3xl" />
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
    <div className="min-h-screen bg-stone-50">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Ontdek</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Filters"
            >
              <Filter size={20} className="text-gray-600" />
            </button>
            {currentUser?.profileImage && (
              <button
                onClick={() => router.push('/profile')}
                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-rose-500 ring-offset-2"
              >
                <Image
                  src={currentUser.profileImage}
                  alt="Profiel"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 px-4">
        <div className="max-w-lg mx-auto">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-[calc(100vh-180px)] bg-gray-200 rounded-3xl" />
            </div>
          ) : error ? (
            <div className="h-[calc(100vh-180px)] flex items-center justify-center">
              <Alert variant="error">
                Er ging iets mis.{' '}
                <button onClick={() => refetch()} className="underline font-semibold">
                  Probeer opnieuw
                </button>
              </Alert>
            </div>
          ) : users.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[calc(100vh-180px)] flex items-center justify-center"
            >
              <div className="text-center px-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Geen profielen meer
                </h3>
                <p className="text-gray-600 mb-6">
                  Je hebt alle profielen in je omgeving gezien. Probeer je filters aan te passen of kom later terug!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="secondary" onClick={clearFilters}>
                    Reset filters
                  </Button>
                  <Button variant="primary" onClick={() => refetch()}>
                    Vernieuwen
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="relative">
              <AnimatePresence mode="popLayout">
                {users.slice(0, 3).map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                      scale: 1 - index * 0.03,
                      y: index * 8,
                      zIndex: users.length - index,
                      opacity: index === 0 ? 1 : 0.5,
                    }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="absolute inset-0"
                    style={{ pointerEvents: index === 0 ? 'auto' : 'none' }}
                  >
                    {index === 0 ? (
                      <DiscoverProfileCard
                        profile={convertToProfileData(user)}
                        onLike={handleLike}
                        onPass={handlePass}
                        onSuperLike={handleSuperLike}
                        isLoading={isSwipeLoading}
                      />
                    ) : (
                      <div className="h-[calc(100vh-180px)] bg-gray-100 rounded-3xl shadow-lg" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Profile count indicator */}
              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <p className="text-sm text-gray-500">
                  {users.length} {users.length === 1 ? 'persoon' : 'mensen'} in je omgeving
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Filter Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filters" size="md">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Leeftijd</label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={filters.minAge || 18}
                onChange={(e) => setFilters({ ...filters, minAge: parseInt(e.target.value) || 18 })}
                min={18}
                max={99}
                className="text-center"
              />
              <span className="text-gray-400">tot</span>
              <Input
                type="number"
                value={filters.maxAge || 99}
                onChange={(e) => setFilters({ ...filters, maxAge: parseInt(e.target.value) || 99 })}
                min={18}
                max={99}
                className="text-center"
              />
            </div>
          </div>

          <Select
            label="Ik zoek"
            value={filters.gender || ''}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value as Gender | undefined })}
            fullWidth
            options={[
              { value: '', label: 'Iedereen' },
              { value: Gender.MALE, label: 'Mannen' },
              { value: Gender.FEMALE, label: 'Vrouwen' },
            ]}
          />

          <Input
            label="Zoek op naam"
            value={filters.name || ''}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            placeholder="Bijv. Jan, Maria..."
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={clearFilters} fullWidth>
              Reset
            </Button>
            <Button variant="primary" onClick={applyFilters} fullWidth>
              Toepassen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Match Modal */}
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="" size="md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-center py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
            className="text-8xl mb-6"
          >
            💕
          </motion.div>

          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-3 bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent"
          >
            It's a Match!
          </motion.h3>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg mb-8 text-gray-600"
          >
            Jij en <span className="font-semibold text-gray-900">{matchData?.otherUser?.name}</span> vinden elkaar leuk!
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <Button
              variant="secondary"
              onClick={() => setShowMatchModal(false)}
              fullWidth
              size="lg"
            >
              Verder swipen
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/chat/' + matchData?.id)}
              fullWidth
              size="lg"
            >
              Stuur bericht
            </Button>
          </motion.div>
        </motion.div>
      </Modal>

      {/* Onboarding Modal */}
      <Modal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false)
          setOnboardingDismissed(true)
        }}
        title=""
        size="md"
      >
        <div className="text-center py-8">
          <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
            <Camera className="w-14 h-14 text-rose-500" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Voeg een foto toe!
          </h3>

          <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
            Profielen met foto's krijgen{' '}
            <span className="font-bold text-rose-600">10x meer matches</span>.
            Laat anderen zien wie je bent!
          </p>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowOnboarding(false)
                setOnboardingDismissed(true)
              }}
              fullWidth
              size="lg"
            >
              Later
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/profile')}
              fullWidth
              size="lg"
            >
              Foto toevoegen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
