/**
 * Cloudflare Turnstile Type Definitions
 *
 * Type safety voor Turnstile widget en API integratie
 */

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      execute: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
      isExpired: (widgetId: string) => boolean
    }
    onTurnstileLoad?: () => void
  }
}

/**
 * Turnstile widget render opties
 */
export interface TurnstileRenderOptions {
  sitekey: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  tabindex?: number
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
  'timeout-callback'?: () => void
  'before-interactive-callback'?: () => void
  'after-interactive-callback'?: () => void
  'unsupported-callback'?: () => void
  action?: string
  cData?: string
  appearance?: 'always' | 'execute' | 'interaction-only'
  retry?: 'auto' | 'never'
  'retry-interval'?: number
  'refresh-expired'?: 'auto' | 'manual' | 'never'
  language?: string
  'response-field'?: boolean
  'response-field-name'?: string
  execution?: 'render' | 'execute'
}

/**
 * Turnstile verification response van Cloudflare API
 */
export interface TurnstileServerVerificationResponse {
  success: boolean
  challenge_ts?: string // ISO timestamp van challenge
  hostname?: string // Hostname waar challenge werd opgelost
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

/**
 * Turnstile error codes
 */
export type TurnstileErrorCode =
  | 'missing-input-secret'
  | 'invalid-input-secret'
  | 'missing-input-response'
  | 'invalid-input-response'
  | 'bad-request'
  | 'timeout-or-duplicate'
  | 'internal-error'

export {}
