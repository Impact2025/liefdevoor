/**
 * Swipe Count API - Get today's like count
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getDailyLikeCount } from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    const count = await getDailyLikeCount(user.id)

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching swipe count:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    )
  }
}
