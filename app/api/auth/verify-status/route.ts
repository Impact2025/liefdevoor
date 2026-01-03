/**
 * Token Validation API - Check token status without consuming it
 * Used by confirm page to validate token and get user info
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/lib/email/verification'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({
        valid: false,
        errorCode: 'INVALID',
        message: 'Geen token opgegeven'
      })
    }

    // Validate token without consuming it
    const validation = await validateToken(token)

    return NextResponse.json({
      valid: validation.valid,
      email: validation.email,
      userName: validation.userName,
      errorCode: validation.errorCode,
      message: validation.message
    })
  } catch (error) {
    console.error('[VerifyStatus] Error:', error)
    return NextResponse.json({
      valid: false,
      errorCode: 'ERROR',
      message: 'Er ging iets mis'
    }, { status: 500 })
  }
}
