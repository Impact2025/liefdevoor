/**
 * Passport Modal - Select city to swipe in
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  MapPin,
  X,
  Search,
  Crown,
  Check,
  Plane,
  Clock,
} from 'lucide-react'

interface City {
  name: string
  lat: number
  lng: number
}

interface PassportModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (city: City) => void
  currentPassport?: { city: string; expiresAt: Date } | null
}

export function PassportModal({ isOpen, onClose, onSelect, currentPassport }: PassportModalProps) {
  const [cities, setCities] = useState<{ dutch: City[]; international: City[] }>({
    dutch: [],
    international: [],
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'dutch' | 'international'>('dutch')
  const [isLoading, setIsLoading] = useState(true)
  const [hasFeature, setHasFeature] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchPassportData()
    }
  }, [isOpen])

  const fetchPassportData = async () => {
    try {
      const res = await fetch('/api/passport')
      const data = await res.json()
      if (res.ok) {
        setHasFeature(data.hasFeature)
        setCities(data.availableCities)
      }
    } catch (error) {
      console.error('Error fetching passport data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCity = async (city: City) => {
    if (!hasFeature) return

    setIsActivating(true)
    try {
      const res = await fetch('/api/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: city.name,
          latitude: city.lat,
          longitude: city.lng,
          duration: 24,
        }),
      })

      if (res.ok) {
        onSelect(city)
        onClose()
      }
    } catch (error) {
      console.error('Error activating passport:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const handleClearPassport = async () => {
    setIsActivating(true)
    try {
      const res = await fetch('/api/passport', { method: 'DELETE' })
      if (res.ok) {
        onClose()
        window.location.reload()
      }
    } catch (error) {
      console.error('Error clearing passport:', error)
    } finally {
      setIsActivating(false)
    }
  }

  const filteredCities = cities[selectedCategory]?.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const hoursRemaining = currentPassport?.expiresAt
    ? Math.max(0, Math.ceil((new Date(currentPassport.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-rose-500" />
                <h2 className="text-xl font-bold text-gray-900">Passport</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current passport status */}
            {currentPassport && (
              <div className="bg-rose-50 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-rose-500" />
                    <span className="font-medium text-rose-700">
                      Je bent in {currentPassport.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-rose-600">
                    <Clock size={14} />
                    <span>{hoursRemaining}u over</span>
                  </div>
                </div>
                <button
                  onClick={handleClearPassport}
                  disabled={isActivating}
                  className="mt-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  Terug naar mijn locatie
                </button>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek een stad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setSelectedCategory('dutch')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'dutch'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Nederland
              </button>
              <button
                onClick={() => setSelectedCategory('international')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'international'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Internationaal
              </button>
            </div>
          </div>

          {/* Premium gate */}
          {!hasFeature && !isLoading && (
            <div className="p-6 text-center">
              <Crown className="w-16 h-16 mx-auto text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Liefde Compleet Feature
              </h3>
              <p className="text-gray-600 mb-4">
                Met Passport kun je swipen in andere steden voordat je daar bent.
                Ideaal voor als je op reis gaat!
              </p>
              <a
                href="/prijzen"
                className="inline-block px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-semibold"
              >
                Upgrade naar Compleet
              </a>
            </div>
          )}

          {/* City list */}
          {hasFeature && (
            <div className="p-4 space-y-2 overflow-y-auto max-h-[50vh]">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredCities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Geen steden gevonden
                </p>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelectCity(city)}
                    disabled={isActivating}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-rose-50 rounded-xl transition-colors group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                      <span className="font-medium text-gray-800 group-hover:text-rose-600">
                        {city.name}
                      </span>
                    </div>
                    {currentPassport?.city === city.name ? (
                      <Check className="w-5 h-5 text-rose-500" />
                    ) : (
                      <Plane className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PassportModal
