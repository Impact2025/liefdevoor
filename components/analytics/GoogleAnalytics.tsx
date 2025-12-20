/**
 * Google Analytics Component
 * AVG-compliant: Only loads when user has given analytics consent
 */

'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { hasConsentFor, getCookieConsent } from '@/lib/cookie-consent'

const GA_MEASUREMENT_ID = 'G-7DS7HL7B96'

export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Check initial consent
    const checkConsent = () => {
      const consent = hasConsentFor('analytics')
      setHasConsent(consent)

      if (consent) {
        console.log('[Google Analytics] Consent granted - initializing')
      } else {
        console.log('[Google Analytics] No consent - not loading')
      }
    }

    checkConsent()

    // Listen for consent changes
    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent
      const { analytics } = customEvent.detail

      setHasConsent(analytics)

      if (analytics) {
        console.log('[Google Analytics] Consent granted - initializing')
        // Reload page to load GA scripts (or initialize dynamically)
        window.location.reload()
      } else {
        console.log('[Google Analytics] Consent revoked')
        // Disable GA tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('consent', 'update', {
            analytics_storage: 'denied',
          })
        }
      }
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange)

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange)
    }
  }, [])

  // Only render GA scripts if user has given consent
  if (!hasConsent) {
    return null
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Set consent mode (AVG compliant)
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'denied'
            });

            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
            });

            console.log('[Google Analytics] Initialized with consent');
          `,
        }}
      />
    </>
  )
}

/**
 * Helper function to track custom events to Google Analytics
 * Only tracks if consent is given
 */
export function trackGAEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!hasConsentFor('analytics')) {
    console.log('[Google Analytics] Event blocked - no consent:', eventName)
    return
  }

  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, eventParams)
    console.log('[Google Analytics] Event tracked:', eventName, eventParams)
  }
}

/**
 * Helper function to track page views
 */
export function trackGAPageView(url: string) {
  if (!hasConsentFor('analytics')) {
    return
  }

  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}
