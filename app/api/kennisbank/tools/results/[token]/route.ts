/**
 * Shared Quiz Result API
 *
 * Retrieves a quiz result by share token (public access)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const result = await prisma.knowledgeBaseToolResult.findUnique({
      where: { shareToken: token },
      include: {
        tool: {
          select: {
            slug: true,
            name: true,
            nameNl: true,
            toolType: true,
            descriptionNl: true
          }
        }
      }
    })

    // Fetch user info if userId exists
    const user = result?.userId
      ? await prisma.user.findUnique({
          where: { id: result.userId },
          select: { name: true, image: true }
        })
      : null

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      result: {
        id: result.id,
        toolSlug: result.tool?.slug,
        toolTitle: result.tool?.nameNl,
        toolDescription: result.tool?.descriptionNl,
        toolType: result.tool?.toolType,
        output: result.output,
        score: result.score,
        completedAt: result.createdAt,
        user: user ? {
          name: user.name,
          image: user.image
        } : null
      }
    })

  } catch (error) {
    console.error('[Shared Result GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}
