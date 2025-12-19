import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/analytics/events
 * Receive and store analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { events, userId } = body

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events' }, { status: 400 })
    }

    // In production, send to analytics service (Mixpanel, Amplitude, etc.)
    // For now, log to console and optionally store in database

    console.log('[Analytics] Received events:', {
      userId,
      eventCount: events.length,
      events: events.map((e: any) => ({
        event: e.event,
        timestamp: e.properties?.timestamp,
      })),
    })

    // Store important events in database for internal analytics
    const importantEvents = ['signup_complete', 'match_created', 'subscription_complete', 'report_user']
    const eventsToStore = events.filter((e: any) => importantEvents.includes(e.event))

    if (eventsToStore.length > 0 && userId) {
      // Create notifications or audit logs for important events
      for (const event of eventsToStore) {
        if (event.event === 'report_user') {
          console.log('[Analytics] User report event:', event.properties)
        }
        if (event.event === 'subscription_complete') {
          console.log('[Analytics] Subscription completed:', event.properties)
        }
      }
    }

    return NextResponse.json({ success: true, received: events.length })
  } catch (error) {
    console.error('[Analytics] Error processing events:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
