import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/admin/kennisbank/feedback - List all feedback
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Check permission - using EDIT permission as there's no specific feedback permission
    const canManage = await hasPermission(session.user.id, 'EDIT_KB_ARTICLES')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')
    const isHelpful = searchParams.get('isHelpful')
    const hasComment = searchParams.get('hasComment')

    const where: any = {}

    if (articleId) {
      where.articleId = articleId
    }

    if (isHelpful !== null && isHelpful !== undefined) {
      where.isHelpful = isHelpful === 'true'
    }

    if (hasComment === 'true') {
      where.comment = { not: null }
    }

    const feedback = await prisma.knowledgeBaseFeedback.findMany({
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
      take: 500, // Limit to most recent 500
    })

    // Fetch user info for feedback with userId
    const userIds = feedback
      .map(f => f.userId)
      .filter((id): id is string => id !== null)

    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : []

    const userMap = new Map(users.map(u => [u.id, u]))

    // Combine feedback with user info
    const feedbackWithUsers = feedback.map(f => ({
      ...f,
      user: f.userId ? userMap.get(f.userId) || null : null,
    }))

    // Calculate stats
    const total = feedback.length
    const helpful = feedback.filter(f => f.isHelpful).length
    const notHelpful = total - helpful
    const withComments = feedback.filter(f => f.comment).length
    const helpfulRate = total > 0 ? Math.round((helpful / total) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        feedback: feedbackWithUsers,
        stats: {
          total,
          helpful,
          notHelpful,
          withComments,
          helpfulRate,
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
