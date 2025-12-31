import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/kennisbank/tools - List all tools
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const where: any = {}

    if (activeOnly) {
      where.isActive = true
    }

    if (type) {
      where.toolType = type
    }

    const tools = await prisma.knowledgeBaseTool.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Format response
    const formattedTools = tools.map((tool) => ({
      id: tool.id,
      name: tool.nameNl,
      slug: tool.slug,
      description: tool.description,
      toolType: tool.toolType,
      externalUrl: tool.externalUrl,
      isActive: tool.isActive,
      requiresAuth: tool.requiresAuth,
      usageCount: tool.usageCount,
    }))

    return NextResponse.json({
      success: true,
      data: { tools: formattedTools },
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van tools' },
      { status: 500 }
    )
  }
}

// POST /api/kennisbank/tools - Create new tool (admin only)
export async function POST(request: NextRequest) {
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

    const {
      name,
      nameNl,
      slug,
      description,
      toolType,
      config = {},
      externalUrl,
      requiresAuth = false,
    } = body

    // Validation
    if (!nameNl || !slug || !toolType) {
      return NextResponse.json(
        { success: false, error: 'Naam, slug en type zijn verplicht' },
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

    // Create tool
    const tool = await prisma.knowledgeBaseTool.create({
      data: {
        name: name || nameNl,
        nameNl,
        slug,
        description,
        toolType,
        config,
        externalUrl,
        requiresAuth,
      },
    })

    return NextResponse.json({
      success: true,
      data: { tool },
    })
  } catch (error) {
    console.error('Error creating tool:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het maken van de tool' },
      { status: 500 }
    )
  }
}
