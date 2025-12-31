import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/admin/kennisbank/categories - List all categories with hierarchy
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
    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_CATEGORIES')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang' },
        { status: 403 }
      )
    }

    // Get top-level categories with children
    const categories = await prisma.knowledgeBaseCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            _count: {
              select: { articles: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Format response with article counts
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameNl: cat.nameNl,
      slug: cat.slug,
      description: cat.description,
      descriptionNl: cat.descriptionNl,
      icon: cat.icon,
      color: cat.color,
      order: cat.order,
      isVisible: cat.isVisible,
      isProfessionalOnly: cat.isProfessionalOnly,
      parentId: cat.parentId,
      articleCount: cat._count.articles,
      children: cat.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        nameNl: child.nameNl,
        slug: child.slug,
        description: child.description,
        descriptionNl: child.descriptionNl,
        icon: child.icon,
        color: child.color,
        order: child.order,
        isVisible: child.isVisible,
        isProfessionalOnly: child.isProfessionalOnly,
        parentId: child.parentId,
        articleCount: child._count.articles,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: { categories: formattedCategories },
    })
  } catch (error) {
    console.error('Error fetching admin categories:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van categorieën' },
      { status: 500 }
    )
  }
}
