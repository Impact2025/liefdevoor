import { NextRequest, NextResponse } from 'next/server'

/**
 * Test webhook OUTSIDE of /api/webhooks/ path
 * Testing if the /api/webhooks/ path itself is the problem
 */
export async function POST(req: NextRequest) {
  console.log('[Test Outside Webhooks] POST received!')

  return NextResponse.json({
    success: true,
    message: 'Test endpoint OUTSIDE webhooks folder works!',
    timestamp: new Date().toISOString()
  })
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Test endpoint OUTSIDE webhooks folder - use POST',
    status: 'ready'
  })
}
