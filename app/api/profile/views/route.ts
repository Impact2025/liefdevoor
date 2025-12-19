import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasFeature } from '@/lib/subscription'
import { sendProfileViewNotification } from '@/lib/services/push/push-notifications'

/**
 * GET /api/profile/views
 *
 * Get list of users who viewed your profile (premium feature)
 */
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

    // Check if user has premium access to see profile views
    const canSeeViews = await hasFeature(user.id, 'seeWhoLikesYou')

    if (!canSeeViews) {
      // Return count only for non-premium users
      const viewCount = await prisma.profileView.count({
        where: { viewedId: user.id },
      })

      return NextResponse.json({
        isPremiumFeature: true,
        viewCount,
        viewers: [],
        message: 'Upgrade naar Premium om te zien wie je profiel heeft bekeken',
      })
    }

    // Parse pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Get profile views with viewer details
    const [views, total] = await Promise.all([
      prisma.profileView.findMany({
        where: { viewedId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          viewer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              city: true,
              birthDate: true,
              isPhotoVerified: true,
            },
          },
        },
      }),
      prisma.profileView.count({ where: { viewedId: user.id } }),
    ])

    // Format viewers with age
    const viewers = views.map((view) => ({
      id: view.viewer.id,
      name: view.viewer.name,
      profileImage: view.viewer.profileImage,
      city: view.viewer.city,
      age: view.viewer.birthDate
        ? Math.floor((Date.now() - new Date(view.viewer.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
      isVerified: view.viewer.isPhotoVerified,
      viewedAt: view.createdAt,
    }))

    return NextResponse.json({
      isPremiumFeature: false,
      viewCount: total,
      viewers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Profile Views] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * POST /api/profile/views
 *
 * Record a profile view
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const viewer = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true },
    })

    if (!viewer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { viewedId } = await request.json()

    if (!viewedId || viewedId === viewer.id) {
      return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 })
    }

    // Check if viewed user exists
    const viewedUser = await prisma.user.findUnique({
      where: { id: viewedId },
      select: { id: true },
    })

    if (!viewedUser) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Upsert profile view (update timestamp if already viewed)
    await prisma.profileView.upsert({
      where: {
        viewerId_viewedId: {
          viewerId: viewer.id,
          viewedId,
        },
      },
      create: {
        viewerId: viewer.id,
        viewedId,
      },
      update: {
        createdAt: new Date(),
      },
    })

    // Check if viewed user has premium and send notification
    const hasPremium = await hasFeature(viewedId, 'seeWhoLikesYou')
    if (hasPremium) {
      sendProfileViewNotification(
        viewedId,
        viewer.name || 'Iemand',
        viewer.id
      ).catch(err => console.error('[Push] Profile view notification failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Profile Views] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
