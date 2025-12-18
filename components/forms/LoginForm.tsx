/**
 * LoginForm Component
 *
 * Form for user authentication with validation
 */

'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input, Button, Checkbox, Alert } from '@/components/ui'
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

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Ongeldige inloggegevens. Controleer je email en wachtwoord.')
      } else if (result?.ok) {
        onSuccess?.()
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
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
          className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
        >
          Wachtwoord vergeten?
        </a>
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
        Inloggen
      </Button>

      <div className="text-center text-sm text-gray-600">
        Nog geen account?{' '}
        <a href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
          Registreer hier
        </a>
      </div>
    </form>
  )
}
