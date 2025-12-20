/**
 * RegisterForm Component
 *
 * User registration form with validation
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Button, Select, Checkbox, Alert } from '@/components/ui'
import { usePost } from '@/hooks'
import type { RegisterFormData } from '@/lib/types'
import { Gender } from '@prisma/client'

export interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: Gender.MALE,
    acceptedTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})

  const { post, isLoading, error: apiError } = usePost('/api/register', {
    onSuccess: () => {
      onSuccess?.()
      router.push('/login?registered=true')
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {}

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Naam is verplicht'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Naam moet minimaal 2 karakters zijn'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig email adres'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Wachtwoord moet minimaal 8 karakters zijn'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Wachtwoord moet een hoofdletter, kleine letter en cijfer bevatten'
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen'
    }

    // Birth date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'Geboortedatum is verplicht'
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18) {
        newErrors.birthDate = 'Je moet minimaal 18 jaar oud zijn'
      } else if (age > 100) {
        newErrors.birthDate = 'Ongeldige geboortedatum'
      }
    }

    // Terms validation
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'Je moet akkoord gaan met de voorwaarden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    await post({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      birthDate: formData.birthDate,
      gender: formData.gender,
    })
  }

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = field === 'acceptedTerms'
      ? (e.target as HTMLInputElement).checked
      : e.target.value

    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <Alert variant="error">
          {apiError.message}
        </Alert>
      )}

      <Input
        id="name"
        type="text"
        label="Naam"
        placeholder="Je volledige naam"
        value={formData.name}
        onChange={handleChange('name')}
        error={errors.name}
        fullWidth
        required
        disabled={isLoading}
        startIcon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          autoComplete="new-password"
          disabled={isLoading}
          helperText="Min. 8 karakters, met hoofdletter en cijfer"
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

        <Input
          id="confirmPassword"
          type="password"
          label="Bevestig wachtwoord"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          fullWidth
          required
          autoComplete="new-password"
          disabled={isLoading}
          startIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="birthDate"
          type="date"
          label="Geboortedatum"
          value={formData.birthDate}
          onChange={handleChange('birthDate')}
          error={errors.birthDate}
          fullWidth
          required
          disabled={isLoading}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
            .toISOString()
            .split('T')[0]}
        />

        <Select
          id="gender"
          label="Geslacht"
          value={formData.gender}
          onChange={handleChange('gender')}
          fullWidth
          required
          disabled={isLoading}
          options={[
            { value: Gender.MALE, label: 'Man' },
            { value: Gender.FEMALE, label: 'Vrouw' },
            { value: Gender.NON_BINARY, label: 'Non-binair' },
          ]}
        />
      </div>

      <Checkbox
        id="acceptedTerms"
        label={
          <span>
            Ik ga akkoord met de{' '}
            <a href="/terms" target="_blank" className="text-rose-600 hover:underline">
              algemene voorwaarden
            </a>{' '}
            en{' '}
            <a href="/privacy" target="_blank" className="text-rose-600 hover:underline">
              privacybeleid
            </a>
          </span>
        }
        checked={formData.acceptedTerms}
        onChange={handleChange('acceptedTerms')}
        error={errors.acceptedTerms}
        disabled={isLoading}
      />

      <Button type="submit" variant="primary" fullWidth isLoading={isLoading} size="lg">
        Account aanmaken
      </Button>

      <div className="text-center text-sm text-gray-600">
        Heb je al een account?{' '}
        <a href="/login" className="text-rose-600 hover:text-rose-500 font-medium">
          Log hier in
        </a>
      </div>
    </form>
  )
}
