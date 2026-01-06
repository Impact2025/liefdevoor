/**
 * Email Availability Check API
 *
 * Checks if an email address is already registered AND validates it for spam.
 * Now with:
 * - Rate limiting (15 requests/minute per IP)
 * - Disposable email detection
 * - Suspicious pattern detection
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimiters, rateLimitResponse, getClientIdentifier } from '@/lib/rate-limit'
import { SpamGuard } from '@/lib/spam-guard'
import { auditLog, getClientInfo } from '@/lib/audit'

const schema = z.object({
  email: z.string().email('Invalid email format'),
})

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Support GET for query parameter usage
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimiters.emailCheck(request)
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { available: false, error: 'Email parameter required' },
        { status: 400 }
      )
    }

    // Validate email format
    const result = schema.safeParse({ email })
    if (!result.success) {
      return NextResponse.json(
        { available: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Spam check on email
    const emailCheck = SpamGuard.checkEmail(email)

    // Block disposable emails immediately
    if (emailCheck.isDisposable) {
      auditLog('SPAM_EMAIL_BLOCKED', {
        userId: undefined,
        details: `Disposable email blocked: ${emailCheck.domain}`,
        clientInfo: getClientInfo(request),
        success: false,
      })

      return NextResponse.json({
        available: false,
        blocked: true,
        message: 'Wegwerp email adressen zijn niet toegestaan. Gebruik een permanent email adres.',
      })
    }

    // Warn about suspicious emails (but don't block)
    const isSuspicious = emailCheck.suspicionScore >= 50

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })

    // Log high-volume checkers
    const clientIP = getClientIdentifier(request)
    if (rateLimitResult.remaining <= 3) {
      auditLog('EMAIL_CHECK_HIGH_VOLUME', {
        userId: undefined,
        details: `High volume email checks from IP, remaining: ${rateLimitResult.remaining}`,
        clientInfo: getClientInfo(request),
        success: true,
      })
    }

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? 'Dit emailadres is al in gebruik'
        : 'Email is beschikbaar',
      warning: isSuspicious ? 'Dit email adres kan problemen geven bij verificatie' : undefined,
    })
  } catch (error) {
    console.error('[Check Email GET] Error:', error)
    return NextResponse.json(
      { available: true, error: 'Could not verify email' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimiters.emailCheck(request)
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()

    // Validate input
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { available: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const { email } = result.data

    // Spam check on email
    const emailCheck = SpamGuard.checkEmail(email)

    // Block disposable emails immediately
    if (emailCheck.isDisposable) {
      auditLog('SPAM_EMAIL_BLOCKED', {
        userId: undefined,
        details: `Disposable email blocked: ${emailCheck.domain}`,
        clientInfo: getClientInfo(request),
        success: false,
      })

      return NextResponse.json({
        available: false,
        blocked: true,
        message: 'Wegwerp email adressen zijn niet toegestaan. Gebruik een permanent email adres.',
      })
    }

    // Warn about suspicious emails
    const isSuspicious = emailCheck.suspicionScore >= 50

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser
        ? 'Dit emailadres is al in gebruik'
        : 'Email is beschikbaar',
      warning: isSuspicious ? 'Dit email adres kan problemen geven bij verificatie' : undefined,
    })
  } catch (error) {
    console.error('[Check Email] Error:', error)
    return NextResponse.json(
      { available: true, error: 'Could not verify email' },
      { status: 500 }
    )
  }
}
