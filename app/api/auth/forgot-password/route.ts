import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limit'
import { auditLog, getClientInfo } from '@/lib/audit'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 requests per 15 minutes
    const rateLimitResult = await rateLimiters.auth(request)
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is verplicht' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message: 'Als dit emailadres bij ons bekend is, ontvang je een email met instructies.'
    })

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      // Log the attempt but don't reveal if user exists
      auditLog('PASSWORD_RESET_REQUEST', {
        userId: undefined,
        details: 'Email not found (not revealed to user)',
        clientInfo: getClientInfo(request)
      })
      return successResponse
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Invalidate any existing tokens for this email
    await prisma.passwordReset.updateMany({
      where: {
        email: normalizedEmail,
        used: false,
        expires: { gt: new Date() }
      },
      data: { used: true }
    })

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        email: normalizedEmail,
        token,
        expires
      }
    })

    // Log the request
    auditLog('PASSWORD_RESET_REQUEST', {
      userId: user.id,
      details: 'Reset token created',
      clientInfo: getClientInfo(request)
    })

    // TODO: Implement email sending
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    // await sendPasswordResetEmail(normalizedEmail, resetUrl)

    return successResponse
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
