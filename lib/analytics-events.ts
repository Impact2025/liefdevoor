/**
 * Analytics Events Integration
 * Automatically track events from API calls
 */

import { trackEvent, trackSignup, trackLogin, trackPurchase, trackMatch, trackSwipe, trackMessageSent } from '@/lib/gtag'

/**
 * Track registration completion
 */
export function trackRegistrationComplete(userId: string, email: string, method: string = 'email') {
  trackSignup(method)

  trackEvent('registration_complete', {
    user_id: userId,
    method,
  })
}

/**
 * Track login event
 */
export function trackLoginEvent(userId: string, method: string = 'email') {
  trackLogin(method)

  trackEvent('login_success', {
    user_id: userId,
    method,
  })
}

/**
 * Track profile completion
 */
export function trackProfileComplete(userId: string, completionPercentage: number) {
  trackEvent('profile_complete', {
    user_id: userId,
    completion_percentage: completionPercentage,
  })
}

/**
 * Track swipe action with enhanced data
 */
export function trackSwipeAction(
  userId: string,
  action: 'like' | 'pass' | 'super_like',
  targetUserId: string
) {
  trackSwipe(action)

  trackEvent('swipe_action', {
    user_id: userId,
    swipe_type: action,
    target_user_id: targetUserId,
  })
}

/**
 * Track match creation
 */
export function trackMatchCreation(userId: string, matchedUserId: string) {
  trackMatch()

  trackEvent('match_success', {
    user_id: userId,
    matched_user_id: matchedUserId,
  })
}

/**
 * Track message sent
 */
export function trackMessageSentEvent(
  userId: string,
  matchId: string,
  messageType: 'text' | 'audio'
) {
  trackMessageSent(messageType)

  trackEvent('message_sent', {
    user_id: userId,
    match_id: matchId,
    message_type: messageType,
  })
}

/**
 * Track subscription purchase with ecommerce data
 */
export function trackSubscriptionPurchase(
  userId: string,
  transactionId: string,
  plan: string,
  amount: number,
  paymentMethod: string
) {
  trackPurchase(transactionId, amount, plan)

  // Enhanced ecommerce tracking
  trackEvent('purchase', {
    transaction_id: transactionId,
    affiliation: 'Liefde Voor Iedereen',
    value: amount,
    currency: 'EUR',
    tax: 0,
    shipping: 0,
    payment_method: paymentMethod,
    items: [
      {
        item_id: plan,
        item_name: `${plan} Abonnement`,
        item_category: 'Subscription',
        item_variant: plan,
        price: amount,
        quantity: 1,
      },
    ],
  })
}

/**
 * Track subscription cancellation
 */
export function trackSubscriptionCancel(userId: string, plan: string, reason?: string) {
  trackEvent('subscription_cancel', {
    user_id: userId,
    plan,
    cancellation_reason: reason || 'not_specified',
  })
}

/**
 * Track credit purchase
 */
export function trackCreditPurchase(
  userId: string,
  transactionId: string,
  credits: number,
  amount: number
) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: amount,
    currency: 'EUR',
    items: [
      {
        item_id: 'credits',
        item_name: `${credits} Credits`,
        item_category: 'Credits',
        price: amount,
        quantity: credits,
      },
    ],
  })
}

/**
 * Track photo upload
 */
export function trackPhotoUpload(userId: string, photoCount: number) {
  trackEvent('photo_upload', {
    user_id: userId,
    photo_count: photoCount,
  })
}

/**
 * Track voice intro recording
 */
export function trackVoiceIntroRecording(userId: string, duration: number) {
  trackEvent('voice_intro_record', {
    user_id: userId,
    duration_seconds: duration,
  })
}

/**
 * Track user report
 */
export function trackUserReport(reporterId: string, reportedUserId: string, reason: string) {
  trackEvent('user_report', {
    reporter_id: reporterId,
    reported_user_id: reportedUserId,
    report_reason: reason,
  })
}

/**
 * Track user block
 */
export function trackUserBlock(blockerId: string, blockedUserId: string) {
  trackEvent('user_block', {
    blocker_id: blockerId,
    blocked_user_id: blockedUserId,
  })
}

/**
 * Track search/filter usage
 */
export function trackSearchFilter(
  userId: string,
  filters: {
    minAge?: number
    maxAge?: number
    maxDistance?: number
    gender?: string
  }
) {
  trackEvent('search_filter', {
    user_id: userId,
    ...filters,
  })
}

/**
 * Track app installation (PWA)
 */
export function trackAppInstall(userId?: string) {
  trackEvent('app_install', {
    user_id: userId || 'anonymous',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
  })
}

/**
 * Track onboarding completion
 */
export function trackOnboardingComplete(userId: string, step: number) {
  trackEvent('onboarding_complete', {
    user_id: userId,
    final_step: step,
  })
}

/**
 * Track share action
 */
export function trackShare(userId: string, method: string, content: string) {
  trackEvent('share', {
    user_id: userId,
    method, // 'facebook', 'whatsapp', 'link', etc.
    content_type: content,
  })
}
