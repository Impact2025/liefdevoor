/**
 * LoginForm Component
 *
 * Form for user authentication with validation
 */

'use client'

import React, { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input, Button, Checkbox, Alert, Turnstile, useTurnstile } from '@/components/ui'
import type { LoginFormData } from '@/lib/types'

export interface LoginFormProps {
  callbackUrl?: string
  onSuccess?: () => void
}

export function LoginForm({ callbackUrl = '/discover', onSuccess }: LoginFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Turnstile state voor bot protection
  const { token: turnstileToken, setToken: setTurnstileToken, resetToken: resetTurnstileToken } = useTurnstile()

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {}

    if (!formData.email) {
      newErrors.email = 'Email is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig email adres'
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Wachtwoord moet minimaal 6 karakters zijn'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    // Check Turnstile token (alleen in production - development heeft auto-bypass)
    const isDevelopment = process.env.NODE_ENV === 'development'
    if (!isDevelopment && !turnstileToken) {
      setError('Voltooi de beveiligingscontrole')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        turnstileToken, // Turnstile verification token
        redirect: false,
      })

      if (result?.error) {
        setError('Ongeldige inloggegevens. Controleer je email en wachtwoord.')
        resetTurnstileToken() // Reset token zodat gebruiker opnieuw kan proberen
      } else if (result?.ok) {
        onSuccess?.()

        // Get fresh session to check profileComplete status and role
        const session = await getSession()

        // Admins skip onboarding and go directly to admin dashboard
        const isAdmin = session?.user?.role === 'ADMIN'
        const isAdminRoute = callbackUrl.startsWith('/admin')

        if (isAdmin) {
          // Admins always go to admin dashboard unless explicitly going to another admin route
          router.push(isAdminRoute ? callbackUrl : '/admin/dashboard')
        } else if (session?.user?.profileComplete) {
          router.push(callbackUrl)
        } else {
          router.push('/onboarding')
        }
        router.refresh()
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
      resetTurnstileToken() // Reset token zodat gebruiker opnieuw kan proberen
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Input
        id="email"
        type="email"
        label="Email adres"
        placeholder="jouw@email.nl"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        fullWidth
        required
        autoComplete="email"
        disabled={isLoading}
        startIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />

      <Input
        id="password"
        type="password"
        label="Wachtwoord"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        fullWidth
        required
        autoComplete="current-password"
        disabled={isLoading}
        startIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
      />

      <div className="flex items-center justify-between">
        <Checkbox
          id="rememberMe"
          label="Onthoud mij"
          checked={formData.rememberMe}
          onChange={handleChange('rememberMe')}
          disabled={isLoading}
        />

        <a
          href="/forgot-password"
          className="text-sm text-rose-600 hover:text-rose-500 transition-colors"
        >
          Wachtwoord vergeten?
        </a>
      </div>

      {/* Cloudflare Turnstile - Bot Protection */}
      <Turnstile
        onSuccess={setTurnstileToken}
        onError={() => setError('Beveiligingsverificatie mislukt. Herlaad de pagina.')}
        onExpire={resetTurnstileToken}
        action="login"
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        size="lg"
      >
        Inloggen
      </Button>

      {/* Social Login Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            Of log in met
          </span>
        </div>
      </div>

      {/* Google Login Button */}
      <Button
        type="button"
        variant="secondary"
        fullWidth
        size="lg"
        onClick={() => signIn('google', { callbackUrl })}
        disabled={isLoading}
        className="border-2 border-gray-200 hover:border-gray-300 bg-white"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Inloggen met Google
      </Button>
    </form>
  )
}
