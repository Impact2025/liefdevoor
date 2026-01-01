'use client'

/**
 * GuardianSetup - Component voor het instellen van een begeleider
 *
 * Features:
 * - Eenvoudige uitleg: "Wil je dat iemand je helpt?"
 * - Email invoer voor begeleider
 * - Bevestigings-email flow
 * - Opt-out knop
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Mail,
  Check,
  X,
  Loader2,
  AlertCircle,
  Volume2,
  Shield,
  Bell,
  Trash2,
} from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { GuidanceButton } from '@/components/ui/GuidanceButton'

interface Guardian {
  email: string | null
  name: string | null
  enabled: boolean
  confirmed: boolean
  lastNotified: string | null
}

interface GuardianSetupProps {
  onUpdate?: () => void
}

export function GuardianSetup({ onUpdate }: GuardianSetupProps) {
  const { speakForced, isLVBMode } = useAccessibility()
  const [guardian, setGuardian] = useState<Guardian | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [guardianEmail, setGuardianEmail] = useState('')
  const [guardianName, setGuardianName] = useState('')

  // Fetch guardian status
  useEffect(() => {
    const fetchGuardian = async () => {
      try {
        const response = await fetch('/api/user/guardian')
        if (response.ok) {
          const data = await response.json()
          setGuardian(data.guardian)
        }
      } catch (err) {
        console.error('Error fetching guardian:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuardian()
  }, [])

  const handleAddGuardian = async () => {
    if (!guardianEmail || !guardianName) {
      setError('Vul alle velden in')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const response = await fetch('/api/user/guardian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardianEmail, guardianName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Er ging iets mis')
      }

      setGuardian(data.guardian)
      setShowForm(false)
      setGuardianEmail('')
      setGuardianName('')
      onUpdate?.()

      if (isLVBMode) {
        speakForced(`Er is een email gestuurd naar ${guardianEmail}. Je begeleider moet deze bevestigen.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveGuardian = async () => {
    setIsRemoving(true)
    setError(null)

    try {
      const response = await fetch('/api/user/guardian', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Er ging iets mis')
      }

      setGuardian(null)
      onUpdate?.()

      if (isLVBMode) {
        speakForced('Je begeleider is verwijderd.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setIsRemoving(false)
    }
  }

  const handlePlayExplanation = () => {
    speakForced(
      'Hier kun je een begeleider toevoegen. Dit is iemand die je helpt, zoals een ouder of begeleider. ' +
      'Je begeleider krijgt elke week een email met hoe het met je gaat op de app. ' +
      'Ze kunnen je berichten NIET lezen. Ze zien alleen hoeveel matches je hebt en of er problemen zijn.'
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-xl text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Begeleider
              </h3>
              <p className="text-slate-600">
                Wil je dat iemand je helpt?
              </p>
            </div>
          </div>

          {isLVBMode && (
            <button
              onClick={handlePlayExplanation}
              className="p-3 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
              aria-label="Luister uitleg"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guardian exists */}
        {guardian?.enabled ? (
          <div className="space-y-4">
            {/* Guardian info */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                  <Check className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-emerald-800">
                    {guardian.name}
                  </p>
                  <p className="text-emerald-700">{guardian.email}</p>

                  {/* Status */}
                  <div className="mt-2 flex items-center gap-2">
                    {guardian.confirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-200 text-emerald-800 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Bevestigd
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-medium">
                        <Mail className="w-4 h-4" />
                        Wacht op bevestiging
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* What guardian sees */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Wat ziet je begeleider?
              </h4>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Hoeveel matches je hebt
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Of er problemen zijn
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500" />
                  Je berichten (die blijven privé!)
                </li>
              </ul>
            </div>

            {/* Remove button */}
            <button
              onClick={handleRemoveGuardian}
              disabled={isRemoving}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              Begeleider verwijderen
            </button>
          </div>
        ) : showForm ? (
          /* Add guardian form */
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-slate-900 mb-2">
                Naam van je begeleider
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Bijv. Mama, Papa, Jan"
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-slate-900 mb-2">
                Email van je begeleider
              </label>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="email@voorbeeld.nl"
                className="w-full px-4 py-3 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <GuidanceButton
                label="Voeg toe"
                icon={<Check className="w-6 h-6" />}
                audioText="Klik hier om je begeleider toe te voegen. Ze krijgen een email om dit te bevestigen."
                onClick={handleAddGuardian}
                variant="success"
                size="large"
                loading={isSaving}
              />
              <GuidanceButton
                label="Annuleren"
                icon={<X className="w-6 h-6" />}
                onClick={() => setShowForm(false)}
                variant="secondary"
                size="large"
                showAudioButton={false}
              />
            </div>
          </div>
        ) : (
          /* No guardian - show add button */
          <div className="text-center py-4">
            <div className="mb-4">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-lg text-slate-600">
                Je hebt nog geen begeleider ingesteld
              </p>
            </div>

            <GuidanceButton
              label="Begeleider toevoegen"
              icon={<Users className="w-6 h-6" />}
              audioText="Klik hier om een begeleider toe te voegen. Dit is iemand die je helpt en op je let."
              onClick={() => setShowForm(true)}
              variant="primary"
              size="large"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default GuardianSetup
