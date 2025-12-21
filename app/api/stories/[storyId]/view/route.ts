/**
 * Story View API - Mark story as viewed
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const { storyId } = params

    // Check if story exists and is not expired
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        expiresAt: { gt: new Date() },
      },
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Story niet gevonden of verlopen' },
        { status: 404 }
      )
    }

    // Don't count self-views
    if (story.userId === user.id) {
      return NextResponse.json({ success: true, selfView: true })
    }

    // Create view (or ignore if already viewed)
    try {
      await prisma.storyView.create({
        data: {
          storyId,
          viewerId: user.id,
        },
      })

      // Increment view count
      await prisma.story.update({
        where: { id: storyId },
        data: { viewCount: { increment: 1 } },
      })
    } catch (e: any) {
      // Unique constraint violation - already viewed
      if (e.code === 'P2002') {
        return NextResponse.json({ success: true, alreadyViewed: true })
      }
      throw e
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking story as viewed:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
