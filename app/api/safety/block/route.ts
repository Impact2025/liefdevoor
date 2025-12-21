/**
 * Block User API - Wereldklasse Safety
 *
 * Block users to prevent seeing them in discover/matches
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { auditLog } from '@/lib/audit'

/**
 * POST /api/safety/block
 * Block a user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { blockedId } = await request.json()

    if (!blockedId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (blockedId === user.id) {
      return NextResponse.json({ error: 'Je kunt jezelf niet blokkeren' }, { status: 400 })
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId,
        },
      },
    })

    if (existingBlock) {
      return NextResponse.json(
        { error: 'Je hebt deze gebruiker al geblokkeerd' },
        { status: 400 }
      )
    }

    // Create block
    const block = await prisma.block.create({
      data: {
        blockerId: user.id,
        blockedId,
      },
    })

    // Remove any existing match
    await prisma.match.deleteMany({
      where: {
        OR: [
          { user1Id: user.id, user2Id: blockedId },
          { user1Id: blockedId, user2Id: user.id },
        ],
      },
    })

    // Audit log
    auditLog('USER_BLOCKED', {
      userId: user.id,
      details: {
        blockId: block.id,
        blockedId,
      },
    })

    return successResponse({
      message: 'Gebruiker geblokkeerd. Je zult elkaar niet meer zien.',
      block: {
        id: block.id,
        createdAt: block.createdAt,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/safety/block
 * Unblock a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const blockedId = searchParams.get('userId')

    if (!blockedId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Delete block
    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId,
        },
      },
    })

    // Audit log
    auditLog('USER_UNBLOCKED', {
      userId: user.id,
      details: { blockedId },
    })

    return successResponse({
      message: 'Blokkering opgeheven',
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/safety/block
 * Get blocked users list
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const blocks = await prisma.block.findMany({
      where: { blockerId: user.id },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({
      blocks: blocks.map(b => ({
        id: b.id,
        user: b.blocked,
        blockedAt: b.createdAt,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
