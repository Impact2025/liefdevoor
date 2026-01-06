/**
 * Form Timing Token API
 *
 * Generates timing tokens for forms to detect bot submissions.
 * When a form starts, request a token. When submitted, include the token.
 * The server checks how long it took to fill out the form.
 */

import { NextRequest, NextResponse } from 'next/server'
import { FormTimingAnalyzer } from '@/lib/spam-guard/form-timing'
import { rateLimiters, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limit to prevent token farming
  const rateLimitResult = await rateLimiters.api(request)
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const token = await FormTimingAnalyzer.generateToken()

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error('[TimingToken] Error generating token:', error)
    return NextResponse.json(
      { success: false, error: 'Could not generate token' },
      { status: 500 }
    )
  }
}
