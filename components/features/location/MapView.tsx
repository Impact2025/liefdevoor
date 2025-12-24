/**
 * MapView Component (Client-Side Only)
 *
 * Leaflet map implementation - dynamically imported to avoid SSR
 */

'use client'

import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'

interface MapViewProps {
  latitude: number
  longitude: number
  city?: string
  height: string
  showPrivacyCircle: boolean
  circleRadius: number
  interactive: boolean
}

export default function MapView({
  latitude,
  longitude,
  city,
  height,
  showPrivacyCircle,
  circleRadius,
  interactive,
}: MapViewProps) {
  const position: LatLngExpression = [latitude, longitude]

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
      >
        {/* OpenStreetMap tiles (free, no API key needed) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Privacy circle instead of exact marker */}
        {showPrivacyCircle && (
          <Circle
            center={position}
            radius={circleRadius}
            pathOptions={{
              color: '#C34C60',
              fillColor: '#C34C60',
              fillOpacity: 0.2,
              weight: 2,
            }}
          >
            {city && (
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{city}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Geschatte regio (~{(circleRadius / 1000).toFixed(0)} km)
                  </p>
                </div>
              </Popup>
            )}
          </Circle>
        )}
      </MapContainer>
    </div>
  )
}
