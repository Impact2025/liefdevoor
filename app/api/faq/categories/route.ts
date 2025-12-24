import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/faq/categories - Get all FAQ categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.fAQCategory.findMany({
      where: { isVisible: true },
      include: {
        _count: {
          select: { articles: { where: { isPublished: true } } }
        },
        subcategories: {
          where: { isVisible: true },
          include: {
            _count: {
              select: { articles: { where: { isPublished: true } } }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { categories }
    })
  } catch (error: any) {
    console.error('Error fetching FAQ categories:', error)

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het ophalen van de categorieën' },
      { status: 500 }
    )
  }
}
