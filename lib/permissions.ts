/**
 * Permission Checking System
 *
 * Granular permission checks for admin functionality
 */

import { prisma } from './prisma'
import { AdminPermission } from '@prisma/client'
import { redis } from './redis'

// Re-export AdminPermission for use in other files
export { AdminPermission }

interface PermissionCache {
  permissions: AdminPermission[]
  roleId: string
  cachedAt: number
}

/**
 * Get all permissions for a user (cached with Redis)
 */
export async function getUserPermissions(userId: string): Promise<AdminPermission[]> {
  // Try Redis cache first
  const cacheKey = `permissions:${userId}`

  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        const data: PermissionCache = JSON.parse(cached)
        // Cache valid for 5 minutes
        if (Date.now() - data.cachedAt < 5 * 60 * 1000) {
          return data.permissions
        }
      }
    } catch (error) {
      console.error('Redis cache error (non-fatal):', error)
    }
  }

  // Fetch from database
  const admin = await prisma.admin.findUnique({
    where: { userId },
    include: {
      role: {
        select: {
          permissions: true,
        },
      },
    },
  })

  if (!admin) {
    return []
  }

  // Combine role permissions + extra permissions
  const allPermissions = [
    ...admin.role.permissions,
    ...admin.extraPermissions,
  ]

  // Remove duplicates
  const uniquePermissions = Array.from(new Set(allPermissions))

  // Cache in Redis
  if (redis) {
    try {
      const cacheData: PermissionCache = {
        permissions: uniquePermissions,
        roleId: admin.roleId,
        cachedAt: Date.now(),
      }
      await redis.setex(cacheKey, 300, JSON.stringify(cacheData)) // 5 minutes
    } catch (error) {
      console.error('Redis cache write error (non-fatal):', error)
    }
  }

  return uniquePermissions
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permission: AdminPermission
): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.includes(permission)
}

/**
 * Check if user has ANY of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissions: AdminPermission[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.some((perm) => userPermissions.includes(perm))
}

/**
 * Check if user has ALL of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissions: AdminPermission[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.every((perm) => userPermissions.includes(perm))
}

/**
 * Require permission - throws error if user doesn't have it
 * Use this in API routes
 */
export async function requirePermission(
  userId: string,
  permission: AdminPermission
): Promise<void> {
  const hasAccess = await hasPermission(userId, permission)

  if (!hasAccess) {
    throw new Error(`Missing required permission: ${permission}`)
  }
}

/**
 * Require ANY of the permissions - throws error if user has none
 */
export async function requireAnyPermission(
  userId: string,
  permissions: AdminPermission[]
): Promise<void> {
  const hasAccess = await hasAnyPermission(userId, permissions)

  if (!hasAccess) {
    throw new Error(
      `Missing required permissions. Need one of: ${permissions.join(', ')}`
    )
  }
}

/**
 * Require ALL of the permissions - throws error if user is missing any
 */
export async function requireAllPermissions(
  userId: string,
  permissions: AdminPermission[]
): Promise<void> {
  const hasAccess = await hasAllPermissions(userId, permissions)

  if (!hasAccess) {
    throw new Error(
      `Missing required permissions. Need all of: ${permissions.join(', ')}`
    )
  }
}

/**
 * Check if user is an admin (has Admin record)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { userId },
  })

  return !!admin
}

/**
 * Require user to be an admin - throws error if not
 * Backward compatible with old requireAdmin() function
 */
export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId)

  if (!admin) {
    throw new Error('Admin access required')
  }
}

/**
 * Invalidate permission cache for a user
 * Call this after changing user's role or permissions
 */
export async function invalidatePermissionCache(userId: string): Promise<void> {
  const cacheKey = `permissions:${userId}`

  if (redis) {
    try {
      await redis.del(cacheKey)
    } catch (error) {
      console.error('Redis cache invalidation error (non-fatal):', error)
    }
  }
}

/**
 * Get readable permission name
 */
export function getPermissionLabel(permission: AdminPermission): string {
  const labels: Record<AdminPermission, string> = {
    VIEW_USERS: 'View Users',
    BAN_USERS: 'Ban Users',
    UNBAN_USERS: 'Unban Users',
    DELETE_USERS: 'Delete Users',
    EDIT_USER_PROFILES: 'Edit User Profiles',
    VIEW_USER_ACTIVITY: 'View User Activity',
    VIEW_REPORTS: 'View Reports',
    RESOLVE_REPORTS: 'Resolve Reports',
    MODERATE_MESSAGES: 'Moderate Messages',
    MODERATE_PHOTOS: 'Moderate Photos',
    APPROVE_VERIFICATIONS: 'Approve Verifications',
    MANAGE_ADMINS: 'Manage Admins',
    VIEW_ANALYTICS: 'View Analytics',
    MANAGE_SUBSCRIPTIONS: 'Manage Subscriptions',
    MANAGE_PAYMENTS: 'Manage Payments',
    VIEW_AUDIT_LOGS: 'View Audit Logs',
    EXPORT_DATA: 'Export Data',
    CREATE_BLOG_POSTS: 'Create Blog Posts',
    EDIT_BLOG_POSTS: 'Edit Blog Posts',
    DELETE_BLOG_POSTS: 'Delete Blog Posts',
    PUBLISH_BLOG_POSTS: 'Publish Blog Posts',
    SEND_NOTIFICATIONS: 'Send Notifications',
    MANAGE_EMAIL_TEMPLATES: 'Manage Email Templates',
    VIEW_EMAIL_LOGS: 'View Email Logs',
    MANAGE_SETTINGS: 'Manage Settings',
    MANAGE_COUPONS: 'Manage Coupons',
    ACCESS_HELPDESK: 'Access Helpdesk',
  }

  return labels[permission] || permission
}

