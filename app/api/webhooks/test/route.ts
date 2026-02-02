import { NextRequest, NextResponse } from 'next/server'

/**
 * Ultra-simple test webhook endpoint
 * No middleware, no auth, no processing - just accepts POST and returns 200
 */
export async function POST(req: NextRequest) {
  console.log('[Test Webhook] Received POST request!')

  return NextResponse.json({
    success: true,
    message: 'Test webhook working!',
    timestamp: new Date().toISOString()
  })
}

// Also handle GET for testing
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Test webhook endpoint - use POST',
    status: 'ready'
  })
}
