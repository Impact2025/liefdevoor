/**
 * Cloudflare Turnstile Component - Wereldklasse Implementatie
 *
 * Privacy-friendly CAPTCHA widget die formulieren beschermt tegen bots.
 * Ondersteunt zowel invisible als managed challenges.
 *
 * @example
 * ```tsx
 * const { token, setToken, resetToken, isReady } = useTurnstile()
 *
 * <Turnstile
 *   onSuccess={setToken}
 *   onError={() => setError('Verificatie mislukt')}
 * />
 *
 * // Wacht op token voor submit
 * if (!isReady) return
 * ```
 */

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Shield, CheckCircle2 } from 'lucide-react'
import type { TurnstileRenderOptions } from '@/lib/types/turnstile'

export interface TurnstileProps {
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  action?: string
  className?: string
}

/**
 * Cloudflare Turnstile widget component
 *
 * Gebruikt 'managed' mode voor maximale betrouwbaarheid.
 * Widget verschijnt alleen wanneer nodig (bij verdachte activiteit).
 */
export function Turnstile({
  onSuccess,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  action,
  className = '',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const mountedRef = useRef(true)
  const renderAttemptRef = useRef(0)

  // Use refs voor callbacks om closure issues te voorkomen
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const onExpireRef = useRef(onExpire)

  const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
    onExpireRef.current = onExpire
  }, [onSuccess, onError, onExpire])

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Auto-bypass in development mode
  useEffect(() => {
    if (isDevelopment) {
      // Simulate async token generation
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          onSuccessRef.current('dev-bypass-token')
          setStatus('verified')
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isDevelopment])

  // Render widget functie
  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return
    if (widgetIdRef.current) return // Already rendered

    renderAttemptRef.current++
    console.log(`[Turnstile] Rendering widget (attempt ${renderAttemptRef.current})`)

    try {
      // Clear container first
      containerRef.current.innerHTML = ''

      const options: TurnstileRenderOptions = {
        sitekey: siteKey,
        theme,
        size,
        action,
        // Gebruik 'interaction-only' voor betere UX - widget alleen bij verdachte activiteit
        // Token wordt automatisch gegenereerd op achtergrond
        appearance: 'interaction-only',
        retry: 'auto',
        'retry-interval': 5000,
        'refresh-expired': 'auto',
        language: 'nl',
        callback: (token: string) => {
          console.log('[Turnstile] Token ontvangen:', token.substring(0, 20) + '...')
          if (mountedRef.current) {
            setStatus('verified')
            setErrorMessage(null)
            onSuccessRef.current(token)
          }
        },
        'error-callback': () => {
          console.error('[Turnstile] Error callback triggered')
          if (mountedRef.current) {
            setStatus('error')
            setErrorMessage('Verificatie mislukt. Herlaad de pagina.')
            onErrorRef.current?.()
          }
        },
        'expired-callback': () => {
          console.warn('[Turnstile] Token expired')
          if (mountedRef.current) {
            setStatus('ready')
            onExpireRef.current?.()
          }
        },
        'timeout-callback': () => {
          console.error('[Turnstile] Timeout')
          if (mountedRef.current) {
            setStatus('error')
            setErrorMessage('Verificatie timeout. Controleer je verbinding.')
            onErrorRef.current?.()
          }
        },
        'after-interactive-callback': () => {
          console.log('[Turnstile] Interactive challenge started')
        },
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, options)

      if (mountedRef.current) {
        setStatus('ready')
      }
      console.log('[Turnstile] Widget rendered met ID:', widgetIdRef.current)
    } catch (err) {
      console.error('[Turnstile] Render error:', err)
      if (mountedRef.current) {
        setStatus('error')
        setErrorMessage('Kon verificatie niet laden')
      }
    }
  }, [siteKey, theme, size, action])

  // Initialize Turnstile
  useEffect(() => {
    if (isDevelopment) return

    if (!siteKey) {
      console.error('[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY niet geconfigureerd')
      setStatus('error')
      setErrorMessage('Turnstile niet geconfigureerd')
      return
    }

    // Load script met onload callback
    const scriptId = 'cf-turnstile-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    // Global callback voor wanneer script laadt
    window.onTurnstileLoad = () => {
      console.log('[Turnstile] Script geladen via callback')
      renderWidget()
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      script.async = true
      document.head.appendChild(script)

      script.onerror = () => {
        console.error('[Turnstile] Script load failed')
        if (mountedRef.current) {
          setStatus('error')
          setErrorMessage('Kon beveiligingsscript niet laden')
        }
      }
    } else if (window.turnstile) {
      // Script already loaded
      renderWidget()
    }

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    }
  }, [isDevelopment, siteKey, renderWidget])

  // Development bypass UI
  if (isDevelopment) {
    return (
      <div className={`flex items-center justify-center gap-2 py-2 text-xs text-blue-600 ${className}`}>
        <Shield className="w-3.5 h-3.5" />
        <span>Dev mode - Turnstile bypass</span>
      </div>
    )
  }

  // Niet geconfigureerd
  if (!siteKey) {
    return null
  }

  return (
    <div className={className}>
      {/* Turnstile widget container */}
      <div
        ref={containerRef}
        className="flex justify-center min-h-[65px]"
      />

      {/* Status indicator */}
      {status === 'verified' && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Geverifieerd</span>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && errorMessage && (
        <div className="text-center text-xs text-red-600 mt-2">
          {errorMessage}
        </div>
      )}

      {/* Privacy notice - altijd tonen voor transparantie */}
      {status !== 'error' && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2">
          <Shield className="w-3 h-3" />
          <span>Beschermd door Cloudflare Turnstile</span>
        </div>
      )}
    </div>
  )
}

