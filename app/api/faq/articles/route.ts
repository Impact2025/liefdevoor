import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/faq/articles - List FAQ articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const where: any = { isPublished: true }
    if (categoryId) where.categoryId = categoryId
    if (featured === 'true') where.isFeatured = true

    if (search) {
      where.OR = [
        { titleNl: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: search.toLowerCase().split(' ') } }
      ]
    }

    const offset = (page - 1) * limit

    const [articles, total] = await Promise.all([
      prisma.fAQArticle.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, nameNl: true, slug: true }
          },
          author: {
            select: { id: true, name: true }
          }
        },
        orderBy: featured === 'true'
          ? { viewCount: 'desc' }
          : { order: 'asc' },
        skip: offset,
        take: limit
      }),
      prisma.fAQArticle.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: { articles },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching FAQ articles:', error)

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het ophalen van de artikelen' },
      { status: 500 }
    )
  }
}
