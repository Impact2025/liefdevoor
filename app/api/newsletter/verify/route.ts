import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Ongeldige+verificatielink', request.url)
      )
    }

    // Find subscription by token
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { verifyToken: token },
    })

    if (!subscription) {
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Ongeldige+of+verlopen+verificatielink', request.url)
      )
    }

    // Check if token is expired
    if (subscription.verifyTokenExpires && subscription.verifyTokenExpires < new Date()) {
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Deze+verificatielink+is+verlopen', request.url)
      )
    }

    // Check if already verified
    if (subscription.isVerified) {
      return NextResponse.redirect(
        new URL('/blog?newsletter=already-verified', request.url)
      )
    }

    // Verify subscription
    await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifyToken: null,
        verifyTokenExpires: null,
      },
    })

    return NextResponse.redirect(
      new URL('/blog?newsletter=verified', request.url)
    )
  } catch (error) {
    console.error('Newsletter verification error:', error)
    return NextResponse.redirect(
      new URL('/blog?newsletter=error&message=Er+is+iets+misgegaan', request.url)
    )
  }
}