/**
 * Hook om Turnstile token state te beheren met auto-wait functionaliteit
 *
 * @example
 * ```tsx
 * const { token, setToken, resetToken, isReady, waitForToken } = useTurnstile()
 *
 * <Turnstile onSuccess={setToken} />
 *
 * // Bij submit: wacht automatisch op token (max 10 sec)
 * const handleSubmit = async () => {
 *   const verifiedToken = await waitForToken()
 *   if (!verifiedToken) {
 *     setError('Verificatie timeout')
 *     return
 *   }
 *   // Proceed with submit...
 * }
 * ```
 */
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const resolversRef = useRef<Array<(token: string | null) => void>>([])

  // Update ref when token changes and resolve any waiting promises
  useEffect(() => {
    tokenRef.current = token
    if (token && resolversRef.current.length > 0) {
      resolversRef.current.forEach(resolve => resolve(token))
      resolversRef.current = []
    }
  }, [token])

  const resetToken = useCallback(() => {
    setToken(null)
    tokenRef.current = null
  }, [])

  /**
   * Wacht op token met timeout
   * @param timeoutMs - Maximum wachttijd in ms (default: 10000)
   * @returns Promise met token of null bij timeout
   */
  const waitForToken = useCallback((timeoutMs: number = 10000): Promise<string | null> => {
    // Development bypass
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve('dev-bypass-token')
    }

    // Token al beschikbaar
    if (tokenRef.current) {
      return Promise.resolve(tokenRef.current)
    }

    // Wacht op token met timeout
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        // Remove this resolver from the list
        resolversRef.current = resolversRef.current.filter(r => r !== resolve)
        resolve(null) // Timeout
      }, timeoutMs)

      const wrappedResolve = (token: string | null) => {
        clearTimeout(timeoutId)
        resolve(token)
      }

      resolversRef.current.push(wrappedResolve)
    })
  }, [])

  return {
    token,
    setToken,
    resetToken,
    hasToken: !!token,
    isReady: !!token,
    waitForToken,
  }
}
