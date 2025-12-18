import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireCSRF } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfCheck = await requireCSRF(request)
    if (!csrfCheck.isValid) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action } = body // action: 'block' or 'unblock'

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['block', 'unblock'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Prevent self-blocking
    if (currentUser.id === userId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    if (action === 'block') {
      // Check if already blocked
      const existingBlock = await prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: currentUser.id,
            blockedId: userId,
          },
        },
      })

      if (existingBlock) {
        return NextResponse.json({ error: 'User is already blocked' }, { status: 400 })
      }

      // Create block
      await prisma.block.create({
        data: {
          blockerId: currentUser.id,
          blockedId: userId,
        },
      })

      // Remove any existing matches between these users
      const match = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: currentUser.id, user2Id: userId },
            { user1Id: userId, user2Id: currentUser.id },
          ],
        },
      })

      if (match) {
        await prisma.match.delete({
          where: { id: match.id },
        })
      }

      return NextResponse.json({ message: 'User blocked successfully' })
    } else {
      // Unblock
      const block = await prisma.block.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: currentUser.id,
            blockedId: userId,
          },
        },
      })

      if (!block) {
        return NextResponse.json({ error: 'User is not blocked' }, { status: 400 })
      }

      await prisma.block.delete({
        where: { id: block.id },
      })

      return NextResponse.json({ message: 'User unblocked successfully' })
    }
  } catch (error) {
    console.error('Block action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'blocked' // 'blocked' or 'blocking'

    let blocks
    if (type === 'blocked') {
      // Users who blocked me
      blocks = await prisma.block.findMany({
        where: { blockedId: user.id },
        include: {
          blocker: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Users I blocked
      blocks = await prisma.block.findMany({
        where: { blockerId: user.id },
        include: {
          blocked: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ blocks: blocks })
  } catch (error) {
    console.error('Blocks fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}