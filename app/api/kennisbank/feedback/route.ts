import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/kennisbank/feedback - Submit article feedback
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { articleId, isHelpful, comment } = body

    // Validation
    if (!articleId || typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Artikel ID en feedback zijn verplicht' },
        { status: 400 }
      )
    }

    // Check if article exists
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artikel niet gevonden' },
        { status: 404 }
      )
    }

    // Create feedback
    const feedback = await prisma.knowledgeBaseFeedback.create({
      data: {
        articleId,
        userId: session?.user?.id || null,
        isHelpful,
        comment: comment?.trim() || null,
      },
    })

    // Update article counters
    await prisma.knowledgeBaseArticle.update({
      where: { id: articleId },
      data: isHelpful
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: { feedback: { id: feedback.id } },
      message: 'Bedankt voor je feedback!',
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het opslaan van feedback' },
      { status: 500 }
    )
  }
}

// GET /api/kennisbank/feedback - Get feedback for an article (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    const where: any = {}
    if (articleId) {
      where.articleId = articleId
    }

    const [feedback, total] = await Promise.all([
      prisma.knowledgeBaseFeedback.findMany({
        where,
        include: {
          article: {
            select: {
              id: true,
              titleNl: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.knowledgeBaseFeedback.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van feedback' },
      { status: 500 }
    )
  }
}
