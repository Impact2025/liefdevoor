/**
 * Analytics Hook
 * Convenient hook for tracking events in components
 */

'use client'

import { useCallback } from 'react'
import {
  trackEvent,
  trackSignup,
  trackLogin,
  trackPurchase,
  trackMatch,
  trackMessageSent,
  trackSwipe,
  trackProfileView,
  trackError,
} from '@/lib/gtag'

export function useAnalytics() {
  // Generic event tracking
  const track = useCallback((eventName: string, eventParams?: Record<string, any>) => {
    trackEvent(eventName, eventParams)
  }, [])

  // User authentication events
  const signup = useCallback((method: string) => {
    trackSignup(method)
  }, [])

  const login = useCallback((method: string) => {
    trackLogin(method)
  }, [])

  // Engagement events
  const match = useCallback(() => {
    trackMatch()
  }, [])

  const message = useCallback((messageType: 'text' | 'audio') => {
    trackMessageSent(messageType)
  }, [])

  const swipe = useCallback((action: 'like' | 'pass' | 'super_like') => {
    trackSwipe(action)
  }, [])

  const profileView = useCallback(() => {
    trackProfileView()
  }, [])

  // Ecommerce events
  const purchase = useCallback((transactionId: string, value: number, plan: string) => {
    trackPurchase(transactionId, value, plan)
  }, [])

  // Error tracking
  const error = useCallback((errorMessage: string, errorLevel: 'warning' | 'error' | 'fatal' = 'error') => {
    trackError(errorMessage, errorLevel)
  }, [])

  return {
    track,
    signup,
    login,
    match,
    message,
    swipe,
    profileView,
    purchase,
    error,
  }
}
