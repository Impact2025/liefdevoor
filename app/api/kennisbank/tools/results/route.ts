/**
 * Quiz Results API
 *
 * Handles saving and retrieving quiz/tool results
 * Supports anonymous and authenticated users
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// POST - Save quiz result
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { toolSlug, input, output, score } = body

    if (!toolSlug || !output) {
      return NextResponse.json(
        { error: 'toolSlug and output are required' },
        { status: 400 }
      )
    }

    // Find the tool
    const tool = await prisma.knowledgeBaseTool.findUnique({
      where: { slug: toolSlug },
      select: { id: true }
    })

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Generate a share token for this result
    const shareToken = nanoid(12)

    // Create the result
    const result = await prisma.knowledgeBaseToolResult.create({
      data: {
        toolId: tool.id,
        userId: session?.user?.id || null,
        input: input || {},
        output: output,
        score: score || null,
        shareToken,
      }
    })

    // Update tool usage count
    await prisma.knowledgeBaseTool.update({
      where: { id: tool.id },
      data: {
        usageCount: { increment: 1 },
      }
    })

    return NextResponse.json({
      success: true,
      resultId: result.id,
      shareToken: result.shareToken,
      shareUrl: `/kennisbank/tools/result/${result.shareToken}`
    })

  } catch (error) {
    console.error('[Quiz Results POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    )
  }
}

// GET - Get user's quiz history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const toolSlug = searchParams.get('toolSlug')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      userId: session.user.id
    }

    if (toolSlug) {
      const tool = await prisma.knowledgeBaseTool.findUnique({
        where: { slug: toolSlug },
        select: { id: true }
      })
      if (tool) {
        where.toolId = tool.id
      }
    }

    const results = await prisma.knowledgeBaseToolResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        tool: {
          select: {
            slug: true,
            nameNl: true,
            toolType: true,
          }
        }
      }
    })

    return NextResponse.json({
      results: results.map(r => ({
        id: r.id,
        toolSlug: r.tool?.slug,
        toolTitle: r.tool?.nameNl,
        toolType: r.tool?.toolType,
        output: r.output,
        score: r.score,
        shareToken: r.shareToken,
        completedAt: r.createdAt
      }))
    })

  } catch (error) {
    console.error('[Quiz Results GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}
