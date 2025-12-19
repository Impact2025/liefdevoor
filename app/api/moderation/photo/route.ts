import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  moderateImage,
  getModerationMessage,
  type ModerationResult,
} from '@/lib/services/moderation/image-moderation'

/**
 * POST /api/moderation/photo
 *
 * Moderate a photo before/after upload
 * Can be called proactively or as part of upload flow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { imageUrl, photoId } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }

    // Run moderation
    const result = await moderateImage(imageUrl)

    // If photoId provided, log the moderation result
    // Note: Photo model doesn't have moderation fields - these could be added later
    if (photoId) {
      console.log(`[Moderation] Photo ${photoId}: ${result.approved ? 'approved' : 'rejected'}`)

      // If photo was rejected, create notification
      if (!result.approved) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'moderation',
            title: 'Foto Afgekeurd',
            message: getModerationMessage(result),
          },
        })
      }
    }

    // Decrease safety score if severely flagged
    if (!result.approved && result.flags.some(f => f.severity === 'high')) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          safetyScore: { decrement: 10 },
        },
      })
    }

    return NextResponse.json({
      approved: result.approved,
      confidence: result.confidence,
      message: getModerationMessage(result),
      flags: result.flags,
      provider: result.provider,
    })
  } catch (error) {
    console.error('[Moderation] Error:', error)
    return NextResponse.json({ error: 'Moderation failed' }, { status: 500 })
  }
}

/**
 * GET /api/moderation/photo
 *
 * Get pending photos for admin moderation queue
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get photos pending manual review
    // These are photos that failed auto-moderation or need human review
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // For now, get recently uploaded photos
    // In a full implementation, you'd have a moderationStatus field
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            safetyScore: true,
          },
        },
      },
    })

    const total = await prisma.photo.count()

    return NextResponse.json({
      photos: photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        uploadedAt: photo.createdAt,
        user: {
          id: photo.user.id,
          name: photo.user.name,
          email: photo.user.email,
          safetyScore: photo.user.safetyScore,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Moderation Queue] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
