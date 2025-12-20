/**
 * Data Export API
 * AVG Artikel 20 - Recht op dataportabiliteit
 *
 * Allows users to export all their personal data in JSON format
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST - Request data export
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if there's already a pending export request
    const existingRequest = await prisma.dataExportRequest.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'processing'] },
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'Er is al een data export aanvraag in behandeling',
          requestId: existingRequest.id,
        },
        { status: 400 }
      )
    }

    // Create export request
    const exportRequest = await prisma.dataExportRequest.create({
      data: {
        userId,
        status: 'pending',
      },
    })

    // In a real implementation, you would:
    // 1. Queue a background job to collect all user data
    // 2. Generate a secure download link
    // 3. Send an email when ready
    // For now, we'll generate the data immediately

    // Collect all user data
    const userData = await collectUserData(userId)

    // In production: Upload to secure storage and generate download link
    // For now: Store as JSON string (in real app, use S3/cloud storage)
    const dataJson = JSON.stringify(userData, null, 2)

    // Update request with "completed" status
    // In production: This would be done by a background job
    await prisma.dataExportRequest.update({
      where: { id: exportRequest.id },
      data: {
        status: 'completed',
        downloadUrl: `data:application/json;base64,${Buffer.from(dataJson).toString('base64')}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        completedAt: new Date(),
      },
    })

    // In production: Send email with download link
    console.log(`[Data Export] Export completed for user ${userId}`)

    return NextResponse.json({
      success: true,
      requestId: exportRequest.id,
      message: 'Data export aangevraagd. U ontvangt een email wanneer de export klaar is.',
    })
  } catch (error) {
    console.error('[Data Export API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve export status or download
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (requestId) {
      // Get specific export request
      const exportRequest = await prisma.dataExportRequest.findFirst({
        where: {
          id: requestId,
          userId: session.user.id,
        },
      })

      if (!exportRequest) {
        return NextResponse.json({ error: 'Export request not found' }, { status: 404 })
      }

      return NextResponse.json({
        status: exportRequest.status,
        downloadUrl: exportRequest.downloadUrl,
        expiresAt: exportRequest.expiresAt,
        createdAt: exportRequest.createdAt,
        completedAt: exportRequest.completedAt,
      })
    } else {
      // Get all export requests for user
      const requests = await prisma.dataExportRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      return NextResponse.json({ requests })
    }
  } catch (error) {
    console.error('[Data Export API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Collect all user data for export
 * AVG requires all personal data to be exportable
 */
async function collectUserData(userId: string) {
  // Fetch all user-related data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      photos: true,
      outgoingSwipes: {
        include: {
          swiped: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
      incomingSwipes: {
        include: {
          swiper: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
      matches1: {
        include: {
          user2: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
      matches2: {
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
      messages: {
        include: {
          match: {
            select: {
              id: true,
            },
          },
        },
      },
      subscriptions: true,
      profileViewsSent: true,
      profileViewsReceived: true,
      sentSuperMessages: true,
      receivedSuperMessages: true,
      creditPurchases: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Remove sensitive fields
  const { passwordHash, twoFactorSecret, twoFactorBackupCodes, ...safeUser } = user

  // Structure data for export
  return {
    exportDate: new Date().toISOString(),
    exportVersion: '1.0',
    notice: 'Dit is uw volledige data export zoals vereist onder AVG Artikel 20. Deze data is alleen voor uw persoonlijk gebruik.',

    profile: {
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      birthDate: safeUser.birthDate,
      gender: safeUser.gender,
      city: safeUser.city,
      postcode: safeUser.postcode,
      bio: safeUser.bio,
      interests: safeUser.interests,
      preferences: safeUser.preferences,
      isVerified: safeUser.isVerified,
      isPhotoVerified: safeUser.isPhotoVerified,
      createdAt: safeUser.createdAt,
      updatedAt: safeUser.updatedAt,
      subscriptionTier: safeUser.subscriptionTier,
      credits: safeUser.credits,
      profileComplete: safeUser.profileComplete,
    },

    photos: safeUser.photos.map(photo => ({
      id: photo.id,
      url: photo.url,
      order: photo.order,
      createdAt: photo.createdAt,
    })),

    swipes: {
      outgoing: safeUser.outgoingSwipes.map(swipe => ({
        swipedUserId: swipe.swipedId,
        swipedUserName: swipe.swiped.name,
        isLike: swipe.isLike,
        isSuperLike: swipe.isSuperLike,
        createdAt: swipe.createdAt,
      })),
      incoming: safeUser.incomingSwipes.map(swipe => ({
        swiperUserId: swipe.swiperId,
        swiperUserName: swipe.swiper.name,
        isLike: swipe.isLike,
        isSuperLike: swipe.isSuperLike,
        createdAt: swipe.createdAt,
      })),
    },

    matches: [
      ...safeUser.matches1.map(match => ({
        matchId: match.id,
        matchedWithUserId: match.user2.id,
        matchedWithUserName: match.user2.name,
        createdAt: match.createdAt,
      })),
      ...safeUser.matches2.map(match => ({
        matchId: match.id,
        matchedWithUserId: match.user1.id,
        matchedWithUserName: match.user1.name,
        createdAt: match.createdAt,
      })),
    ],

    messages: safeUser.messages.map(msg => ({
      messageId: msg.id,
      matchId: msg.matchId,
      content: msg.content,
      audioUrl: msg.audioUrl,
      read: msg.read,
      createdAt: msg.createdAt,
    })),

    subscriptions: safeUser.subscriptions.map(sub => ({
      id: sub.id,
      plan: sub.plan,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      createdAt: sub.createdAt,
    })),

    profileViews: {
      sent: safeUser.profileViewsSent.length,
      received: safeUser.profileViewsReceived.length,
    },

    superMessages: {
      sent: safeUser.sentSuperMessages.length,
      received: safeUser.receivedSuperMessages.length,
    },

    creditPurchases: safeUser.creditPurchases.map(purchase => ({
      id: purchase.id,
      credits: purchase.credits,
      amount: purchase.amount,
      status: purchase.status,
      createdAt: purchase.createdAt,
    })),

    statistics: {
      totalSwipes: safeUser.outgoingSwipes.length,
      totalMatches: safeUser.matches1.length + safeUser.matches2.length,
      totalMessages: safeUser.messages.length,
      memberSince: safeUser.createdAt,
      lastSeen: safeUser.lastSeen,
    },
  }
}
