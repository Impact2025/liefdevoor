'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Lock,
  Briefcase,
  FileText,
  Shield
} from 'lucide-react'

const organizationTypes = [
  { value: 'THERAPIST', label: 'Therapeut / Psycholoog', description: 'GZ-psycholoog, relatietherapeut, etc.' },
  { value: 'COACH', label: 'Coach / Begeleider', description: 'Lifecoach, relatiecoach, etc.' },
  { value: 'CARE_INSTITUTION', label: 'Zorginstelling', description: 'GGZ, verslavingszorg, etc.' },
  { value: 'EDUCATION', label: 'Onderwijs', description: 'School, universiteit, etc.' },
  { value: 'HEALTHCARE', label: 'Gezondheidszorg', description: 'Huisarts, verpleegkundige, etc.' },
  { value: 'OTHER', label: 'Anders', description: 'Overige professionals' },
]

export default function ProfessionalRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Step 1: Personal
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Professional
    organizationName: '',
    organizationType: '',
    kvkNumber: '',
    jobTitle: '',
    // Step 3: Verification
    acceptTerms: false,
    acceptPrivacy: false,
    newsletter: true,
  })

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password) {
      setError('Vul alle verplichte velden in')
      return false
    }
    if (form.password !== form.confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return false
    }
    if (form.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters zijn')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Ongeldig e-mailadres')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!form.organizationName || !form.organizationType) {
      setError('Vul alle verplichte velden in')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!form.acceptTerms || !form.acceptPrivacy) {
      setError('Je moet akkoord gaan met de voorwaarden')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = async () => {
    setError('')
    if (!validateStep3()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/professionals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          organizationName: form.organizationName,
          organizationType: form.organizationType,
          kvkNumber: form.kvkNumber || null,
          newsletter: form.newsletter,
        }),
      })

      if (response.ok) {
        router.push('/professionals/welkom')
      } else {
        const data = await response.json()
        setError(data.error || 'Er ging iets mis bij de registratie')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Er ging iets mis bij de registratie')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/professionals" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Terug naar overzicht
          </Link>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-4">
            <Building2 className="w-4 h-4" />
            Professional Registratie
          </div>
          <h1 className="text-3xl font-bold text-white">
            Maak je account aan
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/20 text-white/60'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    step > s ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Persoonlijke Gegevens
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volledige naam *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Jan de Vries"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jan@praktijk.nl"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimaal 8 karakters"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bevestig wachtwoord *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Herhaal je wachtwoord"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Professionele Gegevens
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisatie / Praktijk naam *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.organizationName}
                    onChange={(e) => setForm(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="Praktijk de Vries"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type organisatie *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {organizationTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setForm(prev => ({ ...prev, organizationType: type.value }))}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        form.organizationType === type.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KVK-nummer (optioneel)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.kvkNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, kvkNumber: e.target.value }))}
                    placeholder="12345678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Met KVK-nummer krijg je sneller toegang tot premium content
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Verification & Terms */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bevestigen
              </h2>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Naam:</span>
                  <span className="font-medium">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-mail:</span>
                  <span className="font-medium">{form.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organisatie:</span>
                  <span className="font-medium">{form.organizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {organizationTypes.find(t => t.value === form.organizationType)?.label}
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(e) => setForm(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    Ik ga akkoord met de{' '}
                    <Link href="/voorwaarden" className="text-indigo-600 hover:underline">
                      algemene voorwaarden
                    </Link>
                    {' '}*
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.acceptPrivacy}
                    onChange={(e) => setForm(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    Ik ga akkoord met het{' '}
                    <Link href="/privacy" className="text-indigo-600 hover:underline">
                      privacybeleid
                    </Link>
                    {' '}*
                  </span>
                </label>

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.newsletter}
                    onChange={(e) => setForm(prev => ({ ...prev, newsletter: e.target.checked }))}
                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    Ik wil de professionele nieuwsbrief ontvangen met updates en nieuwe content
                  </span>
                </label>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-3 bg-indigo-50 rounded-lg p-4">
                <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-700">
                  <strong>Verificatie:</strong> Na registratie kun je een BIG-nummer of andere
                  professionele registratie toevoegen voor uitgebreide toegang.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={() => { setStep(step - 1); setError(''); }}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Terug
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700"
              >
                Volgende
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Aanmelden...
                  </>
                ) : (
                  <>
                    Account Aanmaken
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Al een account?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Log hier in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
