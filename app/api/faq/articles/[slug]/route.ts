import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auditLog, getClientInfo } from '@/lib/audit'

// GET /api/faq/articles/[slug] - Get single FAQ article
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.fAQArticle.findUnique({
      where: { slug: params.slug },
      include: {
        category: {
          select: { id: true, name: true, nameNl: true, slug: true }
        },
        author: {
          select: { id: true, name: true }
        }
      }
    })

    if (!article || !article.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Artikel niet gevonden' },
        { status: 404 }
      )
    }

    // Increment view count (async, don't await)
    prisma.fAQArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    }).catch(error => console.error('Error incrementing view count:', error))

    // Audit log
    const clientInfo = getClientInfo(request)
    auditLog('FAQ_ARTICLE_VIEWED', {
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: {
        articleId: article.id,
        slug: params.slug,
        title: article.titleNl
      }
    })

    return NextResponse.json({
      success: true,
      data: { article }
    })
  } catch (error: any) {
    console.error('Error fetching FAQ article:', error)

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het ophalen van het artikel' },
      { status: 500 }
    )
  }
}
