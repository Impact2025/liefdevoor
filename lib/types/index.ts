/**
 * Type Definitions Index
 *
 * Central export point for all application types.
 * Import from here to keep imports clean and organized.
 *
 * Usage:
 *   import { ApiResponse, UserProfile, Match } from '@/lib/types'
 */

// Re-export all API types
export * from './api'

// Re-export all Blog types
export * from './blog'

// Re-export Prisma types that are commonly used
export { Gender, Role } from '@prisma/client'
