import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/kennisbank/tools/[slug] - Get single tool
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tool = await prisma.knowledgeBaseTool.findUnique({
      where: { slug: params.slug },
      include: {
        articles: {
          include: {
            article: {
              select: {
                id: true,
                titleNl: true,
                slug: true,
                excerptNl: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool niet gevonden' },
        { status: 404 }
      )
    }

    // Increment usage count
    prisma.knowledgeBaseTool.update({
      where: { id: tool.id },
      data: { usageCount: { increment: 1 } },
    }).catch(() => {})

    const response = {
      id: tool.id,
      name: tool.nameNl,
      slug: tool.slug,
      description: tool.description,
      toolType: tool.toolType,
      config: tool.config,
      externalUrl: tool.externalUrl,
      isActive: tool.isActive,
      requiresAuth: tool.requiresAuth,
      usageCount: tool.usageCount,
      relatedArticles: tool.articles.map((a) => ({
        title: a.article.titleNl,
        slug: a.article.slug,
        excerpt: a.article.excerptNl,
      })),
    }

    return NextResponse.json({
      success: true,
      data: { tool: response },
    })
  } catch (error) {
    console.error('Error fetching tool:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van de tool' },
      { status: 500 }
    )
  }
}

// PATCH /api/kennisbank/tools/[slug] - Update tool (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_TOOLS')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om tools te beheren' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Find existing tool
    const existingTool = await prisma.knowledgeBaseTool.findUnique({
      where: { slug: params.slug },
    })

    if (!existingTool) {
      return NextResponse.json(
        { success: false, error: 'Tool niet gevonden' },
        { status: 404 }
      )
    }

    // Check if new slug is unique
    if (body.slug && body.slug !== params.slug) {
      const slugExists = await prisma.knowledgeBaseTool.findUnique({
        where: { slug: body.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Deze slug bestaat al' },
          { status: 400 }
        )
      }
    }

    // Update tool
    const tool = await prisma.knowledgeBaseTool.update({
      where: { id: existingTool.id },
      data: {
        name: body.name,
        nameNl: body.nameNl,
        slug: body.slug,
        description: body.description,
        toolType: body.toolType,
        config: body.config,
        externalUrl: body.externalUrl,
        isActive: body.isActive,
        requiresAuth: body.requiresAuth,
      },
    })

    return NextResponse.json({
      success: true,
      data: { tool },
    })
  } catch (error) {
    console.error('Error updating tool:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het bijwerken van de tool' },
      { status: 500 }
    )
  }
}

// DELETE /api/kennisbank/tools/[slug] - Delete tool (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
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
    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_TOOLS')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om tools te verwijderen' },
        { status: 403 }
      )
    }

    // Find and delete tool
    const tool = await prisma.knowledgeBaseTool.findUnique({
      where: { slug: params.slug },
    })

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool niet gevonden' },
        { status: 404 }
      )
    }

    await prisma.knowledgeBaseTool.delete({
      where: { id: tool.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Tool verwijderd',
    })
  } catch (error) {
    console.error('Error deleting tool:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het verwijderen van de tool' },
      { status: 500 }
    )
  }
}
