/**
 * Admin 2FA Verification API
 *
 * Verify TOTP code and enable 2FA
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import speakeasy from 'speakeasy'

/**
 * POST /api/admin/2fa/verify
 *
 * Verify TOTP code and enable 2FA
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({
        error: 'Token is required'
      }, { status: 400 })
    }

    // Get user's 2FA secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true
      }
    })

    if (!user?.twoFactorSecret) {
      return NextResponse.json({
        error: '2FA not set up. Please set up 2FA first.'
      }, { status: 400 })
    }

    // Verify the TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), // Remove any spaces
      window: 2 // Allow 2 time steps before/after for clock drift
    })

    if (!verified) {
      return NextResponse.json({
        error: 'Invalid verification code'
      }, { status: 400 })
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully!'
    })
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json({
      error: 'Failed to verify 2FA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/2fa/verify
 *
 * Disable 2FA
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json({
      error: 'Failed to disable 2FA'
    }, { status: 500 })
  }
}
