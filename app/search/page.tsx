/**
 * Search Page - Advanced Profile Search
 *
 * Allows users to search for profiles with various filters:
 * - Age range
 * - Location/distance
 * - Gender
 * - Interests
 * - Online status
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Shield,
  Heart,
  X,
  ChevronDown,
  Sliders,
  Users,
  Sparkles,
} from 'lucide-react'
import { Button, Input, Select, Modal } from '@/components/ui'
import { usePost } from '@/hooks'
import { Gender } from '@prisma/client'

interface SearchUser {
  id: string
  name: string
  profileImage: string | null
  photos: { url: string }[]
  birthDate: string | null
  city: string | null
  bio: string | null
  isVerified: boolean
  lastActive: Date | null
  distance?: number
}

interface SearchFilters {
  minAge: number
  maxAge: number
  gender?: Gender
  city?: string
  maxDistance?: number
  onlineOnly?: boolean
}

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<SearchUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    minAge: 18,
    maxAge: 99,
  })

  const { post: swipePost, isLoading: isSwipeLoading } = usePost('/api/swipe')

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    if (
      today.getMonth() - birth.getMonth() < 0 ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) {
      age--
    }
    return age
  }

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      setHasSearched(true)

      const params = new URLSearchParams()
      if (filters.minAge) params.append('minAge', filters.minAge.toString())
      if (filters.maxAge) params.append('maxAge', filters.maxAge.toString())
      if (filters.gender) params.append('gender', filters.gender)
      if (filters.city) params.append('city', filters.city)
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance.toString())
      params.append('limit', '50')

      const response = await fetch(`/api/discover?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        let filteredUsers = data.users || []

        // Filter by online status if needed
        if (filters.onlineOnly) {
          const now = new Date()
          filteredUsers = filteredUsers.filter((user: SearchUser) => {
            if (!user.lastActive) return false
            const lastActive = new Date(user.lastActive)
            const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
            return hoursDiff < 24
          })
        }

        setUsers(filteredUsers)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
      setShowFilters(false)
    }
  }

  const handleLike = async (userId: string) => {
    try {
      await swipePost({ swipedId: userId, isLike: true })
      setUsers(users.filter((u) => u.id !== userId))
      setSelectedUser(null)
    } catch (err) {
      console.error('Error liking:', err)
    }
  }

  const handlePass = async (userId: string) => {
    try {
      await swipePost({ swipedId: userId, isLike: false })
      setUsers(users.filter((u) => u.id !== userId))
      setSelectedUser(null)
    } catch (err) {
      console.error('Error passing:', err)
    }
  }

  const getOnlineStatus = (lastActive: Date | null) => {
    if (!lastActive) return { text: 'Onbekend', color: 'gray' }

    const now = new Date()
    const last = new Date(lastActive)
    const hoursDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60)

    if (hoursDiff < 0.25) return { text: 'Nu online', color: 'green' }
    if (hoursDiff < 1) return { text: 'Recent online', color: 'green' }
    if (hoursDiff < 24) return { text: 'Vandaag online', color: 'yellow' }
    if (hoursDiff < 48) return { text: 'Gisteren online', color: 'yellow' }
    return { text: 'Meer dan 2 dagen', color: 'gray' }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-stone-50 pt-4 pb-24">
        <div className="max-w-lg mx-auto px-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-6 h-6 text-rose-500" />
              <h1 className="text-2xl font-bold text-gray-900">Zoeken</h1>
            </div>
            <p className="text-gray-600">Vind je perfecte match</p>
          </div>
          {hasSearched && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Sliders size={18} className="mr-1" />
              Filters
            </Button>
          )}
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg p-5 mb-6 overflow-hidden"
            >
              <div className="space-y-5">
                {/* Age Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Leeftijd
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={filters.minAge}
                      onChange={(e) =>
                        setFilters({ ...filters, minAge: parseInt(e.target.value) || 18 })
                      }
                      min={18}
                      max={99}
                      className="text-center"
                    />
                    <span className="text-gray-400">tot</span>
                    <Input
                      type="number"
                      value={filters.maxAge}
                      onChange={(e) =>
                        setFilters({ ...filters, maxAge: parseInt(e.target.value) || 99 })
                      }
                      min={18}
                      max={99}
                      className="text-center"
                    />
                  </div>
                </div>

                {/* Gender */}
                <Select
                  label="Ik zoek"
                  value={filters.gender || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      gender: e.target.value as Gender | undefined,
                    })
                  }
                  fullWidth
                  options={[
                    { value: '', label: 'Iedereen' },
                    { value: Gender.MALE, label: 'Mannen' },
                    { value: Gender.FEMALE, label: 'Vrouwen' },
                  ]}
                />

                {/* City */}
                <Input
                  label="Plaats"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Bijv. Amsterdam, Rotterdam..."
                  fullWidth
                />

                {/* Max Distance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximale afstand
                  </label>
                  <Select
                    value={filters.maxDistance?.toString() || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxDistance: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    fullWidth
                    options={[
                      { value: '', label: 'Geen limiet' },
                      { value: '10', label: '10 km' },
                      { value: '25', label: '25 km' },
                      { value: '50', label: '50 km' },
                      { value: '100', label: '100 km' },
                    ]}
                  />
                </div>

                {/* Online Only Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onlineOnly || false}
                    onChange={(e) =>
                      setFilters({ ...filters, onlineOnly: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-gray-700">
                    Alleen online gebruikers (afgelopen 24 uur)
                  </span>
                </label>

                {/* Search Button */}
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  fullWidth
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Search size={20} />
                      </motion.div>
                      Zoeken...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search size={20} />
                      Zoek profielen
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {hasSearched && !showFilters && (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{users.length}</span>{' '}
                {users.length === 1 ? 'profiel' : 'profielen'} gevonden
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : users.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Geen resultaten
                </h2>
                <p className="text-gray-600 mb-6">
                  Probeer je zoekcriteria aan te passen om meer profielen te vinden.
                </p>
                <Button variant="secondary" onClick={() => setShowFilters(true)}>
                  Pas filters aan
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
                <AnimatePresence mode="popLayout">
                  {users.map((user, index) => {
                    const onlineStatus = getOnlineStatus(user.lastActive)
                    const photo =
                      user.photos?.[0]?.url ||
                      user.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || 'U'
                      )}&size=400&background=f43f5e&color=fff`

                    return (
                      <motion.button
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedUser(user)}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group"
                      >
                        {/* Photo */}
                        <Image
                          src={photo}
                          alt={user.name || 'Gebruiker'}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Online Status Dot */}
                        <div
                          className={`absolute top-3 left-3 w-3 h-3 rounded-full border-2 border-white ${
                            onlineStatus.color === 'green'
                              ? 'bg-green-500'
                              : onlineStatus.color === 'yellow'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                        />

                        {/* Verified Badge */}
                        {user.isVerified && (
                          <div className="absolute top-3 right-3 bg-blue-500 text-white p-1.5 rounded-full">
                            <Shield size={14} />
                          </div>
                        )}

                        {/* User Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <h3 className="font-bold text-lg truncate">
                            {user.name}
                            {user.birthDate && (
                              <span className="font-normal">
                                , {calculateAge(user.birthDate)}
                              </span>
                            )}
                          </h3>
                          {user.city && (
                            <div className="flex items-center gap-1 text-sm text-white/80">
                              <MapPin size={12} />
                              <span className="truncate">{user.city}</span>
                              {user.distance !== undefined && user.distance > 0 && (
                                <span className="ml-1">• {user.distance} km</span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!hasSearched && !showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Vind je perfecte match
            </h2>
            <p className="text-gray-600 mb-6">
              Gebruik de filters om profielen te vinden die bij jou passen.
            </p>
            <Button variant="primary" onClick={() => setShowFilters(true)}>
              Start zoeken
            </Button>
          </motion.div>
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
            <div className="relative w-48 h-48 mx-auto mb-4 rounded-2xl overflow-hidden">
              <Image
                src={
                  selectedUser.photos?.[0]?.url ||
                  selectedUser.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedUser.name || 'U'
                  )}&size=400&background=f43f5e&color=fff`
                }
                alt={selectedUser.name || 'Gebruiker'}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {selectedUser.name}
              {selectedUser.birthDate && `, ${calculateAge(selectedUser.birthDate)}`}
            </h2>

            {selectedUser.city && (
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-2">
                <MapPin size={16} />
                <span>{selectedUser.city}</span>
                {selectedUser.distance !== undefined && selectedUser.distance > 0 && (
                  <span className="ml-1">• {selectedUser.distance} km</span>
                )}
              </div>
            )}

            {/* Online Status */}
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
              <Clock size={14} />
              <span>{getOnlineStatus(selectedUser.lastActive).text}</span>
            </div>

            {selectedUser.bio && (
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">{selectedUser.bio}</p>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePass(selectedUser.id)}
                disabled={isSwipeLoading}
                className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 shadow-lg flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X size={28} className="text-gray-500" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLike(selectedUser.id)}
                disabled={isSwipeLoading}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-xl flex items-center justify-center disabled:opacity-50"
              >
                <Heart size={36} fill="white" className="text-white" />
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
