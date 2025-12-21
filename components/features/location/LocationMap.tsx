/**
 * LocationMap Component
 *
 * Wereldklasse location map with:
 * - Privacy-first design (shows region, not exact location)
 * - Circular area instead of pin marker
 * - Responsive mini-map
 * - Auto-updates when coordinates change
 */

'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./MapView'), { ssr: false })

interface LocationMapProps {
  latitude: number | null
  longitude: number | null
  city?: string
  className?: string
  height?: string
  showPrivacyCircle?: boolean
  circleRadius?: number // in meters
  interactive?: boolean
}

export function LocationMap({
  latitude,
  longitude,
  city,
  className = '',
  height = '200px',
  showPrivacyCircle = true,
  circleRadius = 2000, // 2km default
  interactive = false,
}: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show placeholder if no coordinates
  if (!latitude || !longitude) {
    return (
      <div
        className={`${className} bg-gray-100 rounded-xl flex flex-col items-center justify-center ${
          height === '200px' ? 'h-[200px]' : ''
        }`}
        style={{ height }}
      >
        <MapPin className="w-12 h-12 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">Geen locatie ingesteld</p>
        {city && (
          <p className="text-xs text-gray-400 mt-1">{city}</p>
        )}
      </div>
    )
  }

  // Show loading placeholder during SSR
  if (!isMounted) {
    return (
      <div
        className={`${className} bg-gray-100 rounded-xl flex items-center justify-center animate-pulse`}
        style={{ height }}
      >
        <MapPin className="w-12 h-12 text-gray-300" />
      </div>
    )
  }

  return (
    <div className={`${className} rounded-xl overflow-hidden border-2 border-gray-200`}>
      <MapView
        latitude={latitude}
        longitude={longitude}
        city={city}
        height={height}
        showPrivacyCircle={showPrivacyCircle}
        circleRadius={circleRadius}
        interactive={interactive}
      />
    </div>
  )
}
