import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true
      },
      include: {
        author: {
          select: {
            name: true,
            profileImage: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      bannerText: post.bannerText,
      published: post.published,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      category: post.category,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      likeCount: post.likeCount,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van het artikel' },
      { status: 500 }
    )
  }
}
