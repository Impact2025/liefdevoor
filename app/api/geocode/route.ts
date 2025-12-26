/**
 * Geocoding API Route
 *
 * Proxies geocoding requests to avoid CORS issues
 * Client-side components call this instead of directly calling Nominatim
 */

import { NextRequest, NextResponse } from 'next/server'
import { isValidDutchPostcode } from '@/lib/services/geocoding'

/**
 * POST /api/geocode
 *
 * Geocode a Dutch postcode to coordinates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postcode } = body

    if (!postcode || typeof postcode !== 'string') {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      )
    }

    // Clean and validate postcode
    const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase()

    if (!isValidDutchPostcode(cleanedPostcode)) {
      return NextResponse.json(
        { error: 'Invalid Dutch postcode format' },
        { status: 400 }
      )
    }

    // Call Nominatim API (server-side, no CORS)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `postalcode=${cleanedPostcode}&` +
      `country=nl&` +
      `format=json&` +
      `limit=1&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LiefdeVoorIedereen/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Geocoding API error' },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Postcode not found' },
        { status: 404 }
      )
    }

    const result = data[0]

    return NextResponse.json({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city: result.address.city || result.address.town || result.address.village || '',
      region: result.address.state || result.address.county,
      country: result.address.country,
    })
  } catch (error) {
    console.error('[Geocode API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
