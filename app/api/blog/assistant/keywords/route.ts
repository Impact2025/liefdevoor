import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { researchKeywords, suggestKeywordGaps } from '@/lib/blog/keyword-researcher'

/**
 * POST /api/blog/assistant/keywords
 * Research keywords for a given topic
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
    const { topic } = body

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    const research = await researchKeywords(topic)

    return NextResponse.json({
      success: true,
      data: research,
    })
  } catch (error) {
    console.error('Keyword research error:', error)
    return NextResponse.json(
      { error: 'Failed to research keywords' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/blog/assistant/keywords/gaps
 * Find keyword gaps in existing content
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

    const gaps = await suggestKeywordGaps()

    return NextResponse.json({
      success: true,
      data: gaps,
    })
  } catch (error) {
    console.error('Keyword gap analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze keyword gaps' },
      { status: 500 }
    )
  }
}
