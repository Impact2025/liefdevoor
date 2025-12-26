/**
 * Current Admin User Permissions API
 *
 * GET - Fetch permissions for the currently logged-in admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPermissions, isAdmin } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an admin
    const adminStatus = await isAdmin(session.user.id)

    if (!adminStatus) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    // Get permissions
    const permissions = await getUserPermissions(session.user.id)

    return NextResponse.json({
      userId: session.user.id,
      permissions,
      permissionCount: permissions.length,
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch permissions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
