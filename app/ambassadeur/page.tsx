'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface AmbassadorData {
  id: string
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE'
  freeUntil: string | null
  invitedAt: string
  activatedAt: string | null
  messages: Message[]
}

interface Message {
  id: string
  message: string
  isStaffReply: boolean
  createdAt: string
  author: { id: string; name: string | null; role: string; profileImage: string | null }
}

export default function AmbassadeurPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AmbassadorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/ambassadeur')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchData()
    }
  }, [sessionStatus])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ambassadeur')
      if (res.status === 404) { setNotFound(true); return }
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async () => {
    setAccepting(true)
    try {
      const res = await fetch('/api/ambassadeur', { method: 'PATCH' })
      const json = await res.json()
      if (json.success) {
        setAccepted(true)
        setData(prev => prev ? { ...prev, status: 'ACTIVE' } : prev)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAccepting(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    setSendingMessage(true)
    try {
      const res = await fetch('/api/ambassadeur/bericht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })
      const json = await res.json()
      if (json.success) {
        setData(prev => prev ? { ...prev, messages: [...prev.messages, json.data] } : prev)
        setNewMessage('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSendingMessage(false)
    }
  }

  const formatDate = (d: string | null) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-rose-600 text-lg">Laden...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">💛</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Hoi!</h1>
          <p className="text-gray-600 leading-relaxed">
            Je bent nog geen ambassadeur van Liefde Voor Iedereen.
          </p>
          <p className="text-gray-600 mt-2 leading-relaxed">
            Heb je een uitnodiging ontvangen maar zie je deze pagina?
            Stuur een berichtje naar{' '}
            <a href="mailto:hoi@liefdevooriedereen.nl" className="text-rose-600 hover:underline">
              hoi@liefdevooriedereen.nl
            </a>
          </p>
          <button onClick={() => router.push('/')} className="mt-6 bg-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-rose-700 transition">
            Terug naar de site
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const freeUntilDate = data.freeUntil ? new Date(data.freeUntil) : null
  const daysLeft = freeUntilDate
    ? Math.max(0, Math.ceil((freeUntilDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <div className="text-5xl mb-3">🌟</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.status === 'INVITED' ? 'Je bent uitgenodigd!' : 'Jij bent ambassadeur!'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Liefde Voor Iedereen</p>
        </div>

        {/* Uitnodiging accepteren */}
        {data.status === 'INVITED' && !accepted && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>Hoi {(session?.user as any)?.name?.split(' ')[0] || ''}!</p>
              <p>
                Wij vragen jou om <strong>ambassadeur</strong> te worden van Liefde Voor Iedereen.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="font-medium text-gray-800">Dit doe je als ambassadeur:</p>
                <p>💬 Je vertelt vrienden over de site.</p>
                <p>📝 Je schrijft op wat je goed vindt. En wat beter kan.</p>
                <p>💡 Je geeft ideeën voor de site.</p>
                <p className="text-sm text-gray-500 italic">Je mag zelf kiezen hoeveel je doet. Er is geen druk.</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                <p className="font-medium text-gray-800">Dit krijg jij:</p>
                <p>🎁 <strong>Een jaar gratis lidmaatschap</strong></p>
                <p>🌟 Als eerste nieuwe dingen uitproberen</p>
                <p>💛 We luisteren echt naar jou</p>
              </div>
            </div>

            <button
              onClick={acceptInvitation}
              disabled={accepting}
              className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-rose-700 transition disabled:opacity-50"
            >
              {accepting ? 'Bezig...' : 'Ja, ik word ambassadeur! 🎉'}
            </button>
          </div>
        )}

        {/* Succesbericht na acceptatie */}
        {(data.status === 'ACTIVE' || accepted) && (
          <>
            {accepted && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-green-700 font-medium">🎉 Welkom als ambassadeur! We zijn blij dat je meedoet.</p>
              </div>
            )}

            {/* Beloningen kaart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Jouw beloningen</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-medium text-gray-800">Gratis lidmaatschap</p>
                    {freeUntilDate && (
                      <p className="text-sm text-gray-500">
                        Geldig tot {formatDate(data.freeUntil)} · nog {daysLeft} dagen
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <p className="font-medium text-gray-800">Eerste tester</p>
                    <p className="text-sm text-gray-500">Jij ziet nieuwe functies als eerste</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wat kan ik doen? */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Wat kun jij doen?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">💬</span>
                  <div>
                    <p className="font-medium text-gray-800">Vertel het door</p>
                    <p className="text-sm text-gray-500">Vertel vrienden en familie over Liefde Voor Iedereen.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">📝</span>
                  <div>
                    <p className="font-medium text-gray-800">Geef feedback</p>
                    <p className="text-sm text-gray-500">Stuur ons berichten hieronder. Wat vind je goed? Wat kan beter?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">💡</span>
                  <div>
                    <p className="font-medium text-gray-800">Deel ideeën</p>
                    <p className="text-sm text-gray-500">Heb je een idee voor de site? Vertel het ons!</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Berichten — altijd zichtbaar als ACTIVE */}
        {(data.status === 'ACTIVE' || accepted) && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Berichten met Vincent</h2>

            <div className="space-y-3 min-h-16 max-h-96 overflow-y-auto mb-4">
              {data.messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  Nog geen berichten. Stuur gerust een berichtje!
                </p>
              ) : (
                data.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isStaffReply ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${msg.isStaffReply ? 'bg-gray-100 text-gray-900' : 'bg-rose-600 text-white'}`}>
                      {msg.isStaffReply && (
                        <p className="text-xs font-medium text-gray-500 mb-1">Vincent</p>
                      )}
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.isStaffReply ? 'text-gray-400' : 'text-rose-200'}`}>
                        {new Date(msg.createdAt).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Schrijf een bericht..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <button
                onClick={sendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
              >
                {sendingMessage ? '...' : 'Stuur'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Vragen? Mail naar{' '}
          <a href="mailto:hoi@liefdevooriedereen.nl" className="hover:underline">hoi@liefdevooriedereen.nl</a>
        </p>

      </div>
    </div>
  )
}
