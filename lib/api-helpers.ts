/**
 * API Helper Functions
 *
 * Reusable functions for API routes to reduce code duplication
 * and ensure consistent responses across all endpoints.
 */

import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { validateCSRF } from './csrf'
import type { ApiResponse, ApiError as ApiErrorType, Pagination } from './types'

// ==============================================
// AUTHENTICATION HELPERS
// ==============================================

/**
 * Get the current authenticated user from session
 *
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      isVerified: true,
      safetyScore: true,
    },
  })

  return user
}

/**
 * Get the current user's ID from session
 *
 * @returns User ID string or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * Require authentication - throws error if not authenticated
 *
 * @returns Authenticated user
 * @throws 401 error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new ApiAuthError('Authentication required')
  }
  return user
}

/**
 * Require admin role - throws error if not admin
 *
 * @returns Authenticated admin user
 * @throws 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new ApiForbiddenError('Admin access required')
  }
  return user
}

/**
 * Require valid CSRF token - throws error if invalid
 *
 * @param request - Next.js request object
 * @throws 403 error if CSRF validation fails
 */
export async function requireCSRF(request: NextRequest): Promise<void> {
  const result = await validateCSRF(request)
  if (!result.valid) {
    throw new ApiForbiddenError(result.error || 'CSRF validation failed')
  }
}

// ==============================================
// DATA FETCHING HELPERS
// ==============================================

/**
 * Get list of blocked user IDs for a user
 * Includes both users they blocked and users who blocked them
 *
 * @param userId - User ID to check
 * @returns Array of blocked user IDs
 */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const blocks = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: { blockerId: true, blockedId: true },
  })

  return blocks
    .flatMap((b) => [b.blockerId, b.blockedId])
    .filter((id) => id !== userId)
}

/**
 * Get user's match IDs
 *
 * @param userId - User ID
 * @returns Array of user IDs they're matched with
 */
export async function getMatchedUserIds(userId: string): Promise<string[]> {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    select: { user1Id: true, user2Id: true },
  })

  return matches
    .flatMap((m) => [m.user1Id, m.user2Id])
    .filter((id) => id !== userId)
}

/**
 * Get user's swiped IDs
 *
 * @param userId - User ID
 * @returns Array of user IDs they've swiped on
 */
export async function getSwipedUserIds(userId: string): Promise<string[]> {
  const swipes = await prisma.swipe.findMany({
    where: { swiperId: userId },
    select: { swipedId: true },
  })

  return swipes.map((s) => s.swipedId)
}

/**
 * Check if two users are matched
 *
 * @param user1Id - First user ID
 * @param user2Id - Second user ID
 * @returns true if matched, false otherwise
 */
export async function areUsersMatched(
  user1Id: string,
  user2Id: string
): Promise<boolean> {
  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { user1Id: user1Id, user2Id: user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
    },
  })

  return !!match
}

/**
 * Check if user has active subscription
 *
 * @param userId - User ID
 * @returns true if has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    },
  })

  return !!subscription
}

// ==============================================
// RESPONSE HELPERS
// ==============================================

/**
 * Create a success response
 *
 * @param data - Response data
 * @param pagination - Optional pagination metadata
 * @returns NextResponse with success structure
 */
export function successResponse<T>(
  data: T,
  pagination?: Pagination
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(pagination && { pagination }),
  })
}

/**
 * Create an error response
 *
 * @param code - Error code
 * @param message - Error message
 * @param status - HTTP status code (default 400)
 * @param field - Optional field name for validation errors
 * @returns NextResponse with error structure
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  field?: string
): NextResponse<ApiResponse<never>> {
  const error: ApiErrorType = { code, message }
  if (field) error.field = field

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

/**
 * Create a validation error response
 *
 * @param field - Field that failed validation
 * @param message - Validation error message
 * @returns 400 response with validation error
 */
export function validationError(field: string, message: string) {
  return errorResponse('VALIDATION_ERROR', message, 400, field)
}

/**
 * Create a not found error response
 *
 * @param resource - Resource type (e.g., "User", "Post")
 * @returns 404 response
 */
export function notFoundError(resource: string) {
  return errorResponse('NOT_FOUND', `${resource} not found`, 404)
}

/**
 * Create an unauthorized error response
 *
 * @param message - Optional custom message
 * @returns 401 response
 */
