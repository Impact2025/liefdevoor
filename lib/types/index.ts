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

// Re-export Prisma types that are commonly used
export { Gender, Role } from '@prisma/client'
