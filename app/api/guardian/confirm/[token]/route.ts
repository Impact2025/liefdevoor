import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/guardian/confirm/[token] - Confirm guardian email
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || token.length < 32) {
      return NextResponse.redirect(
        new URL('/guardian/error?reason=invalid_token', request.url)
      )
    }

    // Find user with this confirmation token
    const user = await prisma.user.findFirst({
      where: {
        guardianConfirmToken: token,
        guardianEnabled: true,
        guardianConfirmed: false,
      },
      select: {
        id: true,
        name: true,
        guardianName: true,
        guardianEmail: true,
      }
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/guardian/error?reason=token_expired', request.url)
      )
    }

    // Confirm the guardian
    await prisma.user.update({
      where: { id: user.id },
      data: {
        guardianConfirmed: true,
        guardianConfirmToken: null, // Clear the token
      }
    })

    // Create guardian alert for confirmation
    await prisma.guardianAlert.create({
      data: {
        userId: user.id,
        type: 'PROFILE_CHANGE',
        content: {
          action: 'guardian_confirmed',
          guardianName: user.guardianName,
          timestamp: new Date().toISOString(),
        }
      }
    })

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/guardian/success?user=${encodeURIComponent(user.name || 'Gebruiker')}`, request.url)
    )
  } catch (error) {
    console.error('Error confirming guardian:', error)
    return NextResponse.redirect(
      new URL('/guardian/error?reason=server_error', request.url)
    )
  }
}