export function unauthorizedError(message = 'Authentication required') {
  return errorResponse('UNAUTHORIZED', message, 401)
}

/**
 * Create a forbidden error response
 *
 * @param message - Optional custom message
 * @returns 403 response
 */
export function forbiddenError(message = 'Access forbidden') {
  return errorResponse('FORBIDDEN', message, 403)
}

// ==============================================
// CUSTOM ERROR CLASSES
// ==============================================

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public field?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Authentication Error (401)
 */
export class ApiAuthError extends ApiError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'ApiAuthError'
  }
}

/**
 * Forbidden Error (403)
 */
export class ApiForbiddenError extends ApiError {
  constructor(message = 'Access forbidden') {
    super('FORBIDDEN', message, 403)
    this.name = 'ApiForbiddenError'
  }
}

/**
 * Not Found Error (404)
 */
export class ApiNotFoundError extends ApiError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
    this.name = 'ApiNotFoundError'
  }
}

/**
 * Validation Error (400)
 */
export class ApiValidationError extends ApiError {
  constructor(message: string, field?: string) {
    super('VALIDATION_ERROR', message, 400, field)
    this.name = 'ApiValidationError'
  }
}

// ==============================================
// ERROR HANDLER
// ==============================================

/**
 * Handle API errors consistently
 *
 * Usage in try/catch blocks:
 *   try {
 *     // ... API logic
 *   } catch (error) {
 *     return handleApiError(error)
 *   }
 *
 * @param error - Any error object
 * @returns Appropriate error response
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle our custom API errors
  if (error instanceof ApiError) {
    return errorResponse(error.code, error.message, error.status, error.field)
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string } }

    switch (prismaError.code) {
      case 'P2002':
        return errorResponse(
          'DUPLICATE_ENTRY',
          'A record with this value already exists',
          409
        )
      case 'P2025':
        return notFoundError('Record')
      default:
        return errorResponse(
          'DATABASE_ERROR',
          'A database error occurred',
          500
        )
    }
  }

  // Generic error fallback
  return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500)
}

// ==============================================
// PAGINATION HELPERS
// ==============================================

/**
 * Calculate pagination metadata
 *
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination object
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): Pagination {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Parse pagination query parameters
 *
 * @param searchParams - URLSearchParams object
 * @returns Object with page, limit, and offset
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

// ==============================================
// VALIDATION HELPERS
// ==============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * Requirements: min 8 chars, at least one number, one letter
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false
  if (!/[a-zA-Z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  return true
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Check if user is at least 18 years old
 */
export function isAtLeast18(birthDate: Date): boolean {
  return calculateAge(birthDate) >= 18
}

// ==============================================
// ZOD VALIDATION HELPERS
// ==============================================

import { z } from 'zod'

/**
 * Validate request body against a Zod schema
 *
 * @example
 * const validation = await validateBody(request, loginSchema)
 * if (!validation.success) {
 *   return validationError(validation.field, validation.message)
 * }
 * const { email, password } = validation.data
 *
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error details
 */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; field: string; message: string; errors: z.ZodError }
> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]
      const field = firstError.path.join('.') || 'unknown'
      const message = firstError.message

      return {
        success: false,
        field,
        message,
        errors: result.error,
      }
    }

    return {
      success: true,
      data: result.data,
    }
  } catch (error) {
    return {
      success: false,
      field: 'body',
      message: 'Invalid JSON in request body',
      errors: new z.ZodError([]),
    }
  }
}

/**
 * Validate query parameters against a Zod schema
 *
 * @param searchParams - URLSearchParams object
 * @param schema - Zod schema to validate against
 * @returns Validation result with typed data or error details
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
):
  | { success: true; data: T }
  | { success: false; field: string; message: string }
{
  const params = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(params)

  if (!result.success) {
    const firstError = result.error.issues[0]
    const field = firstError.path.join('.') || 'unknown'
    const message = firstError.message

    return { success: false, field, message }
  }

  return { success: true, data: result.data }
}

/**
 * Format Zod errors for better readability
 *
 * @param error - Zod error object
 * @returns Record of field names to error messages
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}

  error.issues.forEach((err) => {
    const path = err.path.join('.') || 'unknown'
    formatted[path] = err.message
  })

  return formatted
}
