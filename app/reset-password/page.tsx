'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Geen geldige reset link. Vraag een nieuwe aan.')
    }
  }, [token])

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Wachtwoord moet minimaal 8 tekens zijn'
    if (!/[a-z]/.test(pwd)) return 'Wachtwoord moet een kleine letter bevatten'
    if (!/[A-Z]/.test(pwd)) return 'Wachtwoord moet een hoofdletter bevatten'
    if (!/[0-9]/.test(pwd)) return 'Wachtwoord moet een cijfer bevatten'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Er is iets misgegaan')
        return
      }

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-primary">Wachtwoord gewijzigd!</h1>
          <p className="text-gray-600 mb-6">
            Je wachtwoord is succesvol gewijzigd. Je wordt automatisch doorgestuurd naar de inlogpagina.
          </p>
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Nu inloggen
          </Link>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-primary">Ongeldige link</h1>
          <p className="text-gray-600 mb-6">
            Deze reset link is ongeldig of verlopen. Vraag een nieuwe link aan.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-primary text-white py-3 px-6 rounded-full font-bold hover:bg-rose-hover transition-colors"
          >
            Nieuwe link aanvragen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">Nieuw wachtwoord</h1>
        <p className="text-gray-600 text-center mb-6">
          Kies een nieuw wachtwoord voor je account.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Nieuw wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1 ml-1">
            Minimaal 8 tekens, met hoofdletter, kleine letter en cijfer
          </p>
        </div>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Bevestig wachtwoord"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-rose-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Opslaan...' : 'Wachtwoord opslaan'}
        </button>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-primary hover:underline"
          >
            Terug naar inloggen
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
