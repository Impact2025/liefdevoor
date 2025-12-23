/**
 * Admin 2FA Setup API
 *
 * Generate 2FA secret and QR code for admin users
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import crypto from 'crypto'
import { encrypt } from '@/lib/encryption'

/**
 * POST /api/admin/2fa/setup
 *
 * Generate 2FA secret and QR code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Generate secret for TOTP
    const secret = speakeasy.generateSecret({
      name: `Liefde Voor Iedereen Admin (${session.user.email})`,
      issuer: 'Liefde Voor Iedereen',
      length: 32
    })

    // Generate backup codes (10 codes, 8 characters each)
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    )

    // Generate QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Store secret in database (ENCRYPTED - NOT enabled yet - user must verify first)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encrypt(secret.base32), // 🔐 Encrypted
        twoFactorEnabled: false, // Not enabled until verified
        twoFactorBackupCodes: encrypt(JSON.stringify(backupCodes)) // 🔐 Encrypted
      }
    })

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      backupCodes,
      message: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)'
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json({
      error: 'Failed to setup 2FA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/2fa/setup
 *
 * Check if 2FA is already set up
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    })

    return NextResponse.json({
      isSetup: !!user?.twoFactorSecret,
      isEnabled: user?.twoFactorEnabled || false
    })
  } catch (error) {
    console.error('2FA status check error:', error)
    return NextResponse.json({
      error: 'Failed to check 2FA status'
    }, { status: 500 })
  }
}
