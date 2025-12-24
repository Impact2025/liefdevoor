/**
 * New Ticket Page
 * Create a new support ticket
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const CATEGORIES = [
  { value: 'ACCOUNT', label: 'Account & Login', icon: '👤', description: 'Wachtwoord, profiel, account problemen' },
  { value: 'MATCHING', label: 'Matching & Algoritme', icon: '❤️', description: 'Matches, voorkeuren, algoritme vragen' },
  { value: 'MESSAGES', label: 'Berichten & Chat', icon: '💬', description: 'Chat problemen, notificaties, media' },
  { value: 'PAYMENTS', label: 'Betalingen & Abonnementen', icon: '💳', description: 'Facturen, betalingen, upgrades' },
  { value: 'VERIFICATION', label: 'Verificatie', icon: '✅', description: 'ID verificatie, video verificatie' },
  { value: 'SAFETY', label: 'Veiligheid & Privacy', icon: '🛡️', description: 'Rapportages, privacy, veiligheid' },
  { value: 'TECHNICAL', label: 'Technische Problemen', icon: '🔧', description: 'Bugs, crashes, laadproblemen' },
  { value: 'FEATURE', label: 'Feature Verzoek', icon: '💡', description: 'Nieuwe functies, suggesties' },
  { value: 'OTHER', label: 'Overig', icon: '📝', description: 'Andere vragen' }
]

function NewTicketForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams?.get('conversationId')

  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.subject.trim()) {
      newErrors.subject = 'Onderwerp is verplicht'
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Onderwerp moet minimaal 5 karakters zijn'
    }

    if (!formData.category) {
      newErrors.category = 'Selecteer een categorie'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschrijving is verplicht'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Beschrijving moet minimaal 10 karakters zijn'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/helpdesk/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          chatbotConversationId: conversationId || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.error })
        } else {
          alert(data.error || 'Er ging iets mis')
        }
        return
      }

      // Redirect to ticket detail page
      router.push(`/support/tickets/${data.data.ticket.id}`)
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Er ging iets mis bij het aanmaken van het ticket. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/support/tickets"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar Mijn Tickets
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nieuw Support Ticket</h1>
          <p className="text-lg text-gray-600">
            Beschrijf je probleem zo gedetailleerd mogelijk, dan kunnen we je beter helpen.
          </p>
        </div>

        {/* Escalation Notice */}
        {conversationId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Geëscaleerd vanuit chatbot</h3>
                <p className="text-sm text-blue-700">
                  Je chatbot conversatie wordt toegevoegd aan de ticket beschrijving.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          {/* Subject */}
          <div className="mb-6">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
              Onderwerp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Bijvoorbeeld: Kan niet inloggen op mijn account"
              className={`w-full px-4 py-2 border ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Categorie <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.value })}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    formData.category === category.value
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">{category.label}</h3>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </div>
                    {formData.category === category.value && (
                      <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              Beschrijving <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschrijf je probleem zo gedetailleerd mogelijk. Bijvoorbeeld:&#10;- Wat probeerde je te doen?&#10;- Wat ging er mis?&#10;- Welke foutmelding kreeg je?&#10;- Wanneer deed het probleem zich voor?"
              className={`w-full px-4 py-3 border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Hoe meer details je geeft, hoe sneller we je kunnen helpen.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Wat gebeurt er nu?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Je ticket wordt binnen enkele minuten opgepakt</li>
                  <li>• Ons support team reageert meestal binnen 24 uur</li>
                  <li>• Je ontvangt een email bij elke update</li>
                  <li>• Je kan altijd reageren via de ticket pagina</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Ticket aanmaken...' : 'Maak Ticket Aan'}
            </Button>
            <Link
              href="/support/tickets"
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
            >
              Annuleren
            </Link>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Probeer eerst onze FAQ of chatbot voor snelle antwoorden
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/support/faq" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
              Bekijk FAQ
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/support" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
              Terug naar Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <NewTicketForm />
    </Suspense>
  )
}
