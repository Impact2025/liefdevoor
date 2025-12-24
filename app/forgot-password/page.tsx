'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Turnstile } from '@/components/ui'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Check Turnstile token (alleen als geconfigureerd)
    const shouldEnforce = process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (shouldEnforce && !turnstileToken) {
      setError('Voltooi de beveiligingscontrole')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Er is iets misgegaan')
        setTurnstileToken(null) // Reset token zodat gebruiker opnieuw kan proberen
        return
      }

      setSubmitted(true)
    } catch {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
      setTurnstileToken(null) // Reset token zodat gebruiker opnieuw kan proberen
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-primary">Email verzonden</h1>
          <p className="text-gray-600 mb-6">
            Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met instructies om je wachtwoord te resetten.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Controleer ook je spam folder als je geen email ontvangt.
          </p>
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Terug naar inloggen
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">Wachtwoord vergeten</h1>
        <p className="text-gray-600 text-center mb-6">
          Vul je emailadres in en we sturen je een link om je wachtwoord te resetten.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />

        {/* Cloudflare Turnstile - Bot Protection */}
        <div className="mb-4">
          <Turnstile
            onSuccess={setTurnstileToken}
            onError={() => setError('Beveiligingsverificatie mislukt. Probeer opnieuw.')}
            onExpire={() => setTurnstileToken(null)}
            theme="auto"
            appearance="interaction-only"
            action="forgot-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-rose-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Verzenden...' : 'Reset link versturen'}
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
