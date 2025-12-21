/**
 * Subscription API - Get current user's subscription info
 */

import { NextResponse } from 'next/server'
import { getCurrentUserSubscription } from '@/lib/subscription'

export async function GET() {
  try {
    const subscription = await getCurrentUserSubscription()

    if (!subscription) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van abonnement' },
      { status: 500 }
    )
  }
}