/**
 * Group permissions by category for UI display
 */
export function getPermissionsByCategory(): Record<
  string,
  { permission: AdminPermission; label: string }[]
> {
  return {
    'User Management': [
      { permission: AdminPermission.VIEW_USERS, label: getPermissionLabel(AdminPermission.VIEW_USERS) },
      { permission: AdminPermission.BAN_USERS, label: getPermissionLabel(AdminPermission.BAN_USERS) },
      { permission: AdminPermission.UNBAN_USERS, label: getPermissionLabel(AdminPermission.UNBAN_USERS) },
      { permission: AdminPermission.DELETE_USERS, label: getPermissionLabel(AdminPermission.DELETE_USERS) },
      { permission: AdminPermission.EDIT_USER_PROFILES, label: getPermissionLabel(AdminPermission.EDIT_USER_PROFILES) },
      { permission: AdminPermission.VIEW_USER_ACTIVITY, label: getPermissionLabel(AdminPermission.VIEW_USER_ACTIVITY) },
    ],
    'Content Moderation': [
      { permission: AdminPermission.VIEW_REPORTS, label: getPermissionLabel(AdminPermission.VIEW_REPORTS) },
      { permission: AdminPermission.RESOLVE_REPORTS, label: getPermissionLabel(AdminPermission.RESOLVE_REPORTS) },
      { permission: AdminPermission.MODERATE_MESSAGES, label: getPermissionLabel(AdminPermission.MODERATE_MESSAGES) },
      { permission: AdminPermission.MODERATE_PHOTOS, label: getPermissionLabel(AdminPermission.MODERATE_PHOTOS) },
      { permission: AdminPermission.APPROVE_VERIFICATIONS, label: getPermissionLabel(AdminPermission.APPROVE_VERIFICATIONS) },
    ],
    'System': [
      { permission: AdminPermission.MANAGE_ADMINS, label: getPermissionLabel(AdminPermission.MANAGE_ADMINS) },
      { permission: AdminPermission.VIEW_ANALYTICS, label: getPermissionLabel(AdminPermission.VIEW_ANALYTICS) },
      { permission: AdminPermission.MANAGE_SUBSCRIPTIONS, label: getPermissionLabel(AdminPermission.MANAGE_SUBSCRIPTIONS) },
      { permission: AdminPermission.MANAGE_PAYMENTS, label: getPermissionLabel(AdminPermission.MANAGE_PAYMENTS) },
      { permission: AdminPermission.VIEW_AUDIT_LOGS, label: getPermissionLabel(AdminPermission.VIEW_AUDIT_LOGS) },
      { permission: AdminPermission.EXPORT_DATA, label: getPermissionLabel(AdminPermission.EXPORT_DATA) },
    ],
    'Blog': [
      { permission: AdminPermission.CREATE_BLOG_POSTS, label: getPermissionLabel(AdminPermission.CREATE_BLOG_POSTS) },
      { permission: AdminPermission.EDIT_BLOG_POSTS, label: getPermissionLabel(AdminPermission.EDIT_BLOG_POSTS) },
      { permission: AdminPermission.DELETE_BLOG_POSTS, label: getPermissionLabel(AdminPermission.DELETE_BLOG_POSTS) },
      { permission: AdminPermission.PUBLISH_BLOG_POSTS, label: getPermissionLabel(AdminPermission.PUBLISH_BLOG_POSTS) },
    ],
    'Email & Notifications': [
      { permission: AdminPermission.SEND_NOTIFICATIONS, label: getPermissionLabel(AdminPermission.SEND_NOTIFICATIONS) },
      { permission: AdminPermission.MANAGE_EMAIL_TEMPLATES, label: getPermissionLabel(AdminPermission.MANAGE_EMAIL_TEMPLATES) },
      { permission: AdminPermission.VIEW_EMAIL_LOGS, label: getPermissionLabel(AdminPermission.VIEW_EMAIL_LOGS) },
    ],
    'Advanced': [
      { permission: AdminPermission.MANAGE_SETTINGS, label: getPermissionLabel(AdminPermission.MANAGE_SETTINGS) },
      { permission: AdminPermission.MANAGE_COUPONS, label: getPermissionLabel(AdminPermission.MANAGE_COUPONS) },
      { permission: AdminPermission.ACCESS_HELPDESK, label: getPermissionLabel(AdminPermission.ACCESS_HELPDESK) },
    ],
  }
}
