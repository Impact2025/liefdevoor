'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function NewsletterSignup() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  // Check for newsletter status from URL params
  useEffect(() => {
    const newsletterStatus = searchParams.get('newsletter')
    const message = searchParams.get('message')

    if (newsletterStatus === 'verified') {
      setStatus({
        type: 'success',
        message: 'Je inschrijving is bevestigd! Je ontvangt vanaf nu onze nieuwsbrief.',
      })
    } else if (newsletterStatus === 'already-verified') {
      setStatus({
        type: 'info',
        message: 'Je bent al ingeschreven voor onze nieuwsbrief.',
      })
    } else if (newsletterStatus === 'unsubscribed') {
      setStatus({
        type: 'info',
        message: 'Je bent succesvol uitgeschreven van onze nieuwsbrief.',
      })
    } else if (newsletterStatus === 'already-unsubscribed') {
      setStatus({
        type: 'info',
        message: 'Je was al uitgeschreven van onze nieuwsbrief.',
      })
    } else if (newsletterStatus === 'error') {
      setStatus({
        type: 'error',
        message: decodeURIComponent(message || 'Er is iets misgegaan. Probeer het later opnieuw.'),
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setStatus({
        type: 'error',
        message: 'Voer een geldig e-mailadres in.',
      })
      return
    }

    setLoading(true)
    setStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          source: 'BLOG_PAGE',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.message || 'Check je inbox voor de verificatie-email!',
        })
        setEmail('')
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Er is iets misgegaan. Probeer het later opnieuw.',
        })
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setStatus({
        type: 'error',
        message: 'Kon geen verbinding maken met de server. Probeer het later opnieuw.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-12 bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-8 text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Blijf op de hoogte
      </h3>
      <p className="text-gray-600 mb-6">
        Ontvang wekelijks dating tips en relatie advies in je inbox.
      </p>

      {/* Status Messages */}
      {status.type && (
        <div
          className={`max-w-md mx-auto mb-4 p-4 rounded-lg flex items-start gap-3 ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : status.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {status.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {status.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          {status.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <p className="text-sm flex-1 text-left">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="jouw@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-rose-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Bezig...
              </>
            ) : (
              'Inschrijven'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Door je in te schrijven ga je akkoord met onze{' '}
          <Link href="/privacy" className="underline hover:text-primary">
            privacyverklaring
          </Link>
          . Je kunt je op elk moment uitschrijven.
        </p>
      </form>
    </div>
  )
}
