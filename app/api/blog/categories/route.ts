import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      color: cat.color,
      postCount: cat._count.posts
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}