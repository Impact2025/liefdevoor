import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limit'
import { auditLog, getClientInfo } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is verplicht'),
  password: z
    .string()
    .min(8, 'Wachtwoord moet minimaal 8 tekens zijn')
    .max(128, 'Wachtwoord is te lang')
    .regex(/[a-z]/, 'Wachtwoord moet een kleine letter bevatten')
    .regex(/[A-Z]/, 'Wachtwoord moet een hoofdletter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet een cijfer bevatten')
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.auth(request)
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()

    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { token, password } = validationResult.data

    // Find valid reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token }
    })

    if (!resetToken) {
      auditLog('PASSWORD_RESET_FAILED', {
        details: 'Invalid token',
        clientInfo: getClientInfo(request)
      })
      return NextResponse.json(
        { error: 'Ongeldige of verlopen link' },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      auditLog('PASSWORD_RESET_FAILED', {
        details: 'Token already used',
        clientInfo: getClientInfo(request)
      })
      return NextResponse.json(
        { error: 'Deze link is al gebruikt' },
        { status: 400 }
      )
    }

    if (resetToken.expires < new Date()) {
      auditLog('PASSWORD_RESET_FAILED', {
        details: 'Token expired',
        clientInfo: getClientInfo(request)
      })
      return NextResponse.json(
        { error: 'Deze link is verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ])

    // Log success
    auditLog('PASSWORD_RESET_SUCCESS', {
      userId: user.id,
      details: 'Password reset completed',
      clientInfo: getClientInfo(request)
    })

    return NextResponse.json({
      message: 'Wachtwoord succesvol gewijzigd. Je kunt nu inloggen.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
