/**
 * Permission Guard Component
 *
 * Conditionally renders children based on user permissions
 * Fetches permissions from API and caches in React context
 */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AdminPermission } from '@prisma/client'

interface PermissionContextType {
  permissions: AdminPermission[]
  loading: boolean
  hasPermission: (permission: AdminPermission) => boolean
  hasAnyPermission: (permissions: AdminPermission[]) => boolean
  hasAllPermissions: (permissions: AdminPermission[]) => boolean
}

const PermissionContext = createContext<PermissionContextType | null>(null)

/**
 * Permission Provider - Wrap your admin layout with this
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<AdminPermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/me/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || [])
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: AdminPermission) => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (perms: AdminPermission[]) => {
    return perms.some((p) => permissions.includes(p))
  }

  const hasAllPermissions = (perms: AdminPermission[]) => {
    return perms.every((p) => permissions.includes(p))
  }

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  )
}

/**
 * Hook to access permissions in components
 */
export function usePermissions() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider')
  }
  return context
}

/**
 * Permission Guard Component
 *
 * Conditionally renders children based on permissions
 *
 * @example
 * <PermissionGuard permission="BAN_USERS">
 *   <button>Ban User</button>
 * </PermissionGuard>
 *
 * @example
 * <PermissionGuard permission={['BAN_USERS', 'DELETE_USERS']} requireAll>
 *   <button>Delete User</button>
 * </PermissionGuard>
 *
 * @example
 * <PermissionGuard
 *   permission="VIEW_ANALYTICS"
 *   fallback={<p>You don't have access to analytics</p>}
 * >
 *   <AnalyticsDashboard />
 * </PermissionGuard>
 */
interface PermissionGuardProps {
  permission: AdminPermission | AdminPermission[]
  requireAll?: boolean // For arrays: require ALL permissions (default: false = require ANY)
  fallback?: ReactNode // What to show if permission denied
  children: ReactNode
}

export default function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions()

  if (loading) {
    // Show nothing while loading (or you could show a skeleton)
    return null
  }

  let hasAccess = false

  if (Array.isArray(permission)) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permission)
    } else {
      hasAccess = hasAnyPermission(permission)
    }
  } else {
    hasAccess = hasPermission(permission)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Helper: Show element ONLY to Super Admins
 */
export function SuperAdminOnly({ children }: { children: ReactNode }) {
  const { permissions, loading } = usePermissions()

  if (loading) return null

  // Super Admin has all 27 permissions
  const isSuperAdmin = permissions.length === 27

  return isSuperAdmin ? <>{children}</> : null
}

/**
 * Helper: Hide element from users with permission (inverse guard)
 */
export function HideFromPermission({
  permission,
  children,
}: {
  permission: AdminPermission | AdminPermission[]
  children: ReactNode
}) {
  const { hasPermission, hasAnyPermission, loading } = usePermissions()

  if (loading) return null

  let shouldHide = false

  if (Array.isArray(permission)) {
    shouldHide = hasAnyPermission(permission)
  } else {
    shouldHide = hasPermission(permission)
  }

  return shouldHide ? null : <>{children}</>
}
