import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// GET /api/kennisbank/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeCount = searchParams.get('includeCount') === 'true'
    const session = await getServerSession(authOptions)

    // Check if user has professional access
    let canAccessProfessional = false
    if (session?.user?.id) {
      const professional = await prisma.professionalAccount.findUnique({
        where: { userId: session.user.id },
      })
      canAccessProfessional = professional?.isVerified || false
    }

    // Build where clause
    const where: any = {
      isVisible: true,
      parentId: null, // Only top-level categories
    }

    // Hide professional-only categories for non-professionals
    if (!canAccessProfessional) {
      where.isProfessionalOnly = false
    }

    // Get categories
    const categories = await prisma.knowledgeBaseCategory.findMany({
      where,
      include: {
        children: includeChildren ? {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          include: includeCount ? {
            _count: {
              select: { articles: { where: { isPublished: true } } },
            },
          } : undefined,
        } : false,
        _count: includeCount ? {
          select: { articles: { where: { isPublished: true } } },
        } : undefined,
      },
      orderBy: { order: 'asc' },
    })

    // Format response
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.nameNl,
      slug: category.slug,
      description: category.descriptionNl,
      icon: category.icon,
      color: category.color,
      isProfessionalOnly: category.isProfessionalOnly,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      articleCount: (category as any)._count?.articles || 0,
      children: includeChildren
        ? (category.children || []).map((child: any) => ({
            id: child.id,
            name: child.nameNl,
            slug: child.slug,
            description: child.descriptionNl,
            icon: child.icon,
            color: child.color,
            articleCount: child._count?.articles || 0,
          }))
        : undefined,
    }))

    return NextResponse.json({
      success: true,
      data: { categories: formattedCategories },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het ophalen van categorieën' },
      { status: 500 }
    )
  }
}

// POST /api/kennisbank/categories - Create new category (admin only)
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
    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_CATEGORIES')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om categorieën te beheren' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      name,
      nameNl,
      slug,
      description,
      descriptionNl,
      icon,
      color = '#E11D48',
      order = 0,
      parentId,
      metaTitle,
      metaDescription,
      isProfessionalOnly = false,
    } = body

    // Validation
    if (!nameNl || !slug) {
      return NextResponse.json(
        { success: false, error: 'Naam en slug zijn verplicht' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existingCategory = await prisma.knowledgeBaseCategory.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Deze slug bestaat al' },
        { status: 400 }
      )
    }

    // Create category
    const category = await prisma.knowledgeBaseCategory.create({
      data: {
        name: name || nameNl,
        nameNl,
        slug,
        description,
        descriptionNl,
        icon,
        color,
        order,
        parentId,
        metaTitle,
        metaDescription,
        isProfessionalOnly,
      },
    })

    return NextResponse.json({
      success: true,
      data: { category },
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het maken van de categorie' },
      { status: 500 }
    )
  }
}
