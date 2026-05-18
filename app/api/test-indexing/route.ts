import { NextResponse } from 'next/server'
import { pingIndexNow, pingGoogleIndexingAPI } from '@/lib/indexing'

// Dev-only endpoint — blocked in production
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://liefdevoor.vercel.app'
  const testUrl = `${siteUrl}/blog/test-indexing-check`

  const results = await Promise.allSettled([
    pingIndexNow([testUrl]),
    pingGoogleIndexingAPI(testUrl),
  ])

  return NextResponse.json({
    testUrl,
    indexNow: {
      status: results[0].status,
      ...(results[0].status === 'rejected' && { error: String(results[0].reason) }),
    },
    googleIndexing: {
      status: results[1].status,
      ...(results[1].status === 'rejected' && { error: String(results[1].reason) }),
    },
    env: {
      hasIndexNowKey: !!process.env.INDEXNOW_KEY,
      hasGoogleServiceAccount: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      siteUrl,
    },
  })
}
