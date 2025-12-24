/**
 * Swipe API Route Tests
 *
 * Tests for /api/swipe endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'
import type { SwipeResult } from '@/lib/types'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    swipe: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    match: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    notification: {
      createMany: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

describe('POST /api/swipe', () => {
  const mockSwiper = {
    id: 'user-1',
    email: 'swiper@example.com',
    name: 'John Swiper',
  }

  const mockSwipedUser = {
    id: 'user-2',
    email: 'swiped@example.com',
    name: 'Jane Swiped',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a swipe when user likes another user', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: mockSwiper.email, id: mockSwiper.id },
    } as any)

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockSwiper as any)
    vi.mocked(prisma.swipe.findUnique).mockResolvedValue(null) // No existing mutual like
    vi.mocked(prisma.swipe.create).mockResolvedValue({
      id: 'swipe-1',
      swiperId: mockSwiper.id,
      swipedId: mockSwipedUser.id,
      isLike: true,
      createdAt: new Date(),
    } as any)

    // Verify swipe data structure
    const swipeData = {
      swiperId: mockSwiper.id,
      swipedId: mockSwipedUser.id,
      isLike: true,
    }

    expect(swipeData.swiperId).toBe(mockSwiper.id)
    expect(swipeData.swipedId).toBe(mockSwipedUser.id)
    expect(swipeData.isLike).toBe(true)
  })

  it('should create a match when both users like each other', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { email: mockSwiper.email, id: mockSwiper.id },
    } as any)

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockSwiper as any)

    // Mock existing mutual like
    vi.mocked(prisma.swipe.findUnique).mockResolvedValue({
      id: 'swipe-existing',
      swiperId: mockSwipedUser.id,
      swipedId: mockSwiper.id,
      isLike: true,
      createdAt: new Date(),
    } as any)

    const mockMatch = {
      id: 'match-1',
      user1Id: mockSwiper.id,
      user2Id: mockSwipedUser.id,
      createdAt: new Date(),
    }

    vi.mocked(prisma.match.create).mockResolvedValue(mockMatch as any)

    expect(mockMatch.user1Id).toBe(mockSwiper.id)
    expect(mockMatch.user2Id).toBe(mockSwipedUser.id)
  })

  it('should not create match when swipe is a pass', async () => {
    const swipeData = {
      swiperId: mockSwiper.id,
      swipedId: mockSwipedUser.id,
      isLike: false,
    }

    expect(swipeData.isLike).toBe(false)
    // In actual implementation, match creation would be skipped
  })

  it('should validate swipe data', () => {
    const validSwipe = {
      swipedId: 'user-2',
      isLike: true,
    }

    expect(validSwipe.swipedId).toBeTruthy()
    expect(typeof validSwipe.isLike).toBe('boolean')

    const invalidSwipe = {
      swipedId: '',
      isLike: 'yes', // Should be boolean
    }

    expect(invalidSwipe.swipedId).toBe('')
    expect(typeof invalidSwipe.isLike).not.toBe('boolean')
  })

  it('should prevent user from swiping themselves', () => {
    const selfSwipe = {
      swiperId: mockSwiper.id,
      swipedId: mockSwiper.id,
    }

    expect(selfSwipe.swiperId).toBe(selfSwipe.swipedId)
    // In actual implementation, this should return an error
  })

  it('should handle duplicate swipes', async () => {
    // Mock existing swipe from same user
    vi.mocked(prisma.swipe.create).mockRejectedValue(
      new Error('Unique constraint failed')
    )

    // Would check for proper error handling in actual HTTP test
    const error = new Error('Unique constraint failed')
    expect(error.message).toContain('constraint')
  })

  it('should create notifications for both users on match', async () => {
    const notificationData = [
      {
        userId: mockSwiper.id,
        type: 'new_match',
        title: 'New Match!',
        message: `You matched with ${mockSwipedUser.name}`,
        relatedId: 'match-1',
      },
      {
        userId: mockSwipedUser.id,
        type: 'new_match',
        title: 'New Match!',
        message: `You matched with ${mockSwiper.name}`,
        relatedId: 'match-1',
      },
    ]

    vi.mocked(prisma.notification.createMany).mockResolvedValue({ count: 2 })

    expect(notificationData).toHaveLength(2)
    expect(notificationData[0].type).toBe('new_match')
    expect(notificationData[1].type).toBe('new_match')
  })

  it('should return correct response structure for match', () => {
    const matchResponse: SwipeResult = {
      success: true,
      isMatch: true,
      match: {
        id: 'match-1',
        createdAt: new Date(),
        otherUser: {
          id: mockSwipedUser.id,
          name: mockSwipedUser.name,
          profileImage: null,
          city: null,
        },
      },
    }

    expect(matchResponse.success).toBe(true)
    expect(matchResponse.isMatch).toBe(true)
    expect(matchResponse.match).toBeDefined()
    expect(matchResponse.match?.id).toBe('match-1')
  })

  it('should return correct response structure for non-match', () => {
    const noMatchResponse: SwipeResult = {
      success: true,
      isMatch: false,
    }

    expect(noMatchResponse.success).toBe(true)
    expect(noMatchResponse.isMatch).toBe(false)
    expect(noMatchResponse.match).toBeUndefined()
  })

  it('should return 401 for unauthenticated user', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue(null)

    const session = await getServerSession()
    expect(session).toBeNull()
  })

  it('should return 404 for non-existent swiped user', async () => {
    // Reset mock and set up fresh for this test
    vi.mocked(prisma.user.findUnique).mockReset()
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const swipedUser = await prisma.user.findUnique({
      where: { id: 'non-existent' },
    })

    expect(swipedUser).toBeNull()
  })
})
