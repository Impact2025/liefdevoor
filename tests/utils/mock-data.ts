/**
 * Mock Data Factories
 *
 * Factory functions for creating test data
 */

import type { User, Match, Message, Swipe, Subscription } from '@prisma/client'
import type { UserProfile } from '@/lib/types'

/**
 * Create mock user
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    emailVerified: new Date(),
    name: 'Test User',
    bio: 'Test bio',
    birthDate: new Date('1990-01-01'),
    gender: 'male',
    city: 'Amsterdam',
    postcode: '1000AB',
    latitude: 52.3676,
    longitude: 4.9041,
    interests: 'hiking, reading',
    profileImage: 'https://example.com/profile.jpg',
    safetyScore: 100,
    role: 'USER',
    preferences: JSON.stringify({
      genderPreference: 'female',
      minAge: 25,
      maxAge: 35,
      maxDistance: 50,
    }),
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock user profile
 */
export function createMockProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    bio: 'Test bio',
    birthDate: '1990-01-01',
    gender: 'male',
    city: 'Amsterdam',
    postcode: '1000AB',
    interests: 'hiking, reading',
    profileImage: 'https://example.com/profile.jpg',
    safetyScore: 100,
    isVerified: true,
    preferences: {
      genderPreference: 'female',
      minAge: 25,
      maxAge: 35,
      maxDistance: 50,
    },
    ...overrides,
  }
}

/**
 * Create mock match
 */
export function createMockMatch(overrides?: Partial<Match>): Match {
  return {
    id: 'match-123',
    user1Id: 'user-123',
    user2Id: 'user-456',
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock message
 */
export function createMockMessage(overrides?: Partial<Message>): Message {
  return {
    id: 'message-123',
    matchId: 'match-123',
    senderId: 'user-123',
    content: 'Hello!',
    audioUrl: null,
    read: false,
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock swipe
 */
export function createMockSwipe(overrides?: Partial<Swipe>): Swipe {
  return {
    id: 'swipe-123',
    swiperId: 'user-123',
    swipedId: 'user-456',
    isLike: true,
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Create mock subscription
 */
export function createMockSubscription(overrides?: Partial<Subscription>): Subscription {
  return {
    id: 'sub-123',
    userId: 'user-123',
    plan: 'premium',
    status: 'active',
    multisafepayId: null,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides,
  }
}

/**
 * Create multiple mock users
 */
export function createMockUsers(count: number, overrides?: Partial<User>[]): User[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `user-${i}`,
      email: `user${i}@example.com`,
      name: `User ${i}`,
      ...overrides?.[i],
    })
  )
}
