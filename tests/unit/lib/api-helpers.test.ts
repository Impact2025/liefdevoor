/**
 * Tests for API Helper Functions
 *
 * Testing all helpers from lib/api-helpers.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  requireAuth,
  requireAdmin,
  requireCSRF,
  successResponse,
  errorResponse,
  validationError,
  handleApiError,
  ApiError,
  ApiAuthError,
  ApiForbiddenError,
  ApiNotFoundError,
  ApiValidationError,
} from '@/lib/api-helpers'

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/csrf', () => ({
  validateCSRF: vi.fn(),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { validateCSRF } from '@/lib/csrf'
import { createMockUser } from '../../utils/mock-data'

describe('API Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Custom Error Classes', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('TEST_ERROR', 'Test error', 500)

      expect(error).toBeInstanceOf(Error)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(500)
      expect(error.field).toBeUndefined()
    })

    it('should create ApiAuthError (401)', () => {
      const error = new ApiAuthError('Not authenticated')

      expect(error.status).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('should create ApiForbiddenError (403)', () => {
      const error = new ApiForbiddenError('Access denied')

      expect(error.status).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })

    it('should create ApiNotFoundError (404)', () => {
      const error = new ApiNotFoundError('Resource not found')

      expect(error.status).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create ApiValidationError with field', () => {
      const error = new ApiValidationError('Invalid email', 'email')

      expect(error.status).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.field).toBe('email')
    })
  })

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = createMockUser()

      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      })

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

      const result = await requireAuth()

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }))
    })

    it('should throw ApiAuthError when no session', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      await expect(requireAuth()).rejects.toThrow(ApiAuthError)
      await expect(requireAuth()).rejects.toThrow('Authentication required')
    })

    it('should throw ApiAuthError when user not found in database', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: 'test@example.com' },
        expires: new Date().toISOString(),
      })

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(requireAuth()).rejects.toThrow(ApiAuthError)
    })
  })

  describe('requireAdmin', () => {
    it('should return admin user when role is ADMIN', async () => {
      const mockAdmin = createMockUser({ role: 'ADMIN' })

      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: mockAdmin.email },
        expires: new Date().toISOString(),
      })

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdmin)

      const result = await requireAdmin()

      expect(result.role).toBe('ADMIN')
    })

    it('should throw ApiForbiddenError when role is not ADMIN', async () => {
      const mockUser = createMockUser({ role: 'USER' })

      vi.mocked(getServerSession).mockResolvedValue({
        user: { email: mockUser.email },
        expires: new Date().toISOString(),
      })

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

      await expect(requireAdmin()).rejects.toThrow(ApiForbiddenError)
      await expect(requireAdmin()).rejects.toThrow('Admin access required')
    })
  })

  describe('requireCSRF', () => {
    it('should pass when CSRF validation succeeds', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
      })

      vi.mocked(validateCSRF).mockResolvedValue({ valid: true })

      await expect(requireCSRF(request)).resolves.not.toThrow()
    })

    it('should throw ApiForbiddenError when CSRF validation fails', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
      })

      vi.mocked(validateCSRF).mockResolvedValue({
        valid: false,
        error: 'Invalid origin',
      })

      await expect(requireCSRF(request)).rejects.toThrow(ApiForbiddenError)
      await expect(requireCSRF(request)).rejects.toThrow('Invalid origin')
    })
  })

  describe('Response Helpers', () => {
    describe('successResponse', () => {
      it('should return success response with data', () => {
        const data = { message: 'Success' }
        const response = successResponse(data)

        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).toBe(200)
      })

      it('should include pagination when provided', () => {
        const data = { items: [] }
        const pagination = { page: 1, limit: 10, total: 100, totalPages: 10 }

        const response = successResponse(data, pagination)

        expect(response).toBeInstanceOf(NextResponse)
      })
    })

    describe('errorResponse', () => {
      it('should return error response with correct structure', () => {
        const response = errorResponse('not_found', 'User not found', 404)

        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).toBe(404)
      })

      it('should include field when provided', () => {
        const response = errorResponse('validation_error', 'Invalid email', 400, 'email')

        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).toBe(400)
      })
    })

    describe('validationError', () => {
      it('should return 400 validation error', () => {
        const response = validationError('email', 'Email is required')

        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).toBe(400)
      })
    })
  })

  describe('handleApiError', () => {
    it('should handle ApiError correctly', () => {
      const error = new ApiNotFoundError('User not found')
      const response = handleApiError(error)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(404)
    })

    it('should handle Prisma UniqueConstraintError', () => {
      const error = new Error('Unique constraint failed')
      error.name = 'PrismaClientKnownRequestError'
      ;(error as any).code = 'P2002'

      const response = handleApiError(error)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(409)
    })

    it('should handle generic errors as 500', () => {
      const error = new Error('Something went wrong')

      const response = handleApiError(error)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
    })

    it('should handle non-Error objects', () => {
      const error = 'String error'

      const response = handleApiError(error)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(500)
    })
  })
})
