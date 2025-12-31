import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/professionals/dashboard - Get professional dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    // Get professional account
    const professional = await prisma.professionalAccount.findUnique({
      where: { userId: session.user.id },
      include: {
        teamMembers: true,
      },
    })

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Geen professional account gevonden' },
        { status: 404 }
      )
    }

    // Get stats (placeholder - would need actual tracking tables)
    const stats = {
      articlesRead: 0, // Would come from a reading history table
      pdfDownloads: 0, // Would come from a downloads table
      teamMembers: 1 + professional.teamMembers.length,
      savedArticles: 0, // Would come from a saved articles table
    }

    // Get recent articles (placeholder - would need reading history)
    const recentArticles: any[] = []

    // In a real implementation, you'd have:
    // - ArticleReadHistory table to track what users read
    // - SavedArticles table for bookmarks
    // - Downloads table for PDF downloads

    return NextResponse.json({
      success: true,
      data: {
        professional: {
          id: professional.id,
          organizationName: professional.organizationName,
          organizationType: professional.organizationType,
          isVerified: professional.isVerified,
          professionalTier: professional.professionalTier,
          canDownloadPdf: professional.canDownloadPdf,
        },
        stats,
        recentArticles,
      },
    })
  } catch (error) {
    console.error('Error fetching professional dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
