/**
 * Geocoding Service
 *
 * Wereldklasse location services:
 * - Dutch postcode → GPS coordinates
 * - City autocomplete
 * - Privacy-first region display
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface GeocodingResult {
  latitude: number
  longitude: number
  city: string
  region?: string
  country: string
}

export interface CityOption {
  name: string
  province: string
  latitude: number
  longitude: number
  population?: number
}

/**
 * Geocode Dutch postcode to coordinates using Nominatim (OpenStreetMap)
 * Free, no API key required, already in CSP whitelist
 */
export async function geocodePostcode(postcode: string): Promise<GeocodingResult | null> {
  try {
    // Clean postcode (remove spaces)
    const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase()

    // Validate Dutch postcode format (1234AB)
    if (!isValidDutchPostcode(cleanedPostcode)) {
      throw new Error('Invalid Dutch postcode format')
    }

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
      throw new Error('Geocoding API error')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return null
    }

    const result = data[0]

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city: result.address.city || result.address.town || result.address.village || '',
      region: result.address.state || result.address.county,
      country: result.address.country,
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Geocode city name to coordinates
 */
export async function geocodeCity(cityName: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `city=${encodeURIComponent(cityName)}&` +
      `country=nl&` +
      `format=json&` +
      `limit=1&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LiefdeVoorIedereen/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding API error')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return null
    }

    const result = data[0]

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city: result.address.city || result.address.town || result.address.village || cityName,
      region: result.address.state || result.address.county,
      country: result.address.country,
    }
  } catch (error) {
    console.error('City geocoding error:', error)
    return null
  }
}

/**
 * Reverse geocode coordinates to address (privacy-aware)
 * Returns region/city instead of exact address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city: string; region?: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${latitude}&` +
      `lon=${longitude}&` +
      `format=json&` +
      `zoom=12`, // zoom=12 gives city-level, not street-level (privacy!)
      {
        headers: {
          'User-Agent': 'LiefdeVoorIedereen/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Reverse geocoding error')
    }

    const data = await response.json()

    return {
      city: data.address.city || data.address.town || data.address.village || '',
      region: data.address.state || data.address.county,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * Validate Dutch postcode format
 * Format: 1234AB (4 digits + 2 letters)
 */
export function isValidDutchPostcode(postcode: string): boolean {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase()
  const regex = /^[1-9][0-9]{3}[A-Z]{2}$/
  return regex.test(cleaned)
}

/**
 * Format Dutch postcode with space
 * 1234AB → 1234 AB
 */
export function formatDutchPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase()

  if (!isValidDutchPostcode(cleaned)) {
    return postcode // Return as-is if invalid
  }

  return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
}

/**
 * Calculate fuzzy distance for privacy
 * Returns rounded distance instead of exact
 */
export function fuzzyDistance(distanceKm: number): string {
  if (distanceKm < 1) return '< 1 km'
  if (distanceKm < 5) return `~${Math.round(distanceKm)} km`
  if (distanceKm < 10) return `~${Math.round(distanceKm / 5) * 5} km`
  if (distanceKm < 50) return `~${Math.round(distanceKm / 10) * 10} km`
  return `${Math.round(distanceKm / 50) * 50}+ km`
}

/**
 * Get region display name (privacy-aware)
 * Shows "Amsterdam" instead of exact neighborhood
 */
export function getRegionDisplay(city: string, region?: string): string {
  // For major cities, just show city name
  const majorCities = [
    'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht',
    'Eindhoven', 'Groningen', 'Tilburg', 'Almere'
  ]

  if (majorCities.includes(city)) {
    return city
  }

  // For smaller cities, show "City, Province"
  return region ? `${city}, ${region}` : city
}

/**
 * Major Dutch cities for autocomplete (top 100 by population)
 * This is a static list for fast autocomplete without API calls
 */
export const DUTCH_CITIES: CityOption[] = [
  { name: 'Amsterdam', province: 'Noord-Holland', latitude: 52.3676, longitude: 4.9041, population: 872680 },
  { name: 'Rotterdam', province: 'Zuid-Holland', latitude: 51.9225, longitude: 4.47917, population: 651446 },
  { name: 'Den Haag', province: 'Zuid-Holland', latitude: 52.0705, longitude: 4.3007, population: 544766 },
  { name: 'Utrecht', province: 'Utrecht', latitude: 52.0907, longitude: 5.1214, population: 357179 },
  { name: 'Eindhoven', province: 'Noord-Brabant', latitude: 51.4416, longitude: 5.4697, population: 234456 },
  { name: 'Groningen', province: 'Groningen', latitude: 53.2194, longitude: 6.5665, population: 233218 },
  { name: 'Tilburg', province: 'Noord-Brabant', latitude: 51.5656, longitude: 5.0919, population: 219800 },
  { name: 'Almere', province: 'Flevoland', latitude: 52.3508, longitude: 5.2647, population: 211840 },
  { name: 'Breda', province: 'Noord-Brabant', latitude: 51.5719, longitude: 4.7683, population: 184271 },
  { name: 'Nijmegen', province: 'Gelderland', latitude: 51.8426, longitude: 5.8526, population: 177659 },
  { name: 'Enschede', province: 'Overijssel', latitude: 52.2215, longitude: 6.8937, population: 159732 },
  { name: 'Apeldoorn', province: 'Gelderland', latitude: 52.2112, longitude: 5.9699, population: 163818 },
  { name: 'Haarlem', province: 'Noord-Holland', latitude: 52.3874, longitude: 4.6462, population: 162543 },
  { name: 'Amersfoort', province: 'Utrecht', latitude: 52.1561, longitude: 5.3878, population: 158551 },
  { name: 'Arnhem', province: 'Gelderland', latitude: 51.9851, longitude: 5.8987, population: 161368 },
  { name: 'Zaanstad', province: 'Noord-Holland', latitude: 52.4500, longitude: 4.8250, population: 156711 },
  { name: 'Haarlemmermeer', province: 'Noord-Holland', latitude: 52.3040, longitude: 4.6890, population: 156039 },
  { name: 'Den Bosch', province: 'Noord-Brabant', latitude: 51.6978, longitude: 5.3037, population: 155113 },
  { name: 'Zwolle', province: 'Overijssel', latitude: 52.5168, longitude: 6.0830, population: 130592 },
  { name: 'Zoetermeer', province: 'Zuid-Holland', latitude: 52.0575, longitude: 4.4932, population: 125283 },
  { name: 'Leiden', province: 'Zuid-Holland', latitude: 52.1601, longitude: 4.4970, population: 125174 },
  { name: 'Maastricht', province: 'Limburg', latitude: 50.8514, longitude: 5.6909, population: 121558 },
  { name: 'Dordrecht', province: 'Zuid-Holland', latitude: 51.8133, longitude: 4.6901, population: 119260 },
  { name: 'Ede', province: 'Gelderland', latitude: 52.0333, longitude: 5.6500, population: 118426 },
  { name: 'Alphen aan den Rijn', province: 'Zuid-Holland', latitude: 52.1281, longitude: 4.6573, population: 112587 },
  { name: 'Westland', province: 'Zuid-Holland', latitude: 51.9833, longitude: 4.2167, population: 110357 },
  { name: 'Alkmaar', province: 'Noord-Holland', latitude: 52.6325, longitude: 4.7473, population: 109896 },
  { name: 'Emmen', province: 'Drenthe', latitude: 52.7792, longitude: 6.9003, population: 107055 },
  { name: 'Delft', province: 'Zuid-Holland', latitude: 52.0116, longitude: 4.3571, population: 103659 },
  { name: 'Venlo', province: 'Limburg', latitude: 51.3704, longitude: 6.1724, population: 101797 },
]

/**
 * Search cities by name (fuzzy matching)
 */
export function searchCities(query: string, limit: number = 10): CityOption[] {
  if (!query || query.length < 2) return []

  const lowerQuery = query.toLowerCase()

  return DUTCH_CITIES
    .filter(city => city.name.toLowerCase().includes(lowerQuery))
    .slice(0, limit)
    .sort((a, b) => {
      // Prioritize cities that start with the query
      const aStarts = a.name.toLowerCase().startsWith(lowerQuery)
      const bStarts = b.name.toLowerCase().startsWith(lowerQuery)

      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      // Then sort by population
      return (b.population || 0) - (a.population || 0)
    })
}
