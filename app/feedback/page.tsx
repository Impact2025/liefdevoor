'use client'

/**
 * Migration Feedback Survey
 *
 * World-class user research for migrated users
 */

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Send, CheckCircle, Heart, MessageSquare, Sparkles } from 'lucide-react'

interface SurveyData {
  satisfaction: number
  easeOfUse: number
  designRating: number
  missingFeatures: string[]
  otherMissing: string
  bestFeature: string
  improvements: string
  wouldRecommend: number
  additionalComments: string
}

const missingFeatureOptions = [
  { id: 'chat_history', label: 'Oude chatgeschiedenis' },
  { id: 'contacts', label: 'Mijn contacten/favorieten' },
  { id: 'photos', label: 'Meer foto opties' },
  { id: 'search_filters', label: 'Betere zoekfilters' },
  { id: 'profile_views', label: 'Wie heeft mijn profiel bekeken' },
  { id: 'notifications', label: 'Push notificaties' },
  { id: 'mobile_app', label: 'Mobile app' },
  { id: 'video_chat', label: 'Video chat' },
]

export default function FeedbackPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<SurveyData>({
    satisfaction: 0,
    easeOfUse: 0,
    designRating: 0,
    missingFeatures: [],
    otherMissing: '',
    bestFeature: '',
    improvements: '',
    wouldRecommend: 0,
    additionalComments: ''
  })

  const updateData = (field: keyof SurveyData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const toggleMissingFeature = (id: string) => {
    setData(prev => ({
      ...prev,
      missingFeatures: prev.missingFeatures.includes(id)
        ? prev.missingFeatures.filter(f => f !== id)
        : [...prev.missingFeatures, id]
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Er ging iets mis')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
    label
  }: {
    value: number
    onChange: (v: number) => void
    label: string
  }) => (
    <div className="mb-6">
      <label className="block text-slate-700 font-medium mb-3">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-2 rounded-lg transition-all ${
              star <= value
                ? 'text-amber-400 scale-110'
                : 'text-slate-300 hover:text-amber-300'
            }`}
          >
            <Star className="w-8 h-8 fill-current" />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1 px-2">
        <span>Slecht</span>
        <span>Uitstekend</span>
      </div>
    </div>
  )

  const NPSRating = ({
    value,
    onChange
  }: {
    value: number
    onChange: (v: number) => void
  }) => (
    <div className="mb-6">
      <label className="block text-slate-700 font-medium mb-3">
        Hoe waarschijnlijk is het dat je Liefde Voor Iedereen aanbeveelt aan vrienden?
      </label>
      <div className="flex gap-1 justify-center flex-wrap">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
              score === value
                ? score <= 6
                  ? 'bg-red-500 text-white'
                  : score <= 8
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
        <span>Zeer onwaarschijnlijk</span>
        <span>Zeer waarschijnlijk</span>
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">
            Bedankt voor je feedback!
          </h1>
          <p className="text-slate-600 mb-6">
            Jouw mening helpt ons om Liefde Voor Iedereen nog beter te maken.
            We waarderen het enorm dat je de tijd hebt genomen.
          </p>
          <div className="bg-rose-50 rounded-xl p-4 mb-6">
            <p className="text-rose-700 text-sm">
              Als dank krijg je <strong>5 extra SuperBerichten</strong> cadeau!
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors"
          >
            <Heart className="w-5 h-5" />
            Ga naar matches
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Image
            src="/images/LiefdevoorIedereen_logo.png"
            alt="Liefde Voor Iedereen"
            width={180}
            height={50}
            className="h-10 w-auto mx-auto"
          />
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">Stap {step} van 3</span>
          <span className="text-sm text-slate-500">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  Welkom bij ons onderzoek!
                </h1>
                <p className="text-slate-600">
                  Help ons Liefde Voor Iedereen verbeteren met jouw feedback.
                  Dit duurt ongeveer 2 minuten.
                </p>
              </div>

              <StarRating
                value={data.satisfaction}
                onChange={(v) => updateData('satisfaction', v)}
                label="Hoe tevreden ben je overall met Liefde Voor Iedereen?"
              />

              <StarRating
                value={data.easeOfUse}
                onChange={(v) => updateData('easeOfUse', v)}
                label="Hoe makkelijk was het om je account te activeren?"
              />

              <StarRating
                value={data.designRating}
                onChange={(v) => updateData('designRating', v)}
                label="Wat vind je van het design van de nieuwe site?"
              />

              <button
                onClick={() => setStep(2)}
                disabled={!data.satisfaction || !data.easeOfUse || !data.designRating}
                className="w-full mt-4 py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Volgende
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Jouw ervaring
                </h2>
                <p className="text-slate-600">
                  Vertel ons wat je mist of wat beter kan
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-medium mb-3">
                  Wat mis je van OogvoorLiefde? (meerdere mogelijk)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {missingFeatureOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleMissingFeature(option.id)}
                      className={`p-3 rounded-lg text-left text-sm transition-all border-2 ${
                        data.missingFeatures.includes(option.id)
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-medium mb-2">
                  Mis je nog iets anders?
                </label>
                <input
                  type="text"
                  value={data.otherMissing}
                  onChange={(e) => updateData('otherMissing', e.target.value)}
                  placeholder="Typ hier..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-medium mb-2">
                  Wat vind je het beste aan de nieuwe site?
                </label>
                <input
                  type="text"
                  value={data.bestFeature}
                  onChange={(e) => updateData('bestFeature', e.target.value)}
                  placeholder="Bijv. het design, de snelheid, de matches..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Terug
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors"
                >
                  Volgende
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Laatste vragen
                </h2>
                <p className="text-slate-600">
                  Nog even en je bent klaar!
                </p>
              </div>

              <NPSRating
                value={data.wouldRecommend}
                onChange={(v) => updateData('wouldRecommend', v)}
              />

              <div className="mb-6">
                <label className="block text-slate-700 font-medium mb-2">
                  Wat kunnen we verbeteren?
                </label>
                <textarea
                  value={data.improvements}
                  onChange={(e) => updateData('improvements', e.target.value)}
                  placeholder="Jouw suggesties zijn welkom..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-medium mb-2">
                  Nog iets anders dat je kwijt wilt?
                </label>
                <textarea
                  value={data.additionalComments}
                  onChange={(e) => updateData('additionalComments', e.target.value)}
                  placeholder="Optioneel..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Terug
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || data.wouldRecommend === 0}
                  className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Verstuur feedback
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Trust indicators */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Je feedback is anoniem en wordt alleen gebruikt om onze service te verbeteren.</p>
        </div>
      </div>
    </div>
  )
}
