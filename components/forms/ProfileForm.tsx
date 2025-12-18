/**
 * ProfileForm Component
 *
 * Form for updating user profile information
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Input, Textarea, Select, Button, Alert } from '@/components/ui'
import { usePut } from '@/hooks'
import type { ProfileUpdateData, UserProfile } from '@/lib/types'
import { Gender } from '@prisma/client'

export interface ProfileFormProps {
  initialData?: UserProfile
  onSuccess?: (updatedProfile: UserProfile) => void
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: initialData?.name || '',
    bio: initialData?.bio || '',
    birthDate: initialData?.birthDate || '',
    gender: initialData?.gender || undefined,
    city: initialData?.city || '',
    postcode: initialData?.postcode || '',
    interests: initialData?.preferences?.interests?.join(', ') || '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileUpdateData, string>>>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { put, isLoading, error: apiError } = usePut('/api/profile', {
    onSuccess: (data: any) => {
      setSuccessMessage('Profiel succesvol bijgewerkt!')
      onSuccess?.(data.profile)
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        bio: initialData.bio || '',
        birthDate: initialData.birthDate || '',
        gender: initialData.gender || undefined,
        city: initialData.city || '',
        postcode: initialData.postcode || '',
        interests: initialData.preferences?.interests?.join(', ') || '',
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileUpdateData, string>> = {}

    if (formData.name && formData.name.length < 2) {
      newErrors.name = 'Naam moet minimaal 2 karakters zijn'
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio mag maximaal 500 karakters zijn'
    }

    if (formData.postcode && !/^\d{4}\s?[A-Z]{2}$/i.test(formData.postcode)) {
      newErrors.postcode = 'Ongeldige postcode (gebruik format: 1234AB)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)

    if (!validateForm()) return

    // Convert interests string to array
    const interests = formData.interests
      ? formData.interests.split(',').map((i) => i.trim()).filter(Boolean)
      : []

    await put({
      ...formData,
      preferences: {
        interests,
      },
    })
  }

  const handleChange = (field: keyof ProfileUpdateData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

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
        disabled={isLoading}
      />

      <Textarea
        id="bio"
        label="Bio"
        placeholder="Vertel iets over jezelf..."
        value={formData.bio}
        onChange={handleChange('bio')}
        error={errors.bio}
        fullWidth
        rows={4}
        maxLength={500}
        showCharCount
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="birthDate"
          type="date"
          label="Geboortedatum"
          value={formData.birthDate}
          onChange={handleChange('birthDate')}
          error={errors.birthDate}
          fullWidth
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
          disabled={isLoading}
          options={[
            { value: Gender.MALE, label: 'Man' },
            { value: Gender.FEMALE, label: 'Vrouw' },
            { value: Gender.NON_BINARY, label: 'Non-binair' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="city"
          type="text"
          label="Woonplaats"
          placeholder="Amsterdam"
          value={formData.city}
          onChange={handleChange('city')}
          error={errors.city}
          fullWidth
          disabled={isLoading}
        />

        <Input
          id="postcode"
          type="text"
          label="Postcode"
          placeholder="1234AB"
          value={formData.postcode}
          onChange={handleChange('postcode')}
          error={errors.postcode}
          fullWidth
          disabled={isLoading}
          helperText="Voor betere matches in je buurt"
        />
      </div>

      <Input
        id="interests"
        type="text"
        label="Interesses"
        placeholder="Sporten, muziek, reizen, koken..."
        value={formData.interests}
        onChange={handleChange('interests')}
        fullWidth
        disabled={isLoading}
        helperText="Scheid interesses met komma's"
      />

      <div className="flex gap-4">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Opslaan
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={() => {
            if (initialData) {
              setFormData({
                name: initialData.name || '',
                bio: initialData.bio || '',
                birthDate: initialData.birthDate || '',
                gender: initialData.gender || undefined,
                city: initialData.city || '',
                postcode: initialData.postcode || '',
                interests: initialData.preferences?.interests?.join(', ') || '',
              })
            }
          }}
        >
          Annuleren
        </Button>
      </div>
    </form>
  )
}
