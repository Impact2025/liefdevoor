import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    console.log('Newsletter verification attempt:', { token: token ? 'present' : 'missing' })

    if (!token) {
      console.error('Newsletter verification failed: No token provided')
      const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Ongeldige+verificatielink', baseUrl)
      )
    }

    // Find subscription by token
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { verifyToken: token },
    })

    console.log('Subscription lookup result:', {
      found: !!subscription,
      isVerified: subscription?.isVerified,
      tokenExpires: subscription?.verifyTokenExpires
    })

    if (!subscription) {
      console.error('Newsletter verification failed: Invalid token')
      const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Ongeldige+of+verlopen+verificatielink', baseUrl)
      )
    }

    // Check if token is expired
    if (subscription.verifyTokenExpires && subscription.verifyTokenExpires < new Date()) {
      console.error('Newsletter verification failed: Token expired')
      const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Deze+verificatielink+is+verlopen', baseUrl)
      )
    }

    // Check if already verified
    if (subscription.isVerified) {
      console.log('Newsletter already verified')
      const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
      return NextResponse.redirect(
        new URL('/blog?newsletter=already-verified', baseUrl)
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

    console.log('Newsletter verification successful:', { email: subscription.email })
    const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
    return NextResponse.redirect(
      new URL('/blog?newsletter=verified', baseUrl)
    )
  } catch (error) {
    console.error('Newsletter verification error:', error)
    const baseUrl = process.env.NEXTAUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`
    return NextResponse.redirect(
      new URL('/blog?newsletter=error&message=Er+is+iets+misgegaan', baseUrl)
    )
  }
}
