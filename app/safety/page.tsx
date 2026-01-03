/**
 * Safety Center - Wereldklasse Safety Resources
 *
 * Comprehensive safety tips, guides, and resources for users
 */

'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Lock, Eye, Heart, Phone, MessageCircle, Ban, Flag, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MatchUser {
  id: string
  name: string
  profileImage: string | null
}

export default function SafetyCenterPage() {
  const router = useRouter()
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [matches, setMatches] = useState<MatchUser[]>([])
  const [selectedUser, setSelectedUser] = useState<MatchUser | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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

  useEffect(() => {
    if (showReportModal || showBlockModal) {
      loadMatches()
    }
  }, [showReportModal, showBlockModal])

  const loadMatches = async () => {
    setIsLoadingMatches(true)
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        const users: MatchUser[] = data.matches.map((match: any) => ({
          id: match.otherUser.id,
          name: match.otherUser.name,
          profileImage: match.otherUser.profileImage,
        }))
        setMatches(users)
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setIsLoadingMatches(false)
    }
  }

  const handleReport = async () => {
    if (!selectedUser || !reportReason) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/safety/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: selectedUser.id,
          reason: reportReason,
          description: reportDescription,
        }),
      })

      if (response.ok) {
        setSuccessMessage('Rapportage ontvangen. We nemen dit serieus en zullen het onderzoeken.')
        setTimeout(() => {
          setShowReportModal(false)
          setSelectedUser(null)
          setReportReason('')
          setReportDescription('')
          setSuccessMessage('')
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
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/safety/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: selectedUser.id }),
      })

      if (response.ok) {
        setSuccessMessage('Gebruiker geblokkeerd. Je zult elkaar niet meer zien.')
        setTimeout(() => {
          setShowBlockModal(false)
          setSelectedUser(null)
          setSuccessMessage('')
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

  const filteredMatches = matches.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Veiligheidscentrum</h1>
          </div>
          <p className="text-rose-100 text-lg">
            Jouw veiligheid is onze hoogste prioriteit. Lees onze tips en richtlijnen.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ActionCard
              icon={<Flag />}
              title="Rapporteer een gebruiker"
              description="Meld ongepast gedrag"
              color="orange"
              onClick={() => setShowReportModal(true)}
            />
            <ActionCard
              icon={<Ban />}
              title="Blokkeer een gebruiker"
              description="Stop contact permanent"
              color="red"
              onClick={() => setShowBlockModal(true)}
            />
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {successMessage ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Flag className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bedankt voor je rapportage</h3>
                  <p className="text-gray-600">{successMessage}</p>
                </div>
              ) : !selectedUser ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Rapporteer een gebruiker</h2>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Zoek een match..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  {/* Matches List */}
                  {isLoadingMatches ? (
                    <div className="text-center py-8 text-gray-500">Laden...</div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {matches.length === 0 ? 'Je hebt nog geen matches' : 'Geen matches gevonden'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredMatches.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left border-2 border-gray-100 hover:border-gray-200"
                        >
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Rapporteer {selectedUser.name}</h2>
                    <button
                      onClick={() => {
                        setSelectedUser(null)
                        setReportReason('')
                        setReportDescription('')
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          Waarom rapporteer je {selectedUser.name}?
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Valse rapportages kunnen leiden tot schorsing van je account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reden *</label>
                      <div className="space-y-2">
                        {REPORT_REASONS.map((reason) => (
                          <label
                            key={reason.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              reportReason === reason.value
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value={reason.value}
                              checked={reportReason === reason.value}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="w-4 h-4 text-rose-600"
                            />
                            <span className="text-sm font-medium text-gray-900">{reason.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra details (optioneel)
                      </label>
                      <textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Beschrijf wat er gebeurd is..."
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedUser(null)
                          setReportReason('')
                          setReportDescription('')
                        }}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
                      >
                        Terug
                      </button>
                      <button
                        onClick={handleReport}
                        disabled={!reportReason || isSubmitting}
                        className="flex-1 px-4 py-3 text-white bg-rose-600 rounded-lg hover:bg-rose-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Versturen...' : 'Rapporteer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Block Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {successMessage ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <Ban className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Gebruiker geblokkeerd</h3>
                  <p className="text-gray-600">{successMessage}</p>
                </div>
              ) : !selectedUser ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Blokkeer een gebruiker</h2>
                    <button
                      onClick={() => setShowBlockModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Zoek een match..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  {/* Matches List */}
                  {isLoadingMatches ? (
                    <div className="text-center py-8 text-gray-500">Laden...</div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {matches.length === 0 ? 'Je hebt nog geen matches' : 'Geen matches gevonden'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredMatches.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left border-2 border-gray-100 hover:border-gray-200"
                        >
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Blokkeer {selectedUser.name}</h2>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-900">
                      Weet je zeker dat je <strong>{selectedUser.name}</strong> wilt blokkeren?
                    </p>
                    <ul className="text-xs text-red-700 mt-2 space-y-1 list-disc list-inside">
                      <li>Je zult elkaar niet meer zien in discover</li>
                      <li>Eventuele matches worden verwijderd</li>
                      <li>Je kunt dit later ongedaan maken in je instellingen</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedUser(null)}
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
            </div>
          </div>
        )}

        {/* Safety Tips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Veiligheidstips</h2>
          <div className="space-y-4">
            <SafetyTip
              icon={<Eye />}
              title="Bescherm je privacy"
              tips={[
                'Deel nooit je volledige naam, adres of werkplek',
                'Gebruik geen herkenbare achtergronden in foto\'s',
                'Wees voorzichtig met het delen van persoonlijke details',
              ]}
            />
            <SafetyTip
              icon={<MessageCircle />}
              title="Online gesprekken"
              tips={[
                'Chat eerst uitgebreid voordat je afspreekt',
                'Vertrouw je gevoel - als iets niet klopt, stop het contact',
                'Stuur nooit geld of financiële informatie',
              ]}
            />
            <SafetyTip
              icon={<Heart />}
              title="Eerste afspraak"
              tips={[
                'Spreek af op een openbare plek',
                'Vertel een vriend(in) waar je bent',
                'Regel je eigen vervoer',
                'Blijf nuchter en alert',
              ]}
            />
            <SafetyTip
              icon={<Lock />}
              title="Account beveiliging"
              tips={[
                'Gebruik een sterk, uniek wachtwoord',
                'Schakel verificatie in voor extra veiligheid',
                'Log uit op gedeelde apparaten',
              ]}
            />
          </div>
        </div>

        {/* Red Flags */}
        <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Rode Vlaggen - Pas Op!</h2>
          </div>
          <ul className="space-y-2 text-red-800">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Vraagt om geld, cadeaubonnen of financiële hulp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Wil snel van het platform af naar WhatsApp/Telegram</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Profiel foto's lijken professioneel of stockfoto's</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Inconsistente verhalen of ontwijkende antwoorden</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Pusht voor ontmoeting op afgelegen locatie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Agressief, controlerend of respectloos gedrag</span>
            </li>
          </ul>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Noodcontacten</h2>
          </div>
          <div className="space-y-3">
            <EmergencyContact
              name="Politie (spoed)"
              number="112"
              description="Bij directe dreiging of gevaar"
            />
            <EmergencyContact
              name="Politie (niet-spoed)"
              number="0900-8844"
              description="Voor aangifte of advies"
            />
            <EmergencyContact
              name="Slachtofferhulp"
              number="0900-0101"
              description="Emotionele ondersteuning"
            />
            <EmergencyContact
              name="Korrelatie"
              number="088-0220000"
              description="Bij seksueel geweld"
            />
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gedragsregels</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">
              Onze community waardeert respect, eerlijkheid en vriendelijkheid. Gedrag dat niet wordt getolereerd:
            </p>
            <ul className="text-gray-700 space-y-2 mt-3">
              <li>Intimidatie, bedreigingen of lastigvallen</li>
              <li>Haatzaaien of discriminatie</li>
              <li>Seksueel ongepast gedrag</li>
              <li>Spam, scams of oplichting</li>
              <li>Neppe profielen of identiteitsdiefstal</li>
              <li>Minderjarigen op het platform</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Overtredingen worden serieus genomen</strong> en kunnen leiden tot schorsing of permanente verwijdering van het platform.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
          >
            Terug
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ icon, title, description, color, onClick }: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'orange' | 'red'
  onClick?: () => void
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200',
    red: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200',
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-xl border-2 hover:shadow-md transition-all ${colorClasses[color]}`}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="text-left">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  )
}

function SafetyTip({ icon, title, tips }: {
  icon: React.ReactNode
  title: string
  tips: string[]
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 flex-shrink-0 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <ul className="space-y-1">
          {tips.map((tip, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-rose-500 font-bold mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function EmergencyContact({ name, number, description }: {
  name: string
  number: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
      <div>
        <h3 className="font-bold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <a
        href={`tel:${number}`}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
      >
        {number}
      </a>
    </div>
  )
}
