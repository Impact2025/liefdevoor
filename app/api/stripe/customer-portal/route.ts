import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBillingPortalSession, getOrCreateStripeCustomer } from '@/lib/services/payment/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const returnUrl = (body as { returnUrl?: string }).returnUrl
      ?? `${process.env.NEXTAUTH_URL}/subscription/manage`

    // Haal of maak Stripe customer aan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    })

    const stripeCustomerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email,
      user?.name ?? null,
    )

    const portalUrl = await createBillingPortalSession(stripeCustomerId, returnUrl)

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('[Customer Portal] Error:', error)
    return NextResponse.json(
      { error: 'Kon de beheerportal niet openen. Probeer het later opnieuw.' },
      { status: 500 },
    )
  }
}
