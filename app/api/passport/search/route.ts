/**
 * Passport Search API - Live city/postcode search
 *
 * Features:
 * - Live search via Nominatim API (OpenStreetMap)
 * - Dutch postcode detection (1234AB → city)
 * - Fallback to static Dutch cities list
 * - Rate limiting via debounce on client side
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import {
  DUTCH_CITIES,
  searchCities,
  geocodePostcode,
  isValidDutchPostcode,
} from '@/lib/services/geocoding'

// Simple in-memory cache for Nominatim results (15 min TTL)
const searchCache = new Map<string, { results: any[]; timestamp: number }>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

/**
 * Search cities via Nominatim API
 */
async function searchViaNominatim(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&` +
      `country=nl&` +
      `format=json&` +
      `limit=10&` +
      `addressdetails=1&` +
      `featuretype=city`,
      {
        headers: {
          'User-Agent': 'LiefdeVoorIedereen/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Nominatim API error')
    }

    const data = await response.json()

    // Filter for relevant place types and format results
    return data
      .filter((item: any) => {
        const type = item.type
        return ['city', 'town', 'village', 'municipality', 'administrative'].includes(type)
      })
      .map((item: any) => ({
        name: item.address.city || item.address.town || item.address.village || item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        province: item.address.state || item.address.county,
        type: item.type,
      }))
      .filter((item: any, index: number, self: any[]) =>
        // Deduplicate by name
        index === self.findIndex(t => t.name === item.name)
      )
  } catch (error) {
    console.error('Nominatim search error:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''

    console.log('[Passport Search] Query received:', { query, length: query.length })

    if (query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Check cache first
    const cacheKey = query.toLowerCase()
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ results: cached.results, cached: true })
    }

    let results: any[] = []

    // Check if query looks like a Dutch postcode
    const cleanedQuery = query.replace(/\s/g, '').toUpperCase()
    const looksLikePostcode = /^\d{4}[A-Z]{0,2}$/.test(cleanedQuery)

    if (looksLikePostcode && cleanedQuery.length >= 4) {
      // Try to geocode as postcode
      const fullPostcode = cleanedQuery.length === 4
        ? cleanedQuery + 'AA' // Add dummy letters if only digits
        : cleanedQuery.length === 5
        ? cleanedQuery + 'A'
        : cleanedQuery

      if (isValidDutchPostcode(fullPostcode)) {
        const geocoded = await geocodePostcode(fullPostcode)
        if (geocoded) {
          results = [{
            name: geocoded.city,
            lat: geocoded.latitude,
            lng: geocoded.longitude,
            province: geocoded.region,
            type: 'postcode',
            postcode: fullPostcode,
          }]
        }
      }
    }

    // If no postcode results, search by city name
    if (results.length === 0) {
      // First try static list for instant results
      const staticResults = searchCities(query, 5).map(city => ({
        name: city.name,
        lat: city.latitude,
        lng: city.longitude,
        province: city.province,
        type: 'static',
        population: city.population,
      }))

      console.log('[Passport Search] Static results:', staticResults.length)

      // Then try Nominatim for more results (but don't block on it)
      let nominatimResults: any[] = []
      try {
        nominatimResults = await searchViaNominatim(query)
        console.log('[Passport Search] Nominatim results:', nominatimResults.length)
      } catch (err) {
        console.error('[Passport Search] Nominatim error:', err)
        // Continue with static results only
      }

      // Merge results, preferring static (has population data)
      const staticNames = new Set(staticResults.map(r => r.name.toLowerCase()))
      const uniqueNominatim = nominatimResults.filter(
        r => !staticNames.has(r.name.toLowerCase())
      )

      results = [...staticResults, ...uniqueNominatim].slice(0, 10)
    }

    console.log('[Passport Search] Total results:', results.length)

    // Cache results
    searchCache.set(cacheKey, { results, timestamp: Date.now() })

    // Clean old cache entries periodically
    if (searchCache.size > 100) {
      const now = Date.now()
      Array.from(searchCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_TTL) {
          searchCache.delete(key)
        }
      })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching cities:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het zoeken', results: [] },
      { status: 500 }
    )
  }
}
