/**
 * Email Verification API Route
 *
 * Verifies email verification tokens
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/email/verification'
import { sendEmail } from '@/lib/email/send'
import { getWelcomeEmailHtml } from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verificatie token is verplicht' },
        { status: 400 }
      )
    }

    // Verify the token
    const result = await verifyToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    // Send welcome email
    if (result.email) {
      try {
        // Remove trailing slash to prevent //
        const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
        const loginUrl = `${baseUrl}/login?verified=true`

        await sendEmail({
          to: result.email,
          subject: '🎉 Je account is actief!',
          html: getWelcomeEmailHtml({
            name: result.email.split('@')[0], // Use email username as fallback
            loginUrl,
          }),
          text: `Je account is actief! Log in op: ${loginUrl}`,
        })
      } catch (error) {
        console.error('[Verify] Failed to send welcome email:', error)
        // Don't fail the verification if welcome email fails
      }
    }

    // Redirect to login page with success message (use clean base URL)
    const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    const redirectUrl = new URL(`${baseUrl}/login`)
    redirectUrl.searchParams.set('verified', 'true')

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('[Verify] Error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verifiëren' },
      { status: 500 }
    )
  }
}
