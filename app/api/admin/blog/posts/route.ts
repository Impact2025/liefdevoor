import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { name: true }
        },
        category: {
          select: { name: true, color: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Admin posts fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, categoryId, excerpt, featuredImage, published } = await request.json()

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 })
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json({ error: 'Slug already exists. Please choose a different title.' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        excerpt,
        featuredImage,
        published: published || false,
        authorId: session.user.id,
        categoryId
      },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, color: true } }
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}