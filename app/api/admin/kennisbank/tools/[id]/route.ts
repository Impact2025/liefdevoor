import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/admin/kennisbank/tools/[id] - Get a single tool
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_TOOLS')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const tool = await prisma.knowledgeBaseTool.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            article: {
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

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { tool },
    })
  } catch (error) {
    console.error('Error fetching tool:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van de tool' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/kennisbank/tools/[id] - Update a tool
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Niet ingelogd' },
        { status: 401 }
      )
    }

    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_TOOLS')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, nameNl, slug, description, toolType, externalUrl, isActive, requiresAuth, config } = body

    // Check if tool exists
    const existingTool = await prisma.knowledgeBaseTool.findUnique({
      where: { id },
    })

    if (!existingTool) {
      return NextResponse.json(
        { success: false, error: 'Tool niet gevonden' },
        { status: 404 }
      )
    }

    // Check if new slug is unique (if changed)
    if (slug && slug !== existingTool.slug) {
      const slugExists = await prisma.knowledgeBaseTool.findUnique({
        where: { slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Deze slug bestaat al' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (nameNl !== undefined) updateData.nameNl = nameNl
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description
    if (toolType !== undefined) updateData.toolType = toolType
    if (externalUrl !== undefined) updateData.externalUrl = externalUrl
    if (isActive !== undefined) updateData.isActive = isActive
    if (requiresAuth !== undefined) updateData.requiresAuth = requiresAuth
    if (config !== undefined) updateData.config = config

    const tool = await prisma.knowledgeBaseTool.update({
      where: { id },
      data: updateData,
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

// DELETE /api/admin/kennisbank/tools/[id] - Delete a tool
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

    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_TOOLS')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    // Check if tool exists
    const existingTool = await prisma.knowledgeBaseTool.findUnique({
      where: { id },
    })

    if (!existingTool) {
      return NextResponse.json(
        { success: false, error: 'Tool niet gevonden' },
        { status: 404 }
      )
    }

    // Disconnect from articles first
    await prisma.knowledgeBaseTool.update({
      where: { id },
      data: {
        articles: {
          set: [],
        },
      },
    })

    // Delete the tool
    await prisma.knowledgeBaseTool.delete({
      where: { id },
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
