import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * API endpoint voor doelgroep-specifieke blog artikelen (DEPRECATED - use /api/blog/posts?tags=xxx)
 *
 * Query params:
 * - tag: Filter op specifieke tag (bijv. 'autisme', 'lvb', 'slechtziend')
 * - limit: Maximum aantal artikelen (default: 10)
 *
 * NOTE: This route now fetches from the database instead of static data
 * Redirects to /api/blog/posts for consistency
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Redirect to the main blog posts API with tags filter
    const baseUrl = new URL('/api/blog/posts', request.url)
    if (tag) {
      baseUrl.searchParams.set('tags', tag)
    }
    baseUrl.searchParams.set('limit', limit.toString())

    // Fetch from the main API
    const response = await fetch(baseUrl.toString())
    const data = await response.json()

    // Return in the old format for backwards compatibility
    return NextResponse.json({
      articles: data.posts || [],
      total: data.posts?.length || 0,
      filters: {
        tag,
      },
      note: 'This API route is deprecated. Please use /api/blog/posts?tags=xxx instead.'
    })
  } catch (error) {
    console.error('Doelgroep blog fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
