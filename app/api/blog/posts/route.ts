import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedBlogPosts } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Use cached posts for first page without filters (most common case)
    if (page === 1 && !category && limit === 12) {
      const cachedPosts = await getCachedBlogPosts({ limit })

      const formattedPosts = cachedPosts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        slug: post.slug,
        featuredImage: post.featuredImage,
        bannerText: post.bannerText || null,
        author: post.author,
        category: post.category,
        createdAt: typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString(),
        likeCount: post.likeCount,
      }))

      const totalCount = await prisma.post.count({ where: { published: true } })

      return NextResponse.json({
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    }

    // For filtered/paginated requests, use dynamic query
    const where: any = {
      published: true
    }

    if (category) {
      where.category = {
        name: {
          equals: category.replace(/-/g, ' '),
          mode: 'insensitive'
        }
      }
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { name: true, profileImage: true }
          },
          category: {
            select: { name: true, color: true, icon: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.post.count({ where })
    ])

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
      content: post.content,
      slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      featuredImage: post.featuredImage,
      bannerText: post.bannerText,
      author: post.author,
      category: post.category,
      createdAt: post.createdAt.toISOString(),
      readTime: Math.ceil(post.content.split(' ').length / 200) // Rough estimate
    }))

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}