import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUpstash } from '@/lib/upstash'
import { requireAnyPermission, AdminPermission } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check blog view permissions
    try {
      await requireAnyPermission(session.user.id, [
        AdminPermission.CREATE_BLOG_POSTS,
        AdminPermission.EDIT_BLOG_POSTS,
        AdminPermission.VIEW_ANALYTICS
      ])
    } catch (permissionError) {
      return NextResponse.json({
        error: 'Insufficient permissions',
        message: 'You need blog management permissions to view posts'
      }, { status: 403 })
    }

    // Check Upstash cache first (10 min TTL for blog posts - they change less frequently)
    const cacheKey = 'admin:blog:posts'
    const upstash = getUpstash()

    if (upstash) {
      try {
        const cached = await upstash.get(cacheKey)
        if (cached) {
          console.log('[Blog Posts] Cache HIT - returning cached posts')
          return NextResponse.json(cached)
        }
      } catch (error) {
        console.warn('[Cache] Upstash get failed:', error)
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
    if (upstash) {
      try {
        await upstash.setex(cacheKey, 600, JSON.stringify(response))
        console.log('[Blog Posts] Cached posts for 10 minutes')
      } catch (error) {
        console.warn('[Cache] Upstash set failed:', error)
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check CREATE_BLOG_POSTS permission
    try {
      await requireAnyPermission(session.user.id, [AdminPermission.CREATE_BLOG_POSTS])
    } catch (permissionError) {
      return NextResponse.json({
        error: 'Insufficient permissions',
        message: 'You need CREATE_BLOG_POSTS permission to create posts'
      }, { status: 403 })
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
    const upstash = getUpstash()
    if (upstash) {
      try {
        await upstash.del('admin:blog:posts')
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