'use client'

/**
 * Admin Coupon Management - Wereldklasse Marketing Tool
 *
 * Features:
 * - Create/edit/delete coupons
 * - Real-time usage statistics
 * - Quick actions (activate/deactivate, copy code)
 * - Advanced filtering and search
 * - Export coupon data
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Ticket, Plus, Search, Filter, Copy, Check,
  MoreVertical, Edit, Trash2, Eye, TrendingUp,
  Calendar, Users, DollarSign, BarChart3, AlertCircle,
  X, Save
} from 'lucide-react'

interface Coupon {
  id: string
  code: string
  description: string | null
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL'
  value: number
  applicableTo: 'ALL' | 'SUBSCRIPTION' | 'CREDITS'
  applicablePlans: string | null
  minPurchaseAmount: number | null
  maxDiscountCap: number | null
  maxTotalUses: number | null
  maxUsesPerUser: number
  currentTotalUses: number
  validFrom: string
  validUntil: string | null
  isActive: boolean
  createdBy: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    usages: number
  }
}

export default function AdminCouponsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUses: 0,
    totalDiscountGiven: 0,
  })

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  // Fetch coupons
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchCoupons()
      fetchStats()
    }
  }, [session])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/coupons')
      if (res.ok) {
        const data = await res.json()
        setCoupons(data.coupons || [])
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/coupons/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        fetchCoupons()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to toggle coupon:', error)
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze coupon wilt verwijderen?')) return

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchCoupons()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error)
    }
  }

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesActive = filterActive === 'all' ? true :
                         filterActive === 'active' ? coupon.isActive : !coupon.isActive
    const matchesType = filterType === 'all' ? true : coupon.type === filterType

    return matchesSearch && matchesActive && matchesType
  })

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.type === 'PERCENTAGE') return `${coupon.value}%`
    if (coupon.type === 'FIXED_AMOUNT') return `€${coupon.value.toFixed(2)}`
    return 'Gratis proef'
  }

  const getUsagePercentage = (coupon: Coupon) => {
    if (!coupon.maxTotalUses) return 0
    return (coupon.currentTotalUses / coupon.maxTotalUses) * 100
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Coupon Beheer</h1>
                  <p className="text-sm text-slate-500">Maak en beheer kortingscodes</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nieuwe Coupon
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<Ticket className="w-5 h-5" />}
            label="Totaal Coupons"
            value={stats.totalCoupons}
            color="primary"
          />
          <StatsCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Actieve Coupons"
            value={stats.activeCoupons}
            color="success"
          />
          <StatsCard
            icon={<Users className="w-5 h-5" />}
            label="Totaal Gebruikt"
            value={stats.totalUses}
            color="blue"
          />
          <StatsCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Korting Gegeven"
            value={`€${stats.totalDiscountGiven.toFixed(2)}`}
            color="amber"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Zoek op code of beschrijving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* Status filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">Alle status</option>
              <option value="active">Actief</option>
              <option value="inactive">Inactief</option>
            </select>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">Alle types</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Vast bedrag</option>
              <option value="FREE_TRIAL">Gratis proef</option>
            </select>
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Geen coupons gevonden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Korting
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Gebruik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Geldig
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-600">{coupon.code}</span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title="Kopieer code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-4 h-4 text-success-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-slate-500 mt-1">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                          {coupon.type === 'PERCENTAGE' && 'Percentage'}
                          {coupon.type === 'FIXED_AMOUNT' && 'Vast bedrag'}
                          {coupon.type === 'FREE_TRIAL' && 'Gratis proef'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{getDiscountDisplay(coupon)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-900">
                            {coupon.currentTotalUses} {coupon.maxTotalUses ? `/ ${coupon.maxTotalUses}` : ''}
                          </div>
                          {coupon.maxTotalUses && (
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500 transition-all"
                                style={{ width: `${Math.min(getUsagePercentage(coupon), 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {coupon.validUntil ? (
                            <>Tot {new Date(coupon.validUntil).toLocaleDateString('nl-NL')}</>
                          ) : (
                            <span className="text-success-600 font-medium">Onbeperkt</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            coupon.isActive
                              ? 'bg-success-100 text-success-700 hover:bg-success-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {coupon.isActive ? 'Actief' : 'Inactief'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingCoupon(coupon)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Bewerken"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Verwijderen"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCoupon) && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCoupon(null)
          }}
          onSuccess={() => {
            fetchCoupons()
            fetchStats()
            setShowCreateModal(false)
            setEditingCoupon(null)
          }}
        />
      )}
    </div>
  )
}

// Stats Card Component
function StatsCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  const colorClasses = {
    primary: 'bg-rose-100 text-rose-600',
    success: 'bg-success-100 text-success-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Coupon Create/Edit Modal Component
function CouponModal({ coupon, onClose, onSuccess }: {
  coupon: Coupon | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    type: coupon?.type || 'PERCENTAGE',
    value: coupon?.value || 10,
    applicableTo: coupon?.applicableTo || 'ALL',
    minPurchaseAmount: coupon?.minPurchaseAmount || null,
    maxDiscountCap: coupon?.maxDiscountCap || null,
    maxTotalUses: coupon?.maxTotalUses || null,
    maxUsesPerUser: coupon?.maxUsesPerUser || 1,
    validFrom: coupon?.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: coupon?.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
    isActive: coupon?.isActive ?? true,
    notes: coupon?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons'
      const method = coupon ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validUntil: formData.validUntil || null,
          minPurchaseAmount: formData.minPurchaseAmount || null,
          maxDiscountCap: formData.maxDiscountCap || null,
          maxTotalUses: formData.maxTotalUses || null,
        }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const error = await res.json()
        alert(error.message || 'Er ging iets mis')
      }
    } catch (error) {
      console.error('Failed to save coupon:', error)
      alert('Er ging iets mis bij het opslaan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {coupon ? 'Coupon Bewerken' : 'Nieuwe Coupon'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Couponcode *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              placeholder="LOVE2024"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Beschrijving
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Nieuwjaars actie 2024"
            />
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Vast bedrag</option>
                <option value="FREE_TRIAL">Gratis proef</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Waarde * {formData.type === 'PERCENTAGE' ? '(%)' : '(€)'}
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Applicable To */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Geldt voor
            </label>
            <select
              value={formData.applicableTo}
              onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="ALL">Alles</option>
              <option value="SUBSCRIPTION">Alleen abonnementen</option>
              <option value="CREDITS">Alleen credits</option>
            </select>
          </div>

          {/* Restrictions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min. aankoopbedrag (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minPurchaseAmount || ''}
                onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max. korting (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maxDiscountCap || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscountCap: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max. totaal gebruik
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxTotalUses || ''}
                onChange={(e) => setFormData({ ...formData, maxTotalUses: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Onbeperkt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max. gebruik per gebruiker *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxUsesPerUser}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Geldig vanaf *
              </label>
              <input
                type="date"
                required
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Geldig tot
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Coupon direct activeren
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notities (intern)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Extra informatie voor admins..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {coupon ? 'Bijwerken' : 'Aanmaken'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
