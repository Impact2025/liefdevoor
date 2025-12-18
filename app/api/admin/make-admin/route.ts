import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
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

    // SECURITY: Verify the requester is authenticated and is an admin
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })

    return NextResponse.json({ success: true, message: `${email} is now admin` })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}