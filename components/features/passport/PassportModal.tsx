/**
 * Passport Modal - Wereldklasse city selection
 *
 * Features:
 * - Live zoeken (stad + postcode)
 * - Recente locaties
 * - Favoriete steden
 * - Populaire steden
 * - Kaart preview
 * - Duur selector (24u, 48u, 72u, 1 week)
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
  Star,
  History,
  TrendingUp,
  ChevronRight,
  Loader2,
  Heart,
  Flame,
} from 'lucide-react'
import { usePassport } from '@/hooks/usePassport'
import { LocationMap } from '@/components/features/location/LocationMap'

type TabType = 'search' | 'recent' | 'favorites' | 'trending' | 'popular'

interface PassportModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (city: { name: string; lat: number; lng: number }) => void
  currentPassport?: { city: string; expiresAt: Date } | null
}

// Duration options
const DURATION_OPTIONS = [
  { value: 24, label: '24 uur', short: '24u' },
  { value: 48, label: '48 uur', short: '48u' },
  { value: 72, label: '72 uur', short: '72u' },
  { value: 168, label: '1 week', short: '1w' },
]

export function PassportModal({ isOpen, onClose, onSelect }: PassportModalProps) {
  const {
    isLoading,
    hasFeature,
    currentPassport,
    homeLocation,
    recentCities,
    favoriteCities,
    popularCities,
    trendingCities,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    activatePassport,
    clearPassport,
    addFavorite,
    removeFavorite,
    isFavorite,
    isActivating,
    isPassportActive,
    hoursRemaining,
  } = usePassport()

  const [activeTab, setActiveTab] = useState<TabType>('popular')
  const [selectedCity, setSelectedCity] = useState<{
    name: string
    lat: number
    lng: number
    distanceFromHome?: number | null
  } | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(24)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCity(null)
      setSearchQuery('')
      setActiveTab(recentCities.length > 0 ? 'recent' : 'popular')
    }
  }, [isOpen, recentCities.length, setSearchQuery])

  // Switch to search tab when typing
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setActiveTab('search')
    }
  }, [searchQuery])

  const handleSelectCity = (city: {
    name: string
    lat: number
    lng: number
    latitude?: number
    longitude?: number
    distanceFromHome?: number | null
  }) => {
    setSelectedCity({
      name: city.name,
      lat: city.lat ?? city.latitude!,
      lng: city.lng ?? city.longitude!,
      distanceFromHome: city.distanceFromHome,
    })
  }

  const handleActivate = async () => {
    if (!selectedCity) return

    const result = await activatePassport(
      selectedCity.name,
      selectedCity.lat,
      selectedCity.lng,
      selectedDuration
    )

    if (result.success) {
      onSelect?.({
        name: selectedCity.name,
        lat: selectedCity.lat,
        lng: selectedCity.lng,
      })
      onClose()
    }
  }

  const handleClearPassport = async () => {
    const result = await clearPassport()
    if (result.success) {
      onClose()
    }
  }

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    city: { name: string; lat?: number; lng?: number; latitude?: number; longitude?: number }
  ) => {
    e.stopPropagation()
    const lat = city.lat ?? city.latitude!
    const lng = city.lng ?? city.longitude!

    if (isFavorite(city.name)) {
      await removeFavorite(city.name)
    } else {
      await addFavorite(city.name, lat, lng)
    }
  }

  if (!isOpen) return null

  const renderCityItem = (city: any, showFavorite = true) => {
    const isSelected = selectedCity?.name === city.name
    const cityIsFavorite = isFavorite(city.name || city.city)
    const cityName = city.name || city.city
    const lat = city.lat ?? city.latitude
    const lng = city.lng ?? city.longitude

    return (
      <button
        key={cityName}
        onClick={() => handleSelectCity({ ...city, name: cityName, lat, lng })}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
          isSelected
            ? 'bg-rose-100 border-2 border-rose-500'
            : 'bg-gray-50 hover:bg-rose-50 border-2 border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <MapPin className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-rose-500' : 'text-gray-400'}`} />
          <div className="text-left min-w-0">
            <span className={`font-medium truncate block ${isSelected ? 'text-rose-600' : 'text-gray-800'}`}>
              {cityName}
            </span>
            {city.distanceFromHome != null && (
              <span className="text-xs text-gray-500">
                ~{city.distanceFromHome} km van thuis
              </span>
            )}
            {city.province && (
              <span className="text-xs text-gray-500 block">
                {city.province}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showFavorite && hasFeature && (
            <button
              onClick={(e) => handleToggleFavorite(e, { name: cityName, lat, lng })}
              className={`p-1.5 rounded-lg transition-colors ${
                cityIsFavorite
                  ? 'text-amber-500 hover:bg-amber-50'
                  : 'text-gray-300 hover:text-amber-400 hover:bg-gray-100'
              }`}
            >
              <Star className="w-4 h-4" fill={cityIsFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          {isSelected ? (
            <Check className="w-5 h-5 text-rose-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-300" />
          )}
        </div>
      </button>
    )
  }

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
          className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-4 z-10 flex-shrink-0">
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
            {isPassportActive && currentPassport && (
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
                  className="mt-2 text-sm text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                >
                  Terug naar {homeLocation?.city || 'mijn locatie'}
                </button>
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek stad of postcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 animate-spin" />
              )}
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
              {recentCities.length > 0 && (
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'recent'
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <History size={14} />
                  Recent
                </button>
              )}
              {favoriteCities.length > 0 && (
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'favorites'
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Star size={14} />
                  Favorieten
                </button>
              )}
              {trendingCities.length > 0 && (
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'trending'
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Flame size={14} />
                  Trending
                </button>
              )}
              <button
                onClick={() => setActiveTab('popular')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'popular'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TrendingUp size={14} />
                Populair
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading state */}
            {isLoading && (
              <div className="p-4 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* City lists - Show for everyone, gate activation instead */}
            {!isLoading && (
              <div className="p-4 space-y-2">
                {/* Premium gate banner (collapsed, above results) */}
                {!hasFeature && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Crown className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1">Liefde Compleet Feature</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Upgrade om in andere steden te swipen!
                        </p>
                        <a
                          href="/prijzen"
                          className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-shadow"
                        >
                          Upgrade naar Compleet
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search results */}
                {activeTab === 'search' && (
                  <>
                    {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                      <p className="text-center text-gray-500 py-8">
                        Geen steden gevonden voor "{searchQuery}"
                      </p>
                    )}
                    {searchResults.map((city) => renderCityItem(city))}
                  </>
                )}

                {/* Recent cities */}
                {activeTab === 'recent' && (
                  <>
                    {recentCities.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nog geen recente locaties
                      </p>
                    ) : (
                      recentCities.map((city) => renderCityItem(city))
                    )}
                  </>
                )}

                {/* Favorite cities */}
                {activeTab === 'favorites' && (
                  <>
                    {favoriteCities.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nog geen favoriete steden
                      </p>
                    ) : (
                      favoriteCities.map((city) => renderCityItem(city, false))
                    )}
                  </>
                )}

                {/* Trending cities */}
                {activeTab === 'trending' && (
                  <>
                    {trendingCities.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nog geen trending steden
                      </p>
                    ) : (
                      <>
                        <div className="mb-3 p-3 bg-gradient-to-r from-orange-50 to-rose-50 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-2 text-sm text-orange-700">
                            <Flame className="w-4 h-4" />
                            <span className="font-medium">Populair deze week - {trendingCities.reduce((sum, c) => sum + c.travelers, 0)} reizigers</span>
                          </div>
                        </div>
                        {trendingCities.map((city) => renderCityItem({
                          ...city,
                          name: city.city,
                          lat: city.latitude,
                          lng: city.longitude
                        }))}
                      </>
                    )}
                  </>
                )}

                {/* Popular cities */}
                {activeTab === 'popular' && (
                  popularCities.map((city) => renderCityItem(city))
                )}
              </div>
            )}
          </div>

          {/* City preview and actions */}
          {selectedCity && (
            <div className="border-t bg-gray-50 p-4 flex-shrink-0">
              {/* Mini map */}
              <div className="h-32 rounded-xl overflow-hidden mb-4">
                <LocationMap
                  latitude={selectedCity.lat}
                  longitude={selectedCity.lng}
                  height="128px"
                  circleRadius={5000}
                  interactive={false}
                />
              </div>

              {/* Selected city info */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedCity.name}</h3>
                  {selectedCity.distanceFromHome != null && (
                    <p className="text-sm text-gray-500">
                      ~{selectedCity.distanceFromHome} km van {homeLocation?.city || 'thuis'}
                    </p>
                  )}
                </div>
                {hasFeature && (
                  <button
                    onClick={(e) => handleToggleFavorite(e, selectedCity)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorite(selectedCity.name)
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <Star className="w-5 h-5" fill={isFavorite(selectedCity.name) ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>

              {hasFeature ? (
                <>
                  {/* Duration selector */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Hoe lang wil je reizen?</p>
                    <div className="flex gap-2">
                      {DURATION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedDuration(option.value)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedDuration === option.value
                              ? 'bg-rose-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300'
                          }`}
                        >
                          {option.short}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activate button */}
                  <button
                    onClick={handleActivate}
                    disabled={isActivating}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isActivating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plane className="w-5 h-5" />
                        Reis naar {selectedCity.name}
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* Premium gate for activation */
                <div className="text-center">
                  <div className="mb-3 p-3 bg-white rounded-lg border-2 border-amber-200">
                    <Crown className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Premium vereist
                    </p>
                    <p className="text-xs text-gray-500">
                      Upgrade naar Liefde Compleet om Passport te activeren
                    </p>
                  </div>
                  <a
                    href="/prijzen"
                    className="block w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                  >
                    Upgrade naar Compleet
                  </a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PassportModal
