import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

interface RouteContext {
  params: Promise<{ id: string }>
}

// DELETE /api/admin/kennisbank/feedback/[id] - Delete feedback
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    const canManage = await hasPermission(session.user.id, 'EDIT_KB_ARTICLES')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    // Check if feedback exists
    const existingFeedback = await prisma.knowledgeBaseFeedback.findUnique({
      where: { id },
    })

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback niet gevonden' },
        { status: 404 }
      )
    }

    // Delete the feedback
    await prisma.knowledgeBaseFeedback.delete({
      where: { id },
    })

    // Update article counts
    if (existingFeedback.isHelpful) {
      await prisma.knowledgeBaseArticle.update({
        where: { id: existingFeedback.articleId },
        data: { helpfulCount: { decrement: 1 } },
      })
    } else {
      await prisma.knowledgeBaseArticle.update({
        where: { id: existingFeedback.articleId },
        data: { notHelpfulCount: { decrement: 1 } },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback verwijderd',
    })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het verwijderen van feedback' },
      { status: 500 }
    )
  }
}
