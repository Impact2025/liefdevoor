import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Gender } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        preferences: true,
      },
    })

    return NextResponse.json({ preferences: user?.preferences || {} })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { minAge, maxAge, maxDistance, showMe, emailNotifications, pushNotifications } = body

    // Validate
    if (minAge && (minAge < 18 || minAge > 99)) {
      return NextResponse.json({ error: 'Invalid minAge' }, { status: 400 })
    }
    if (maxAge && (maxAge < 18 || maxAge > 99)) {
      return NextResponse.json({ error: 'Invalid maxAge' }, { status: 400 })
    }
    if (minAge && maxAge && minAge > maxAge) {
      return NextResponse.json({ error: 'minAge cannot be greater than maxAge' }, { status: 400 })
    }

    // Build preferences object
    const preferences: any = {}

    if (minAge !== undefined) preferences.minAge = minAge
    if (maxAge !== undefined) preferences.maxAge = maxAge
    if (maxDistance !== undefined) preferences.maxDistance = maxDistance
    if (showMe !== undefined) {
      if (showMe === 'EVERYONE') {
        preferences.showMe = 'EVERYONE'
      } else if (Object.values(Gender).includes(showMe)) {
        preferences.showMe = showMe
      }
    }
    if (emailNotifications !== undefined) preferences.emailNotifications = emailNotifications
    if (pushNotifications !== undefined) preferences.pushNotifications = pushNotifications

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        preferences: preferences,
      },
      select: {
        preferences: true,
      },
    })

    return NextResponse.json({
      success: true,
      preferences: user.preferences,
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
