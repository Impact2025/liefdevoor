import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/permissions'

// PATCH /api/admin/kennisbank/categories/[id] - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_CATEGORIES')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om categorieën te beheren' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const categoryId = params.id

    // Check if category exists
    const existingCategory = await prisma.knowledgeBaseCategory.findUnique({
      where: { id: categoryId },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Categorie niet gevonden' },
        { status: 404 }
      )
    }

    // Check if new slug is unique (if changed)
    if (body.slug && body.slug !== existingCategory.slug) {
      const slugExists = await prisma.knowledgeBaseCategory.findUnique({
        where: { slug: body.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Deze slug bestaat al' },
          { status: 400 }
        )
      }
    }

    // Update category
    const category = await prisma.knowledgeBaseCategory.update({
      where: { id: categoryId },
      data: {
        name: body.nameNl || body.name,
        nameNl: body.nameNl,
        slug: body.slug,
        description: body.descriptionNl || body.description,
        descriptionNl: body.descriptionNl,
        icon: body.icon,
        color: body.color,
        order: body.order,
        parentId: body.parentId || null,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        isVisible: body.isVisible,
        isProfessionalOnly: body.isProfessionalOnly,
      },
    })

    return NextResponse.json({
      success: true,
      data: { category },
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het bijwerken van de categorie' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/kennisbank/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const canManage = await hasPermission(session.user.id, 'MANAGE_KB_CATEGORIES')
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Geen toegang om categorieën te verwijderen' },
        { status: 403 }
      )
    }

    const categoryId = params.id

    // Check if category exists
    const category = await prisma.knowledgeBaseCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { articles: true, children: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categorie niet gevonden' },
        { status: 404 }
      )
    }

    // Check if category has articles
    if (category._count.articles > 0) {
      return NextResponse.json(
        { success: false, error: 'Categorie bevat nog artikelen. Verplaats of verwijder deze eerst.' },
        { status: 400 }
      )
    }

    // Check if category has children
    if (category._count.children > 0) {
      return NextResponse.json(
        { success: false, error: 'Categorie bevat nog subcategorieën. Verwijder deze eerst.' },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.knowledgeBaseCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({
      success: true,
      message: 'Categorie verwijderd',
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Er ging iets mis bij het verwijderen van de categorie' },
      { status: 500 }
    )
  }
}
