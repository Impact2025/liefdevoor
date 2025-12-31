import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/admin/kennisbank/articles/[id] - Get single article (including drafts)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Check permission
    const canEdit = await hasPermission(session.user.id, 'EDIT_KB_ARTICLES')
    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            nameNl: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tools: {
          include: {
            tool: {
              select: {
                id: true,
                nameNl: true,
                slug: true,
              },
            },
          },
        },
        relatedFrom: {
          include: {
            targetArticle: {
              select: {
                id: true,
                titleNl: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artikel niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { article },
    })
  } catch (error) {
    console.error('Error fetching admin article:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van het artikel' },
      { status: 500 }
    )
  }
}
