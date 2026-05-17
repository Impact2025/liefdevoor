import { NextRequest, NextResponse } from 'next/server'

const NOT_FOUND = NextResponse.json({ error: 'Not found' }, { status: 404 })

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') return NOT_FOUND

  console.log('[Test Webhook] Received POST request')
  return NextResponse.json({
    success: true,
    message: 'Test webhook working',
    timestamp: new Date().toISOString(),
  })
}

export async function GET(_req: NextRequest) {
  if (process.env.NODE_ENV === 'production') return NOT_FOUND

  return NextResponse.json({ message: 'Test webhook endpoint — use POST', status: 'ready' })
}
