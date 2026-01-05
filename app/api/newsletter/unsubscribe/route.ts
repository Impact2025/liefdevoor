import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Ongeldige+afmeldlink', request.url)
      )
    }

    // Find subscription by unsubscribe token
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { unsubscribeToken: token },
    })

    if (!subscription) {
      return NextResponse.redirect(
        new URL('/blog?newsletter=error&message=Ongeldige+afmeldlink', request.url)
      )
    }

    // Check if already unsubscribed
    if (!subscription.isActive) {
      return NextResponse.redirect(
        new URL('/blog?newsletter=already-unsubscribed', request.url)
      )
    }

    // Unsubscribe
    await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    })

    return NextResponse.redirect(
      new URL('/blog?newsletter=unsubscribed', request.url)
    )
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.redirect(
      new URL('/blog?newsletter=error&message=Er+is+iets+misgegaan', request.url)
    )
  }
}
