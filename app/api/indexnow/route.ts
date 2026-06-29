import { NextRequest, NextResponse } from 'next/server'

const INDEXNOW_KEY = 'a0c0a835f3f24ff3adb96a1841157b34'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://www.liefdevooriedereen.nl'

/**
 * IndexNow API endpoint
 * POST: Submit individual URLs for instant indexing
 * GET: Verify key ownership
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = body.url

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

    // Submit to IndexNow (Bing + Yandex + Seznam)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(fullUrl).host,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: [fullUrl],
      }),
    })

    // Also ping Google
    await fetch(`https://www.google.com/ping?sitemap=${BASE_URL}/sitemap.xml`, {
      method: 'GET',
    })

    return NextResponse.json({
      success: response.ok || response.status === 202,
      indexnowStatus: response.status,
      url: fullUrl,
    })
  } catch (error) {
    console.error('IndexNow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Bulk submit all URLs to IndexNow
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const urls: string[] = body.urls

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Missing urls array' }, { status: 400 })
    }

    const fullUrls = urls.map(u => u.startsWith('http') ? u : `${BASE_URL}${u}`)

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(BASE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: fullUrls,
      }),
    })

    return NextResponse.json({
      success: response.ok || response.status === 202,
      indexnowStatus: response.status,
      count: fullUrls.length,
    })
  } catch (error) {
    console.error('IndexNow bulk error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
