import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { name: true } },
        category: { select: { id: true, name: true, color: true } }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, categoryId, excerpt, featuredImage, published } = await request.json()

    // Generate new slug if title changed
    let slug = undefined
    if (title) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Check if slug exists (excluding current post)
      const existingPost = await prisma.post.findFirst({
        where: {
          slug,
          id: { not: params.id }
        }
      })

      if (existingPost) {
        return NextResponse.json({ error: 'Slug already exists. Please choose a different title.' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (slug !== undefined) updateData.slug = slug
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (published !== undefined) updateData.published = published

    const post = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, color: true } }
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.post.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}