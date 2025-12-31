import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/kennisbank/articles/[id]/download - Track PDF download
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Get article to verify it exists
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id },
      select: { id: true, title: true }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Artikel niet gevonden' },
        { status: 404 }
      )
    }

    // Log the download for analytics
    // Note: In a full implementation, you would create a KBDownload model
    // For now we'll just increment a counter or log to console
    console.log(`[KB Download] Article: ${article.title}, User: ${session?.user?.email || 'anonymous'}`)

    // Optional: Create audit log entry if you have that model
    try {
      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id || null,
          action: 'KB_ARTICLE_DOWNLOAD',
          details: JSON.stringify({
            articleId: id,
            articleTitle: article.title,
            timestamp: new Date().toISOString()
          }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
    } catch {
      // Ignore if AuditLog doesn't exist or fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking download:', error)
    return NextResponse.json({ success: true }) // Don't fail the download
  }
}
