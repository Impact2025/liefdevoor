import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/admin/kennisbank/tools - List all tools
export async function GET(request: NextRequest) {
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
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const tools = await prisma.knowledgeBaseTool.findMany({
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Calculate stats
    const totalUsage = tools.reduce((sum, t) => sum + t.usageCount, 0)
    const activeTools = tools.filter(t => t.isActive).length

    return NextResponse.json({
      success: true,
      data: {
        tools,
        stats: {
          total: tools.length,
          active: activeTools,
          inactive: tools.length - activeTools,
          totalUsage,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching admin tools:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van tools' },
      { status: 500 }
    )
  }
}

// POST /api/admin/kennisbank/tools - Create a new tool
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!name || !nameNl || !slug || !toolType) {
      return NextResponse.json(
        { success: false, error: 'Naam, Nederlandse naam, slug en type zijn verplicht' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingTool = await prisma.knowledgeBaseTool.findUnique({
      where: { slug },
    })

    if (existingTool) {
      return NextResponse.json(
        { success: false, error: 'Deze slug bestaat al' },
        { status: 400 }
      )
    }

    const tool = await prisma.knowledgeBaseTool.create({
      data: {
        name,
        nameNl,
        slug,
        description: description || null,
        toolType,
        externalUrl: externalUrl || null,
        isActive: isActive ?? true,
        requiresAuth: requiresAuth ?? false,
        config: config || {},
      },
    })

    return NextResponse.json({
      success: true,
      data: { tool },
    })
  } catch (error) {
    console.error('Error creating tool:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het aanmaken van de tool' },
      { status: 500 }
    )
  }
}
