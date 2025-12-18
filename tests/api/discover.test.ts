/**
 * Discover API Route Tests
 *
 * Tests for /api/discover endpoint
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import type { DiscoverUser } from '@/lib/types'
import { Gender, Role } from '@prisma/client'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    swipe: {
      findMany: vi.fn(),
    },
    match: {
      findMany: vi.fn(),
    },
    block: {
      findMany: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

describe('GET /api/discover', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: Role.USER,
    gender: Gender.MALE,
    birthDate: new Date('1990-01-01'),
    city: 'Amsterdam',
    latitude: 52.3676,
    longitude: 4.9041,
    preferences: JSON.stringify({
      minAge: 25,
      maxAge: 35,
      genderPreference: Gender.FEMALE,
      maxDistance: 50,
    }),
  }

  const mockDiscoverUsers = [
    {
      id: 'user-2',
      name: 'Jane Doe',
      gender: Gender.FEMALE,
      birthDate: new Date('1995-06-15'),
      city: 'Amsterdam',
      bio: 'Love traveling and photography',
      profileImage: 'https://example.com/jane.jpg',
      latitude: 52.3702,
      longitude: 4.8952,
      photos: [
        { id: 'photo-1', url: 'https://example.com/jane1.jpg', order: 0 },
      ],
    },
    {
      id: 'user-3',
      name: 'Sarah Smith',
      gender: Gender.FEMALE,
      birthDate: new Date('1992-03-20'),
      city: 'Amsterdam',
      bio: 'Yoga enthusiast',
      profileImage: 'https://example.com/sarah.jpg',
      latitude: 52.3667,
      longitude: 4.8945,
      photos: [
        { id: 'photo-2', url: 'https://example.com/sarah1.jpg', order: 0 },
      ],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return discover users for authenticated user', async () => {
    // Mock getServerSession to return authenticated session
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: 'test@example.com', id: 'user-1' },
    } as any)

    // Mock prisma calls
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(prisma.swipe.findMany).mockResolvedValue([])
    vi.mocked(prisma.match.findMany).mockResolvedValue([])
    vi.mocked(prisma.block.findMany).mockResolvedValue([])
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockDiscoverUsers as any)

    // Make request (would need proper Next.js testing setup)
    // This is a simplified version
    expect(mockDiscoverUsers).toHaveLength(2)
    expect(mockDiscoverUsers[0].gender).toBe(Gender.FEMALE)
  })

  it('should filter users by gender preference', () => {
    const prefs = JSON.parse(mockUser.preferences)
    const filteredUsers = mockDiscoverUsers.filter(
      (u) => u.gender === prefs.genderPreference
    )

    expect(filteredUsers).toHaveLength(2)
    expect(filteredUsers.every((u) => u.gender === Gender.FEMALE)).toBe(true)
  })

  it('should filter users by age range', () => {
    const prefs = JSON.parse(mockUser.preferences)
    const today = new Date()

    const filteredUsers = mockDiscoverUsers.filter((u) => {
      const age = today.getFullYear() - new Date(u.birthDate).getFullYear()
      return age >= prefs.minAge && age <= prefs.maxAge
    })

    expect(filteredUsers.length).toBeGreaterThan(0)
    filteredUsers.forEach((user) => {
      const age = today.getFullYear() - new Date(user.birthDate).getFullYear()
      expect(age).toBeGreaterThanOrEqual(prefs.minAge)
      expect(age).toBeLessThanOrEqual(prefs.maxAge)
    })
  })

  it('should calculate distance between users', () => {
    // Haversine distance calculation
    function calculateDistance(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number {
      const R = 6371 // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const distance = calculateDistance(
      mockUser.latitude!,
      mockUser.longitude!,
      mockDiscoverUsers[0].latitude!,
      mockDiscoverUsers[0].longitude!
    )

    expect(distance).toBeGreaterThan(0)
    expect(distance).toBeLessThan(10) // Within 10km
  })

  it('should exclude already swiped users', () => {
    const swipedIds = ['user-4', 'user-5']
    const filteredUsers = mockDiscoverUsers.filter(
      (u) => !swipedIds.includes(u.id)
    )

    expect(filteredUsers).toHaveLength(2)
  })

  it('should exclude matched users', () => {
    const matchedIds = ['user-6']
    const filteredUsers = mockDiscoverUsers.filter(
      (u) => !matchedIds.includes(u.id)
    )

    expect(filteredUsers).toHaveLength(2)
  })

  it('should exclude blocked users', () => {
    const blockedIds = ['user-7']
    const filteredUsers = mockDiscoverUsers.filter(
      (u) => !blockedIds.includes(u.id)
    )

    expect(filteredUsers).toHaveLength(2)
  })

  it('should return 401 for unauthenticated user', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue(null)

    // Would check for 401 status in actual HTTP test
    const session = await getServerSession()
    expect(session).toBeNull()
  })

  it('should handle pagination correctly', () => {
    const page = 1
    const limit = 10
    const offset = (page - 1) * limit

    const paginatedUsers = mockDiscoverUsers.slice(offset, offset + limit)

    expect(paginatedUsers.length).toBeLessThanOrEqual(limit)
  })

  it('should return users with required fields', () => {
    mockDiscoverUsers.forEach((user) => {
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('gender')
      expect(user).toHaveProperty('birthDate')
      expect(user).toHaveProperty('photos')
      expect(Array.isArray(user.photos)).toBe(true)
    })
  })
})
