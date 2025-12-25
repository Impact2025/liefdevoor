/**
 * Cloudflare Turnstile Component
 *
 * Privacy-friendly CAPTCHA widget die formulieren beschermt tegen bots.
 * Rendert invisible/managed challenge die alleen verschijnt wanneer nodig.
 *
 * @example
 * ```tsx
 * <Turnstile
 *   onSuccess={(token) => setTurnstileToken(token)}
 *   onError={() => setError('Verificatie mislukt')}
 * />
 * ```
 */

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { AlertCircle, RefreshCw, Shield } from 'lucide-react'

export interface TurnstileProps {
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  action?: string
  className?: string
  appearance?: 'always' | 'execute' | 'interaction-only'
}

/**
 * Cloudflare Turnstile widget component
 */
export function Turnstile({
  onSuccess,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  action,
  className = '',
  appearance = 'interaction-only', // Invisible totdat nodig
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Auto-bypass in development mode
  useEffect(() => {
    if (isDevelopment) {
      // Remove any existing Turnstile scripts to prevent CSP errors
      const existingScript = document.getElementById('turnstile-script')
      if (existingScript) {
        existingScript.remove()
      }

      onSuccess('dev-bypass-token')
      setIsLoading(false)
    }
  }, [isDevelopment, onSuccess])

  // Reset widget
  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      setError(null)
    }
  }, [])

  // Initialize Turnstile widget
  useEffect(() => {
    // Skip Turnstile initialization in development mode
    if (isDevelopment) {
      return
    }

    if (!siteKey) {
      console.error('[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY niet geconfigureerd')
      setError('Turnstile niet geconfigureerd')
      setIsLoading(false)
      return
    }

    // Load Turnstile script
    const scriptId = 'turnstile-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const handleScriptLoad = () => {
      setIsLoaded(true)
      setIsLoading(false)

      if (!containerRef.current || !window.turnstile) return

      // Render widget
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          action,
          appearance,
          callback: (token: string) => {
            setError(null)
            console.log('[Turnstile] Token ontvangen')
            onSuccess(token)
          },
          'error-callback': () => {
            setError('Verificatie mislukt. Probeer opnieuw.')
            console.error('[Turnstile] Error callback triggered')
            onError?.()
          },
          'expired-callback': () => {
            setError('Verificatie verlopen. Vernieuw de pagina.')
            console.warn('[Turnstile] Token expired')
            onExpire?.()
          },
          'timeout-callback': () => {
            setError('Verificatie timeout. Controleer je internetverbinding.')
            console.error('[Turnstile] Timeout')
            onError?.()
          },
          'unsupported-callback': () => {
            setError('Je browser wordt niet ondersteund.')
            console.error('[Turnstile] Browser unsupported')
            onError?.()
          },
        })
        console.log('[Turnstile] Widget rendered met ID:', widgetIdRef.current)
      } catch (err) {
        console.error('[Turnstile] Render error:', err)
        setError('Kon verificatie niet laden')
        setIsLoading(false)
      }
    }

    // Check if script is already loaded
    if ((window as any).turnstile) {
      handleScriptLoad()
    } else {
      script.addEventListener('load', handleScriptLoad)
      script.addEventListener('error', () => {
        setError('Kon verificatie script niet laden')
        setIsLoading(false)
        console.error('[Turnstile] Script load failed')
      })
    }

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
          console.log('[Turnstile] Widget removed')
        } catch (err) {
          console.warn('[Turnstile] Cleanup error:', err)
        }
      }
    }
  }, [isDevelopment, siteKey, theme, size, action, appearance, onSuccess, onError, onExpire])

  // Skip Turnstile in development to avoid CSP/SW issues
  if (isDevelopment) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span>Development mode - Turnstile bypassed ✓</span>
        </div>
      </div>
    )
  }

  // Render niets als niet geconfigureerd (production fallback)
  if (!siteKey) {
    return null
  }

  return (
    <div className={className}>
      {/* Turnstile widget container */}
      <div ref={containerRef} className="flex justify-center" />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Beveiliging laden...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
              <button
                type="button"
                onClick={reset}
                className="mt-2 text-xs font-medium text-red-700 hover:text-red-900 underline"
              >
                Opnieuw proberen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      {isLoaded && !error && (
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3 h-3" />
          <span>Beschermd door Cloudflare Turnstile</span>
        </div>
      )}
    </div>
  )
}

/**
 * Hook om Turnstile token state te beheren
 *
 * @example
 * ```tsx
 * const { token, setToken, resetToken } = useTurnstile()
 *
 * <Turnstile onSuccess={setToken} />
 * ```
 */
export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null)

  const resetToken = useCallback(() => {
    setToken(null)
  }, [])

  return {
    token,
    setToken,
    resetToken,
    hasToken: !!token,
  }
}
