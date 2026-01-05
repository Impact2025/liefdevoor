import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  suggestInternalLinks,
  analyzeLinkDistribution,
  getUpdateOpportunities,
} from '@/lib/blog/internal-link-suggester'

/**
 * POST /api/blog/assistant/links
 * Suggest internal links for blog post
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { content, keywords, postId } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const suggestions = await suggestInternalLinks(
      content,
      keywords || [],
      postId
    )

    return NextResponse.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    console.error('Link suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to suggest links' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/blog/assistant/links/distribution
 * Analyze link distribution across blog
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'opportunities') {
      const opportunities = await getUpdateOpportunities()
      return NextResponse.json({
        success: true,
        data: opportunities,
      })
    }

    const distribution = await analyzeLinkDistribution()

    return NextResponse.json({
      success: true,
      data: distribution,
    })
  } catch (error) {
    console.error('Link distribution analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze link distribution' },
      { status: 500 }
    )
  }
}
