import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { planId } = await request.json()

  if (!planId) {
    return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
  }

  const plans = {
    basic: { price: 0, name: 'Basic' },
    premium: { price: 9.99, name: 'Premium' },
    gold: { price: 19.99, name: 'Gold' }
  }

  const plan = plans[planId as keyof typeof plans]

  if (!plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  if (plan.price === 0) {
    // Free plan, just create subscription
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: planId,
        status: 'active'
      }
    })
    return NextResponse.json({ success: true })
  }

  // Check if user already has an active subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: 'active'
    }
  })

  if (existingSubscription) {
    return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 })
  }

  // Create subscription in db
  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan: planId,
      status: 'pending'
    }
  })

  // Create Multisafepay order
  const orderData = {
    order_id: subscription.id,
    amount: Math.round(plan.price * 100), // in cents
    currency: 'EUR',
    description: `${plan.name} subscription - Liefde Voor Iedereen`,
    payment_options: {
      notification_url: `${process.env.NEXTAUTH_URL}/api/subscription/webhook`,
      redirect_url: `${process.env.NEXTAUTH_URL}/subscription/success?order_id=${subscription.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription/cancel`
    }
  }

  try {
    const res = await fetch('https://api.multisafepay.com/v1/json/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.MULTISAFEPAY_API_KEY!
      },
      body: JSON.stringify(orderData)
    })

    if (!res.ok) {
      const errorData = await res.text()
      console.error('Multisafepay error:', errorData)
      return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 })
    }

    const paymentData = await res.json()

    // Update subscription with multisafepayId
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { multisafepayId: paymentData.order_id }
    })

    return NextResponse.json({ paymentUrl: paymentData.payment_url })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 500 })
  }
}