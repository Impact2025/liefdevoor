import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeSEO, BlogPostInput } from '@/lib/blog/seo-analyzer'

/**
 * POST /api/blog/assistant/analyze
 * Analyze blog post for SEO optimization
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

    const { title, content, excerpt, seoTitle, seoDescription, keywords, featuredImage } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const postInput: BlogPostInput = {
      title,
      content,
      excerpt,
      seoTitle,
      seoDescription,
      keywords: keywords || [],
      featuredImage,
    }

    const analysis = analyzeSEO(postInput)

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error('Blog analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze blog post' },
      { status: 500 }
    )
  }
}
