/**
 * Email Verification API Route - WORLD CLASS Edition
 *
 * GET: Validates token and redirects to confirmation page (does NOT consume token)
 * POST: Actually verifies and consumes the token (after user confirmation)
 *
 * Features:
 * - Email security scanner protection (User-Agent filtering)
 * - Two-step verification (preview → confirm)
 * - Comprehensive error handling
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateToken, verifyToken } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getWelcomeEmailHtml } from '@/lib/email/templates'
import { auditLog, getClientInfo } from '@/lib/audit'
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limit'

/**
 * Known email security scanners and link preview bots
 * These should NOT consume verification tokens
 */
const EMAIL_SCANNER_PATTERNS = [
  /mimecast/i,
  /proofpoint/i,
  /barracuda/i,
  /ironport/i,
  /forefront/i,
  /trend micro/i,
  /symantec/i,
  /mcafee/i,
  /sophos/i,
  /kaspersky/i,
  /checkpoint/i,
  /cisco/i,
  /fortinet/i,
  /paloalto/i,
  /linkpreview/i,
  /urlpreview/i,
  /scanner/i,
  /bot/i,
  /crawler/i,
  /spider/i,
  /headless/i,
  /python-requests/i,
  /curl\//i,
  /wget/i,
  /axios/i,
]

function isEmailSecurityScanner(userAgent: string | null): boolean {
  if (!userAgent) return false
  return EMAIL_SCANNER_PATTERNS.some(pattern => pattern.test(userAgent))
}

/**
 * GET: Validate token and redirect to confirmation page
 * This does NOT consume the token - protection against email scanners
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const userAgent = request.headers.get('user-agent')

    console.log('[Verify GET] Request from:', userAgent)
    console.log('[Verify GET] Token:', token?.substring(0, 10) + '...')

    // Security Scanner Detection
    if (isEmailSecurityScanner(userAgent)) {
      console.log('[Verify GET] 🛡️ Email security scanner detected:', userAgent)
      auditLog('EMAIL_SCANNER_BLOCKED', {
        userId: undefined,
        details: `Scanner detected: ${userAgent}`,
        clientInfo: getClientInfo(request),
        success: false
      })

      // Return 200 OK to satisfy scanner, but don't consume token
      return new NextResponse('OK', { status: 200 })
    }

    if (!token) {
      const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
      return NextResponse.redirect(`${baseUrl}/verify-email/error?reason=missing_token`)
    }

    // Validate token (does NOT consume it)
    const validation = await validateToken(token)

    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')

    if (!validation.valid) {
      // Redirect to error page with specific error code
      const errorUrl = new URL(`${baseUrl}/verify-email/error`)
      errorUrl.searchParams.set('reason', validation.errorCode || 'invalid')
      errorUrl.searchParams.set('message', validation.message)
      if (validation.email) {
        errorUrl.searchParams.set('email', validation.email)
      }

      auditLog('EMAIL_VERIFICATION_FAILED', {
        userId: undefined,
        details: `Token validation failed: ${validation.errorCode}`,
        clientInfo: getClientInfo(request),
        success: false
      })

      return NextResponse.redirect(errorUrl)
    }

    // Token is valid - redirect to confirmation page
    const confirmUrl = new URL(`${baseUrl}/verify-email/confirm`)
    confirmUrl.searchParams.set('token', token)
    confirmUrl.searchParams.set('email', validation.email!)
    if (validation.userName) {
      confirmUrl.searchParams.set('name', validation.userName)
    }

    console.log('[Verify GET] ✅ Token valid, redirecting to confirmation page')

    return NextResponse.redirect(confirmUrl)
  } catch (error) {
    console.error('[Verify GET] Error:', error)
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    return NextResponse.redirect(`${baseUrl}/verify-email/error?reason=server_error`)
  }
}

/**
 * POST: Actually verify the token and activate the account
 * Only called after user clicks "Confirm" button
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 verification attempts per hour per IP
    const rateLimitResult = await rateLimiters.emailVerify(request)
    if (!rateLimitResult.success) {
      auditLog('EMAIL_VERIFICATION_RATE_LIMITED', {
        userId: undefined,
        details: 'Rate limit exceeded for email verification',
        clientInfo: getClientInfo(request),
        success: false
      })
      return rateLimitResponse(rateLimitResult)
    }

    const body = await request.json()
    const { token } = body

    console.log('[Verify POST] Verification request for token:', token?.substring(0, 10) + '...')

    if (!token) {
      return NextResponse.json(
        { error: 'Verificatie token is verplicht' },
        { status: 400 }
      )
    }

    // Actually verify and consume the token
    const result = await verifyToken(token)

    if (!result.success) {
      auditLog('EMAIL_VERIFICATION_FAILED', {
        userId: undefined,
        details: `Verification failed: ${result.message}`,
        clientInfo: getClientInfo(request),
        success: false
      })

      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    console.log('[Verify POST] ✅ Email verified successfully:', result.email)

    // Audit log the successful verification
    auditLog('EMAIL_VERIFIED', {
      userId: undefined,
      details: `Email verified: ${result.email}`,
      clientInfo: getClientInfo(request),
      success: true
    })

    // Send welcome email (non-blocking)
    if (result.email) {
      const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
      const loginUrl = `${baseUrl}/login?verified=true`

      sendEmail({
        to: result.email,
        subject: '🎉 Je account is actief!',
        html: getWelcomeEmailHtml({
          name: result.email.split('@')[0],
          loginUrl,
        }),
        text: `Je account is actief! Log in op: ${loginUrl}`,
      }).catch(error => {
        console.error('[Verify POST] Failed to send welcome email:', error)
        // Don't fail the verification if welcome email fails
      })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      email: result.email
    })
  } catch (error) {
    console.error('[Verify POST] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verifiëren' },
      { status: 500 }
    )
  }
}
