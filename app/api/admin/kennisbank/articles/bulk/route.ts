import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// POST /api/admin/kennisbank/articles/bulk - Bulk actions on articles
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ids, action } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Geen artikelen geselecteerd' },
        { status: 400 }
      )
    }

    // Check permissions based on action
    if (action === 'delete') {
      const canDelete = await hasPermission(session.user.id, 'DELETE_KB_ARTICLES')
      if (!canDelete) {
        return NextResponse.json(
          { success: false, error: 'Geen toegang om artikelen te verwijderen' },
          { status: 403 }
        )
      }
    } else if (action === 'publish' || action === 'unpublish') {
      const canPublish = await hasPermission(session.user.id, 'PUBLISH_KB_ARTICLES')
      if (!canPublish) {
        return NextResponse.json(
          { success: false, error: 'Geen toegang om artikelen te publiceren' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Ongeldige actie' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'publish':
        result = await prisma.knowledgeBaseArticle.updateMany({
          where: { id: { in: ids } },
          data: {
            isPublished: true,
            publishedAt: new Date(),
          },
        })
        break

      case 'unpublish':
        result = await prisma.knowledgeBaseArticle.updateMany({
          where: { id: { in: ids } },
          data: {
            isPublished: false,
          },
        })
        break

      case 'delete':
        // First delete related records
        await prisma.knowledgeBaseFeedback.deleteMany({
          where: { articleId: { in: ids } },
        })
        await prisma.knowledgeBaseArticleTool.deleteMany({
          where: { articleId: { in: ids } },
        })
        await prisma.knowledgeBaseRelation.deleteMany({
          where: { OR: [{ sourceArticleId: { in: ids } }, { targetArticleId: { in: ids } }] },
        })

        result = await prisma.knowledgeBaseArticle.deleteMany({
          where: { id: { in: ids } },
        })
        break
    }

    return NextResponse.json({
      success: true,
      data: {
        affected: result?.count || 0,
        action,
      },
      message: `${result?.count || 0} artikelen ${
        action === 'publish' ? 'gepubliceerd' :
        action === 'unpublish' ? 'gedepubliceerd' :
        'verwijderd'
      }`,
    })
  } catch (error) {
    console.error('Error bulk action:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het uitvoeren van de actie' },
      { status: 500 }
    )
  }
}
