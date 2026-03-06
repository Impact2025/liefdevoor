import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [user, migrationUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          gender: true,
          birthDate: true,
          city: true,
          postcode: true,
          bio: true,
          profileImage: true,
          isVerified: true,
          isPhotoVerified: true,
          isOnboarded: true,
          profileComplete: true,
          subscriptionTier: true,
          credits: true,
          safetyScore: true,
          createdAt: true,
          lastSeen: true,
          isOnline: true,
          registrationSource: true,
          occupation: true,
          education: true,
          _count: {
            select: {
              matches1: true,
              matches2: true,
              photos: true,
            }
          },
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              plan: true,
              status: true,
              startDate: true,
              endDate: true,
              createdAt: true,
            }
          },
        }
      }),
      prisma.migrationUser.findUnique({
        where: { newUserId: params.id },
        select: {
          segment: true,
          status: true,
          claimedAt: true,
          couponCode: true,
          oldEmail: true,
        }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: { ...user, migrationUser } })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
