/**
 * Analytics System - Event Tracking
 * Tracks user behavior for insights and optimization
 */

// Event types for dating app
export const ANALYTICS_EVENTS = {
  // Auth
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  LOGIN: 'login',
  LOGOUT: 'logout',

  // Profile
  PROFILE_VIEW: 'profile_view',
  PROFILE_EDIT: 'profile_edit',
  PHOTO_UPLOAD: 'photo_upload',
  VOICE_INTRO_RECORD: 'voice_intro_record',

  // Discovery
  DISCOVER_VIEW: 'discover_view',
  SWIPE_LEFT: 'swipe_left',
  SWIPE_RIGHT: 'swipe_right',
  SUPER_LIKE: 'super_like',
  PROFILE_EXPAND: 'profile_expand',
  VOICE_INTRO_PLAY: 'voice_intro_play',

  // Matching
  MATCH_CREATED: 'match_created',
  MATCH_VIEWED: 'match_viewed',

  // Chat
  CHAT_OPEN: 'chat_open',
  MESSAGE_SENT: 'message_sent',
  AUDIO_MESSAGE_SENT: 'audio_message_sent',
  MESSAGE_READ: 'message_read',

  // Subscription
  SUBSCRIPTION_VIEW: 'subscription_view',
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_COMPLETE: 'subscription_complete',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',

  // Engagement
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  NOTIFICATION_CLICK: 'notification_click',

  // Safety
  REPORT_USER: 'report_user',
  BLOCK_USER: 'block_user',
  UNBLOCK_USER: 'unblock_user',
} as const

type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined
}

interface UserProperties {
  userId?: string
  email?: string
  name?: string
  plan?: string
  gender?: string
  city?: string
  age?: number
  createdAt?: string
  [key: string]: string | number | boolean | null | undefined
}

class AnalyticsManager {
  private isInitialized = false
  private userId: string | null = null
  private sessionId: string | null = null
  private sessionStart: number = 0
  private eventQueue: Array<{ event: string; properties: EventProperties; timestamp: number }> = []
  private flushInterval: NodeJS.Timeout | null = null

  init() {
    if (this.isInitialized || typeof window === 'undefined') return

    this.isInitialized = true
    this.sessionId = this.generateSessionId()
    this.sessionStart = Date.now()

    // Track session start
    this.track(ANALYTICS_EVENTS.SESSION_START)

    // Track app visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track(ANALYTICS_EVENTS.APP_BACKGROUND)
      } else {
        this.track(ANALYTICS_EVENTS.APP_OPEN)
      }
    })

    // Flush events periodically
    this.flushInterval = setInterval(() => this.flush(), 30000)

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.track(ANALYTICS_EVENTS.SESSION_END, {
        sessionDuration: Math.round((Date.now() - this.sessionStart) / 1000),
      })
      this.flush(true)
    })

    console.log('[Analytics] Initialized')
  }

  identify(userId: string, properties?: UserProperties) {
    this.userId = userId

    // Send to analytics endpoint
    this.sendToServer('identify', {
      userId,
      properties: {
        ...properties,
        sessionId: this.sessionId,
      },
    })

    console.log('[Analytics] User identified:', userId)
  }

  track(event: AnalyticsEvent | string, properties?: EventProperties) {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.init()
    }

    const eventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
      timestamp: Date.now(),
    }

    this.eventQueue.push(eventData)

    // Flush if queue is large
    if (this.eventQueue.length >= 10) {
      this.flush()
    }

    console.log('[Analytics] Event tracked:', event, properties)
  }

  page(pageName: string, properties?: EventProperties) {
    this.track('page_view', {
      page: pageName,
      ...properties,
    })
  }

  private async flush(sync = false) {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    if (sync && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      // Use sendBeacon for sync flush (page unload)
      navigator.sendBeacon(
        '/api/analytics/events',
        JSON.stringify({ events, userId: this.userId })
      )
    } else {
      await this.sendToServer('events', { events, userId: this.userId })
    }
  }

  private async sendToServer(endpoint: string, data: any) {
    try {
      await fetch(`/api/analytics/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('[Analytics] Failed to send:', error)
      // Re-queue events on failure
      if (data.events) {
        this.eventQueue.push(...data.events)
      }
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  reset() {
    this.userId = null
    this.sessionId = this.generateSessionId()
    this.sessionStart = Date.now()
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush(true)
    this.isInitialized = false
  }
}

// Singleton instance
export const analytics = new AnalyticsManager()

// Convenience functions
export const trackEvent = (event: AnalyticsEvent | string, properties?: EventProperties) => {
  analytics.track(event, properties)
}

export const identifyUser = (userId: string, properties?: UserProperties) => {
  analytics.identify(userId, properties)
}

export const trackPage = (pageName: string, properties?: EventProperties) => {
  analytics.page(pageName, properties)
}
