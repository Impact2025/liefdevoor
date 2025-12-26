import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRedis } from '@/lib/redis'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Redis cache first (10 min TTL for blog posts - they change less frequently)
    const cacheKey = 'admin:blog:posts'
    const redis = getRedis()

    if (redis) {
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          console.log('[Blog Posts] Cache HIT - returning cached posts')
          return NextResponse.json(JSON.parse(cached))
        }
      } catch (error) {
        console.warn('[Cache] Redis get failed:', error)
      }
    }

    console.log('[Blog Posts] Cache MISS - fetching from database')

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

    const response = { posts }

    // Cache response for 10 minutes
    if (redis) {
      try {
        await redis.setex(cacheKey, 600, JSON.stringify(response))
        console.log('[Blog Posts] Cached posts for 10 minutes')
      } catch (error) {
        console.warn('[Cache] Redis set failed:', error)
      }
    }

    return NextResponse.json(response)
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

    // Invalidate blog posts cache after creating new post
    const redis = getRedis()
    if (redis) {
      try {
        await redis.del('admin:blog:posts')
        console.log('[Blog Posts] Cache invalidated after post creation')
      } catch (error) {
        console.warn('[Cache] Failed to invalidate cache:', error)
      }
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}