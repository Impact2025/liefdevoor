import { NextRequest } from 'next/server'
import { requireAuth, requireCSRF, successResponse, handleApiError, validationError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { getCachedProfile } from '@/lib/cache'
import type { UserProfile, UserPreferences } from '@/lib/types'
import type { Gender } from '@prisma/client'

// Geocode postcode to lat/lng
async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Check if Dutch postcode (1234AB)
    const dutchRegex = /^[0-9]{4}[A-Z]{2}$/
    // Check if Belgian postcode (1000)
    const belgianRegex = /^[0-9]{4}$/

    let country = ''
    if (dutchRegex.test(postcode.toUpperCase())) {
      country = 'Netherlands'
    } else if (belgianRegex.test(postcode)) {
      country = 'Belgium'
    } else {
      return null // Invalid format
    }

    const url = `https://nominatim.openstreetmap.org/search?country=${country}&postalcode=${postcode}&format=json&limit=1`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LiefdeVoorIedereen/1.0'
      }
    })

    if (!response.ok) return null

    const data = await response.json()
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }

    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * GET /api/profile
 *
 * Fetch current user's profile with caching
 */
export async function GET() {
  try {
    const user = await requireAuth()
    const profile = await getCachedProfile(user.id)

    if (!profile) {
      throw new Error('Profile not found')
    }

    return successResponse({ profile })
  } catch (error) {
    return handleApiError(error)
  }
}

interface ProfileUpdateData {
  name?: string
  bio?: string | null
  birthDate?: string | null
  gender?: string
  city?: string | null
  postcode?: string | null
  interests?: string | null
  preferences?: UserPreferences | null
  latitude?: number | null
  longitude?: number | null
  // Lifestyle fields
  occupation?: string | null
  education?: string | null
  height?: number | null
  drinking?: string | null
  smoking?: string | null
  children?: string | null
}

/**
 * Validate profile update data
 */
function validateProfileUpdate(data: ProfileUpdateData): string | null {
  const { name, birthDate, gender, postcode } = data

  // Name validation
  if (name !== undefined && (!name || !name.trim())) {
    return 'Name is required'
  }

  // Birth date validation
  if (birthDate) {
    const birthDateObj = new Date(birthDate)
    if (isNaN(birthDateObj.getTime())) {
      return 'Invalid birth date'
    }
    const age = new Date().getFullYear() - birthDateObj.getFullYear()
    if (age < 18) {
      return 'You must be at least 18 years old'
    }
  }

  // Gender validation
  const validGenders = ['male', 'female', 'non-binary', 'other']
  if (gender && !validGenders.includes(gender.toLowerCase())) {
    return 'Invalid gender'
  }

  // Postcode validation (only if postcode is provided and not empty)
  if (postcode && postcode.trim()) {
    const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase()
    const dutchRegex = /^[0-9]{4}[A-Z]{2}$/
    const belgianRegex = /^[0-9]{4}$/
    if (!dutchRegex.test(cleanedPostcode) && !belgianRegex.test(cleanedPostcode)) {
      return 'Invalid postcode format. Use Dutch (1234AB) or Belgian (1000) format.'
    }
  }

  return null
}

/**
 * Update user profile with geocoding
 */
async function updateProfile(userId: string, data: ProfileUpdateData): Promise<UserProfile> {
  const {
    name, bio, birthDate, gender, city, postcode, interests, preferences, latitude, longitude,
    occupation, education, height, drinking, smoking, children
  } = data

  // Use provided coordinates or geocode from postcode
  let coordinates: { lat: number; lng: number } | null = null

  // If latitude/longitude are directly provided (from city autocomplete), use them
  if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
    coordinates = { lat: latitude, lng: longitude }
  }
  // Otherwise, try to geocode from postcode
  else if (postcode) {
    coordinates = await geocodePostcode(postcode)
    if (!coordinates) {
      throw new Error('Could not geocode postcode. Please check if it exists.')
    }
  }

  // Prepare update data
  const updateData: any = {}
  if (name !== undefined) updateData.name = name.trim()
  if (bio !== undefined) updateData.bio = bio ? bio.trim() : null
  if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null
  if (gender !== undefined) updateData.gender = gender ? (gender.toUpperCase() as Gender) : null
  if (city !== undefined) updateData.city = city ? city.trim() : null
  if (postcode !== undefined) updateData.postcode = postcode ? postcode.trim().toUpperCase() : null
  if (interests !== undefined) updateData.interests = interests ? interests.trim() : null
  // Prisma handles JSON serialization automatically for Json fields - don't use JSON.stringify()
  if (preferences !== undefined) updateData.preferences = preferences || null
  // Lifestyle fields
  if (occupation !== undefined) updateData.occupation = occupation ? occupation.trim() : null
  if (education !== undefined) updateData.education = education ? education.trim() : null
  if (height !== undefined) updateData.height = height || null
  if (drinking !== undefined) updateData.drinking = drinking || null
  if (smoking !== undefined) updateData.smoking = smoking || null
  if (children !== undefined) updateData.children = children || null
  if (coordinates) {
    updateData.latitude = coordinates.lat
    updateData.longitude = coordinates.lng
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      birthDate: true,
      gender: true,
      city: true,
      postcode: true,
      interests: true,
      preferences: true,
      profileImage: true,
      voiceIntro: true,
      role: true,
      isVerified: true,
      safetyScore: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      photos: true,
      // Lifestyle fields
      occupation: true,
      education: true,
      height: true,
      drinking: true,
      smoking: true,
      children: true,
    },
  })

  return {
    ...updatedUser,
    preferences: updatedUser.preferences || null,
    birthDate: updatedUser.birthDate ? updatedUser.birthDate.toISOString().split('T')[0] : null,
  } as UserProfile
}

/**
 * PUT /api/profile
 *
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    await requireCSRF(request)
    const user = await requireAuth()

    const body: ProfileUpdateData = await request.json()

    // Validate input
    const error = validateProfileUpdate(body)
    if (error) {
      return validationError('profile', error)
    }

    const profile = await updateProfile(user.id, body)

    return successResponse({ profile })
  } catch (error) {
    return handleApiError(error)
  }
}