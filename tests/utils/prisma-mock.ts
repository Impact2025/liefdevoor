/**
 * Prisma Mock Utilities
 *
 * Helper functions for mocking Prisma client in tests
 */

import { vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import type { DeepMockProxy } from 'vitest-mock-extended'

/**
 * Create a mock Prisma client
 */
export function createMockPrismaClient() {
  return {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    match: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    swipe: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    block: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    post: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  } as unknown as DeepMockProxy<PrismaClient>
}

/**
 * Reset all Prisma mocks
 */
export function resetPrismaMocks(prismaMock: DeepMockProxy<PrismaClient>) {
  Object.values(prismaMock).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockClear' in method) {
          method.mockClear()
        }
      })
    }
  })
}

/**
 * Mock Prisma for testing
 */
export const prismaMock = createMockPrismaClient()
