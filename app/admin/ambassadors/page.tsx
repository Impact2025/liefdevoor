'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Ambassador {
  id: string
  status: 'INVITED' | 'ACTIVE' | 'INACTIVE'
  invitedAt: string
  activatedAt: string | null
  freeUntil: string | null
  adminNotes: string | null
  ticketId: string | null
  user: {
    id: string
    name: string | null
    email: string
    profileImage: string | null
    city: string | null
    createdAt: string
    subscriptionTier: string
  }
}

interface Stats {
  invited: number
  active: number
  inactive: number
  total: number
}

interface Metrics {
  conversionRate: number
  avgDaysToAccept: number | null
  thisMonth: { invited: number; accepted: number }
  alerts: { expiringIn30Days: number; expiredAndStillActive: number }
}

interface Message {
  id: string
  message: string
  isStaffReply: boolean
  createdAt: string
  author: { id: string; name: string | null; role: string; profileImage: string | null }
}

export default function AdminAmbassadorsPage() {
  const router = useRouter()
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [stats, setStats] = useState<Stats>({ invited: 0, active: 0, inactive: 0, total: 0 })
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Uitnodig modal
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSearchResults, setInviteSearchResults] = useState<any[]>([])
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')

  // Detail modal
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador & { messages: Message[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [editNotes, setEditNotes] = useState('')

  const fetchAmbassadors = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/ambassadors?${params}`)
      if (res.status === 403) { setForbidden(true); return }
      const data = await res.json()
      if (data.success) {
        setAmbassadors(data.data)
        setStats(data.stats)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, search])

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ambassadors/metrics')
      if (!res.ok) return
      const data = await res.json()
      if (data.success) setMetrics(data.data)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetchAmbassadors()
    fetchMetrics()
  }, [fetchAmbassadors, fetchMetrics])

  const searchUsersForInvite = async (q: string) => {
    if (!q.trim()) { setInviteSearchResults([]); return }
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}&limit=8`)
      const data = await res.json()
      setInviteSearchResults(data.users || data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const inviteUser = async (userId: string) => {
    setInviteLoading(true)
    try {
      const res = await fetch('/api/admin/ambassadors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sendInviteEmail: true }),
      })
      const data = await res.json()
      if (data.success) {
        setInviteMessage('✅ Uitnodiging verstuurd!')
        setInviteSearchResults([])
        setInviteEmail('')
        fetchAmbassadors()
        fetchMetrics()
        setTimeout(() => { setShowInviteModal(false); setInviteMessage('') }, 2000)
      } else {
        setInviteMessage(`❌ ${data.error}`)
      }
    } catch (e) {
      setInviteMessage('❌ Er ging iets mis')
    } finally {
      setInviteLoading(false)
    }
  }

  const openDetail = async (amb: Ambassador) => {
    setDetailLoading(true)
    setSelectedAmbassador({ ...amb, messages: [] })
    setEditNotes(amb.adminNotes || '')
    try {
      const res = await fetch(`/api/admin/ambassadors/${amb.id}`)
      const data = await res.json()
      if (data.success) {
        setSelectedAmbassador(data.data)
        setEditNotes(data.data.adminNotes || '')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDetailLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedAmbassador) return
    setSendingMessage(true)
    try {
      const res = await fetch(`/api/admin/ambassadors/${selectedAmbassador.id}/bericht`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedAmbassador(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.data],
        } : prev)
        setNewMessage('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSendingMessage(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/ambassadors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        fetchAmbassadors()
        fetchMetrics()
        if (selectedAmbassador?.id === id) {
          setSelectedAmbassador(prev => prev ? {
            ...prev,
            status: status as any,
            user: { ...prev.user, subscriptionTier: data.data.user?.subscriptionTier ?? prev.user.subscriptionTier },
          } : prev)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deactivateAmbassador = async (id: string) => {
    if (!confirm('Ambassadeur deactiveren? Het gratis lidmaatschap wordt ingetrokken.')) return
    try {
      await fetch(`/api/admin/ambassadors/${id}`, { method: 'DELETE' })
      fetchAmbassadors()
      fetchMetrics()
      if (selectedAmbassador?.id === id) setSelectedAmbassador(null)
    } catch (e) {
      console.error(e)
    }
  }

  const saveNotes = async () => {
    if (!selectedAmbassador) return
    try {
      await fetch(`/api/admin/ambassadors/${selectedAmbassador.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: editNotes }),
      })
      setSelectedAmbassador(prev => prev ? { ...prev, adminNotes: editNotes } : prev)
      setAmbassadors(prev => prev.map(a => a.id === selectedAmbassador.id ? { ...a, adminNotes: editNotes } : a))
    } catch (e) {
      console.error(e)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      INVITED: { bg: 'bg-yellow-100 text-yellow-800', label: 'Uitgenodigd' },
      ACTIVE: { bg: 'bg-green-100 text-green-800', label: 'Actief' },
      INACTIVE: { bg: 'bg-gray-100 text-gray-600', label: 'Inactief' },
    }
    const s = map[status] || map.INACTIVE
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>{s.label}</span>
  }

  const tierBadge = (tier: string) => {
    if (tier === 'GOLD') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Gold</span>
    if (tier === 'PREMIUM') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Premium</span>
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Free</span>
  }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Geen toegang</h1>
          <p className="text-gray-500 text-sm">Je hebt de <strong>Manage Ambassadors</strong> permissie nodig.</p>
          <button onClick={() => router.push('/admin')} className="mt-6 text-rose-600 hover:underline text-sm">
            Terug naar dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🌟 Ambassadeurs</h1>
            <p className="text-gray-500 text-sm mt-1">Beheer en communiceer met ambassadeurs</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition"
          >
            + Uitnodigen
          </button>
        </div>

        {/* Alerts */}
        {metrics && (metrics.alerts.expiredAndStillActive > 0 || metrics.alerts.expiringIn30Days > 0) && (
          <div className="mb-4 space-y-2">
            {metrics.alerts.expiredAndStillActive > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span><strong>{metrics.alerts.expiredAndStillActive}</strong> ambassadeur(s) met verlopen gratis lidmaatschap — run <code className="bg-red-100 px-1 rounded">npx tsx scripts/check-ambassador-expiry.ts</code></span>
              </div>
            )}
            {metrics.alerts.expiringIn30Days > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                <span>⏰</span>
                <span><strong>{metrics.alerts.expiringIn30Days}</strong> ambassadeur(s) waarvan het gratis lidmaatschap binnen 30 dagen verloopt</span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Totaal', value: stats.total, color: 'text-gray-900' },
            { label: 'Uitgenodigd', value: stats.invited, color: 'text-yellow-600' },
            { label: 'Actief', value: stats.active, color: 'text-green-600' },
            { label: 'Inactief', value: stats.inactive, color: 'text-gray-400' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-rose-600">{metrics.conversionRate}%</div>
              <div className="text-sm text-gray-500 mt-1">Conversieratio (uitgenodigd → actief)</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.avgDaysToAccept !== null ? `${metrics.avgDaysToAccept}d` : '-'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Gem. dagen tot acceptatie</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-purple-600">{metrics.thisMonth.accepted}</div>
              <div className="text-sm text-gray-500 mt-1">
                Geaccepteerd deze maand ({metrics.thisMonth.invited} uitgenodigd)
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Zoek op naam of e-mail..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
            className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={() => setSearch(searchInput)} className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
            Zoeken
          </button>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Alle statussen</option>
            <option value="INVITED">Uitgenodigd</option>
            <option value="ACTIVE">Actief</option>
            <option value="INACTIVE">Inactief</option>
          </select>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('') }} className="text-sm text-gray-400 hover:text-gray-600">
              Wis filters
            </button>
          )}
        </div>

        {/* Ambassadeurs tabel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400">Laden...</div>
          ) : ambassadors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <p className="text-gray-500">Nog geen ambassadeurs gevonden.</p>
              <button onClick={() => setShowInviteModal(true)} className="mt-4 text-rose-600 hover:underline text-sm">
                Nodig iemand uit
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Gebruiker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Uitgenodigd</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Gratis t/m</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Notities</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ambassadors.map(amb => (
                  <tr key={amb.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm overflow-hidden flex-shrink-0">
                          {amb.user.profileImage
                            ? <img src={amb.user.profileImage} alt="" className="w-full h-full object-cover" />
                            : (amb.user.name?.[0] || '?')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{amb.user.name || 'Naamloos'}</div>
                          <div className="text-xs text-gray-400">{amb.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(amb.status)}</td>
                    <td className="px-4 py-3">{tierBadge(amb.user.subscriptionTier)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(amb.invitedAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {amb.freeUntil
                        ? <span className={new Date(amb.freeUntil) < new Date() ? 'text-red-500' : ''}>{formatDate(amb.freeUntil)}</span>
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{amb.adminNotes || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetail(amb)}
                        className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                      >
                        Openen →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Uitnodig Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Ambassadeur uitnodigen</h2>
              <p className="text-sm text-gray-500 mt-1">Zoek een bestaande gebruiker om uit te nodigen</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoek gebruiker</label>
                <input
                  type="text"
                  placeholder="Naam of e-mailadres..."
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); searchUsersForInvite(e.target.value) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                {inviteSearchResults.length > 0 && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
                    {inviteSearchResults.map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => inviteUser(u.id)}
                        disabled={inviteLoading}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 text-sm border-b border-gray-100 last:border-0 flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold flex-shrink-0">
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-medium">{u.name || 'Naamloos'}</div>
                          <div className="text-gray-400 text-xs">{u.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {inviteMessage && (
                <p className="text-sm text-center py-2">{inviteMessage}</p>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => { setShowInviteModal(false); setInviteEmail(''); setInviteSearchResults([]); setInviteMessage('') }} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAmbassador && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold overflow-hidden">
                  {selectedAmbassador.user.profileImage
                    ? <img src={selectedAmbassador.user.profileImage} alt="" className="w-full h-full object-cover" />
                    : (selectedAmbassador.user.name?.[0] || '?')}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{selectedAmbassador.user.name || 'Naamloos'}</div>
                  <div className="text-xs text-gray-400">{selectedAmbassador.user.email}</div>
                </div>
                <div className="ml-2 flex gap-1">
                  {statusBadge(selectedAmbassador.status)}
                  {tierBadge(selectedAmbassador.user.subscriptionTier)}
                </div>
              </div>
              <button onClick={() => setSelectedAmbassador(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Uitgenodigd</div>
                  <div className="text-gray-700">{formatDate(selectedAmbassador.invitedAt)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">Gratis t/m</div>
                  <div className={selectedAmbassador.freeUntil && new Date(selectedAmbassador.freeUntil) < new Date() ? 'text-red-500 font-medium' : 'text-gray-700'}>
                    {formatDate(selectedAmbassador.freeUntil)}
                    {selectedAmbassador.freeUntil && new Date(selectedAmbassador.freeUntil) < new Date() && ' ⚠️ Verlopen'}
                  </div>
                </div>
              </div>

              {/* Status acties */}
              <div className="flex gap-2 flex-wrap">
                {selectedAmbassador.status !== 'ACTIVE' && (
                  <button onClick={() => updateStatus(selectedAmbassador.id, 'ACTIVE')} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-200">
                    ✓ Activeren
                  </button>
                )}
                {selectedAmbassador.status !== 'INVITED' && (
                  <button onClick={() => updateStatus(selectedAmbassador.id, 'INVITED')} className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-200">
                    Terug naar uitgenodigd
                  </button>
                )}
                {selectedAmbassador.status !== 'INACTIVE' && (
                  <button onClick={() => updateStatus(selectedAmbassador.id, 'INACTIVE')} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200">
                    Deactiveren
                  </button>
                )}
                {selectedAmbassador.ticketId && (
                  <a href={`/admin/helpdesk/tickets/${selectedAmbassador.ticketId}`} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-100">
                    Ticket openen ↗
                  </a>
                )}
                <button
                  onClick={() => deactivateAmbassador(selectedAmbassador.id)}
                  className="ml-auto bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100"
                >
                  Verwijderen
                </button>
              </div>

              {/* Admin notities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interne notities</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value.slice(0, 2000))}
                  rows={2}
                  maxLength={2000}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Notities voor intern gebruik..."
                />
                <div className="flex items-center justify-between mt-1">
                  <button onClick={saveNotes} className="text-xs text-rose-600 hover:underline">
                    Opslaan
                  </button>
                  <span className="text-xs text-gray-400">{editNotes.length}/2000</span>
                </div>
              </div>

              {/* Berichten */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Berichten</h3>
                {detailLoading ? (
                  <div className="text-sm text-gray-400 text-center py-4">Laden...</div>
                ) : selectedAmbassador.messages.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                    Nog geen berichten.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedAmbassador.messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.isStaffReply ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${msg.isStaffReply ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.isStaffReply ? 'text-rose-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Stuur een bericht..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-700 disabled:opacity-50"
                  >
                    {sendingMessage ? '...' : 'Stuur'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
