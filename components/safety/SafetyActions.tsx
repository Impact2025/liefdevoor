/**
 * SafetyActions - Report & Block Components
 *
 * Wereldklasse safety features for user protection
 */

'use client'

import { useState } from 'react'
import { AlertTriangle, Ban, Flag, X } from 'lucide-react'
import { Modal } from '@/components/ui'

interface SafetyActionsProps {
  userId: string
  userName: string
  onReport?: () => void
  onBlock?: () => void
}

const REPORT_REASONS = [
  { value: 'inappropriate_photos', label: 'Ongepaste foto\'s' },
  { value: 'harassment', label: 'Intimidatie of lastigvallen' },
  { value: 'fake_profile', label: 'Nep profiel' },
  { value: 'spam', label: 'Spam of scam' },
  { value: 'underage', label: 'Minderjarig' },
  { value: 'hate_speech', label: 'Haatzaaien' },
  { value: 'violence', label: 'Geweld of gevaar' },
  { value: 'other', label: 'Anders' },
]

export function SafetyActions({ userId, userName, onReport, onBlock }: SafetyActionsProps) {
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReport = async () => {
    if (!selectedReason) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/safety/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: userId,
          reason: selectedReason,
          description,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          setShowReportModal(false)
          setSuccess(false)
          setSelectedReason('')
          setDescription('')
          onReport?.()
        }, 2000)
      } else {
        const data = await response.json()
        alert(data.error || 'Er ging iets mis')
      }
    } catch (error) {
      alert('Er ging iets mis bij het rapporteren')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBlock = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/safety/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: userId }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          setShowBlockModal(false)
          setSuccess(false)
          onBlock?.()
        }, 1500)
      } else {
        const data = await response.json()
        alert(data.error || 'Er ging iets mis')
      }
    } catch (error) {
      alert('Er ging iets mis bij het blokkeren')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <Flag size={16} />
          Rapporteer
        </button>

        <button
          onClick={() => setShowBlockModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Ban size={16} />
          Blokkeer
        </button>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => !isSubmitting && setShowReportModal(false)}
        title="Rapporteer Gebruiker"
        size="md"
      >
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Flag className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Bedankt voor je rapportage
            </h3>
            <p className="text-gray-600">
              We nemen dit serieus en zullen het onderzoeken.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Waarom rapporteer je {userName}?
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Valse rapportages kunnen leiden tot schorsing van je account.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reden *
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedReason === reason.value
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-rose-600"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {reason.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra details (optioneel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschrijf wat er gebeurd is..."
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                Annuleer
              </button>
              <button
                onClick={handleReport}
                disabled={!selectedReason || isSubmitting}
                className="flex-1 px-4 py-3 text-white bg-rose-600 rounded-lg hover:bg-rose-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Versturen...' : 'Rapporteer'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Block Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => !isSubmitting && setShowBlockModal(false)}
        title="Blokkeer Gebruiker"
        size="sm"
      >
        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Ban className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Gebruiker geblokkeerd
            </h3>
            <p className="text-gray-600">
              Je zult elkaar niet meer zien.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                Weet je zeker dat je <strong>{userName}</strong> wilt blokkeren?
              </p>
              <ul className="text-xs text-red-700 mt-2 space-y-1 list-disc list-inside">
                <li>Je zult elkaar niet meer zien in discover</li>
                <li>Eventuele matches worden verwijderd</li>
                <li>Je kunt dit later ongedaan maken</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                Annuleer
              </button>
              <button
                onClick={handleBlock}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Blokkeren...' : 'Blokkeer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
