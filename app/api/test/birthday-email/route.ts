/**
 * Test Birthday Email Endpoint
 *
 * FOR DEVELOPMENT ONLY - Send test birthday email
 *
 * Usage: http://localhost:3004/api/test/birthday-email?email=test@example.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBirthdayEmail } from '@/lib/email/birthday-system'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 403 }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required. Usage: ?email=test@example.com' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        birthDate: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      )
    }

    if (!user.birthDate) {
      return NextResponse.json(
        { error: 'User has no birth date set' },
        { status: 400 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'User email is not verified' },
        { status: 400 }
      )
    }

    // Calculate age
    const today = new Date()
    let age = today.getFullYear() - user.birthDate.getFullYear()
    const monthDiff = today.getMonth() - user.birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < user.birthDate.getDate())) {
      age--
    }

    // Send birthday email
    await sendBirthdayEmail({
      id: user.id,
      name: user.name || 'daar',
      email: user.email!,
      birthDate: user.birthDate,
      age: age
    })

    return NextResponse.json({
      success: true,
      message: `Test birthday email sent to ${email}`,
      user: {
        name: user.name,
        email: user.email,
        age: age
      }
    })
  } catch (error) {
    console.error('[Test] Birthday email test failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
