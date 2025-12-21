/**
 * Discover Page - Wereldklasse Tinder-style Interface
 *
 * Full-screen swipeable cards with minimal UI chrome
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
  X,
  Flame,
  Crown,
  RotateCcw,
  Globe,
  Plane,
} from 'lucide-react'
import { DiscoverProfileCard } from '@/components/features/discover/DiscoverProfileCard'
import { BoostButton } from '@/components/features/boost/BoostButton'
import { PassportModal } from '@/components/features/passport'
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
  const [swipesRemaining, setSwipesRemaining] = useState<number | null>(null)
  const [isUnlimited, setIsUnlimited] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [canRewind, setCanRewind] = useState(false)
  const [isRewinding, setIsRewinding] = useState(false)
  const [lastSwipedUser, setLastSwipedUser] = useState<any>(null)

  // Passport feature
  const [showPassportModal, setShowPassportModal] = useState(false)
  const [activePassport, setActivePassport] = useState<{ city: string; expiresAt: Date } | null>(null)

  // Fetch subscription/swipe limits
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const res = await fetch('/api/subscription')
        const data = await res.json()
        if (res.ok) {
          const dailyLikes = data.features?.dailyLikes
          if (dailyLikes === -1) {
            setIsUnlimited(true)
          } else {
            setIsUnlimited(false)
            const countRes = await fetch('/api/swipe/count')
            const countData = await countRes.json()
            if (countRes.ok) {
              setSwipesRemaining(Math.max(0, dailyLikes - countData.count))
            }
          }
          setCanRewind(data.isPlus || data.isComplete)
        }
      } catch (err) {
        console.error('Error fetching limits:', err)
      }
    }
    if (session?.user) {
      fetchLimits()
    }
  }, [session])

  // Rewind last swipe
  const handleRewind = useCallback(async () => {
    if (isRewinding || !canRewind) return

    setIsRewinding(true)
    try {
      const res = await fetch('/api/swipe/rewind', { method: 'POST' })
      const data = await res.json()

      if (res.ok && data.user) {
        setUsers([data.user, ...users])
        setLastSwipedUser(null)
      } else if (res.status === 403) {
        setShowUpgradeModal(true)
      }
    } catch (err) {
      console.error('Error rewinding:', err)
    } finally {
      setIsRewinding(false)
    }
  }, [isRewinding, canRewind, users, setUsers])

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
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#EC4899', '#F472B6', '#FCA5A5'] })
    fire(0.2, { spread: 60, colors: ['#F43F5E', '#FB7185', '#FDA4AF'] })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#EC4899', '#F472B6', '#FCA5A5'] })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#F43F5E', '#FB7185'] })
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#EC4899', '#F472B6'] })
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

    if (!isUnlimited && swipesRemaining !== null && swipesRemaining <= 0) {
      setShowUpgradeModal(true)
      return
    }

    const swipedUser = users[0]
    setLastSwipedUser(swipedUser)
    const result = await swipePost({ swipedId: swipedUser.id, isLike: true })

    if (result?.limits?.swipesRemaining !== undefined) {
      setSwipesRemaining(result.limits.swipesRemaining)
    } else if (!isUnlimited && swipesRemaining !== null) {
      setSwipesRemaining(Math.max(0, swipesRemaining - 1))
    }

    setUsers(users.slice(1))
  }, [users, isSwipeLoading, swipePost, setUsers, isUnlimited, swipesRemaining])

  const handlePass = useCallback(async () => {
    if (users.length === 0 || isSwipeLoading) return
    const swipedUser = users[0]
    setLastSwipedUser(swipedUser)
    await swipePost({ swipedId: swipedUser.id, isLike: false })
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="animate-pulse">
            <div className="h-[80vh] bg-gray-800 rounded-3xl" />
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
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Floating Header - Glassmorphism */}
      <header className="absolute top-0 left-0 right-0 z-50 safe-area-inset-top">
        <div className="max-w-lg mx-auto px-4 pt-2 pb-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Sparkles size={22} className="text-white" />
              </div>
              <span className="font-bold text-xl text-white">Ontdek</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Passport Button */}
              <button
                onClick={() => setShowPassportModal(true)}
                className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${
                  activePassport
                    ? 'bg-rose-500/80 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {activePassport ? <Plane size={20} /> : <Globe size={20} />}
              </button>

              {/* Boost Button */}
              <BoostButton />

              {/* Swipe limit indicator */}
              {!isUnlimited && swipesRemaining !== null && (
                <div className="flex items-center gap-1.5 bg-rose-500/80 backdrop-blur-md px-3 py-2 rounded-xl">
                  <Flame size={16} className="text-white" />
                  <span className="text-sm font-bold text-white">{swipesRemaining}</span>
                </div>
              )}
              {isUnlimited && (
                <div className="flex items-center gap-1.5 bg-amber-500/80 backdrop-blur-md px-3 py-2 rounded-xl">
                  <Crown size={16} className="text-white" />
                </div>
              )}

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
              >
                <Filter size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Passport Active Banner - Compact */}
          {activePassport && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center justify-between bg-gradient-to-r from-rose-500/90 to-pink-500/90 backdrop-blur-md text-white py-2 px-4 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <Plane size={16} />
                <span className="text-sm font-medium">Je bent in {activePassport.city}</span>
              </div>
              <button onClick={() => setShowPassportModal(true)} className="text-xs underline">
                Wijzig
              </button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content - Full Screen Cards */}
      <main className="h-full pt-16 pb-20">
        <div className="h-full max-w-lg mx-auto px-3">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse w-full">
                <div className="h-[75vh] bg-gray-800 rounded-3xl" />
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
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
              className="h-full flex items-center justify-center"
            >
              <div className="text-center px-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Geen profielen meer</h3>
                <p className="text-gray-400 mb-6">
                  Je hebt alle profielen in je omgeving gezien. Pas je filters aan of kom later terug!
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
            <div className="relative h-full">
              <AnimatePresence mode="popLayout">
                {users.slice(0, 3).map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                      scale: 1 - index * 0.02,
                      y: index * 6,
                      zIndex: users.length - index,
                      opacity: index === 0 ? 1 : 0.6,
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
                      <div className="h-full bg-gray-800 rounded-3xl shadow-xl" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Info */}
      {users.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 z-40 flex items-center justify-center gap-3">
          {/* Rewind Button */}
          {canRewind && lastSwipedUser && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRewind}
              disabled={isRewinding}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium text-sm shadow-lg transition-all disabled:opacity-50"
            >
              <RotateCcw size={16} className={isRewinding ? 'animate-spin' : ''} />
              Terug
            </motion.button>
          )}
          <p className="text-sm text-white/60 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            {users.length} {users.length === 1 ? 'persoon' : 'mensen'} in je buurt
          </p>
        </div>
      )}

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
            <Button variant="secondary" onClick={() => setShowMatchModal(false)} fullWidth size="lg">
              Verder swipen
            </Button>
            <Button variant="primary" onClick={() => router.push('/chat/' + matchData?.id)} fullWidth size="lg">
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

          <h3 className="text-2xl font-bold text-gray-900 mb-4">Voeg een foto toe!</h3>

          <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
            Profielen met foto's krijgen{' '}
            <span className="font-bold text-rose-600">10x meer matches</span>. Laat anderen zien wie je bent!
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
            <Button variant="primary" onClick={() => router.push('/profile')} fullWidth size="lg">
              Foto toevoegen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upgrade Modal */}
      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="" size="md">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
            <Crown className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">Dagelijkse likes op</h3>

          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Je hebt al je dagelijkse likes gebruikt. Upgrade naar{' '}
            <span className="font-bold text-amber-600">Premium</span> voor onbeperkt swipen!
          </p>

          <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-left">
            <h4 className="font-bold text-amber-700 mb-2">Premium voordelen:</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-center gap-2">
                <Sparkles size={16} /> Onbeperkt likes per dag
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} /> Zie wie jou leuk vindt
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} /> Rewind laatste swipe
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} /> Geen advertenties
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setShowUpgradeModal(false)} fullWidth size="lg">
              Morgen opnieuw
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/prijzen')}
              fullWidth
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              Ga Premium
            </Button>
          </div>
        </motion.div>
      </Modal>

      {/* Passport Modal */}
      <PassportModal
        isOpen={showPassportModal}
        onClose={() => setShowPassportModal(false)}
        currentPassport={activePassport}
        onSelect={(city) => {
          setActivePassport({
            city: city.name,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          })
          refetch(filters)
        }}
      />
    </div>
  )
}
