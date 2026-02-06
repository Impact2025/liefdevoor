'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  BadgeCheck,
  Clock,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Check,
  X,
  Mail,
  Phone,
  Globe,
  Loader2,
  Sparkles,
  Crown,
  Star,
  AlertCircle,
  Download,
  ExternalLink,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';

interface Professional {
  id: string;
  organizationName: string;
  organizationType: string;
  kvkNumber: string | null;
  btwNumber: string | null;
  websiteUrl: string | null;
  phoneNumber: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  professionalTier: string;
  subscriptionEnd: string | null;
  canAccessContent: boolean;
  canDownloadPdf: boolean;
  canWhiteLabel: boolean;
  clientLimit: number;
  contentViews: number;
  toolsUsed: number;
  lastActiveAt: string | null;
  createdAt: string;
  teamMemberCount: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
    createdAt: string;
  };
}

interface Stats {
  total: number;
  verified: number;
  pendingVerification: number;
  recentSignups: number;
  mrr: number;
  byTier: Record<string, number>;
  byType: Record<string, number>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PROFESSIONAL_TYPES: Record<string, { label: string; color: string }> = {
  THERAPIST: { label: 'Therapeut', color: 'bg-purple-100 text-purple-700' },
  COACH: { label: 'Coach', color: 'bg-blue-100 text-blue-700' },
  CARE_INSTITUTION: { label: 'Zorginstelling', color: 'bg-green-100 text-green-700' },
  EDUCATION: { label: 'Onderwijs', color: 'bg-amber-100 text-amber-700' },
  HEALTHCARE: { label: 'Gezondheidszorg', color: 'bg-rose-100 text-rose-700' },
  GOVERNMENT: { label: 'Overheid', color: 'bg-slate-100 text-slate-700' },
  OTHER: { label: 'Overig', color: 'bg-gray-100 text-gray-700' },
};

const TIER_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  BASIC: { label: 'Basic', icon: <Star className="w-3 h-3" />, color: 'bg-slate-100 text-slate-600' },
  STANDARD: { label: 'Standard', icon: <Sparkles className="w-3 h-3" />, color: 'bg-blue-100 text-blue-700' },
  PREMIUM: { label: 'Premium', icon: <Crown className="w-3 h-3" />, color: 'bg-amber-100 text-amber-700' },
};

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        sortBy,
        ...(search && { search }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(tierFilter !== 'all' && { tier: tierFilter }),
        ...(verifiedFilter !== 'all' && { verified: verifiedFilter }),
      });

      const response = await fetch(`/api/admin/professionals?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.professionals);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, typeFilter, tierFilter, verifiedFilter, sortBy]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(p => ({ ...p, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleQuickVerify = async (id: string, action: 'verify' | 'reject') => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchProfessionals();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Professionals</h1>
                <p className="text-slate-500">Beheer professional accounts en verificaties</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/professionals/analytics"
                className="flex items-center gap-2 px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
              <Link
                href="/admin/professionals/verificaties"
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg transition-colors"
              >
                <Clock className="w-4 h-4" />
                Queue
                {stats && stats.pendingVerification > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                    {stats.pendingVerification}
                  </span>
                )}
              </Link>
              <a
                href="/api/admin/professionals/export?format=csv"
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Exporteer naar CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </a>
              <button
                onClick={() => fetchProfessionals()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Vernieuwen"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-sm text-slate-500">Totaal</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                  <p className="text-sm text-slate-500">Geverifieerd</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats.pendingVerification}</p>
                  <p className="text-sm text-slate-500">Wachtend</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.recentSignups}</p>
                  <p className="text-sm text-slate-500">Nieuwe (30d)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.mrr)}</p>
                  <p className="text-sm text-slate-500">MRR</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {(stats.byTier.STANDARD || 0) + (stats.byTier.PREMIUM || 0)}
                  </p>
                  <p className="text-sm text-slate-500">Betalend</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tier Distribution */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Per Tier</h3>
              <div className="space-y-2">
                {Object.entries(TIER_INFO).map(([tier, info]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${info.color}`}>
                        {info.icon}
                        {info.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{
                            width: `${((stats.byTier[tier] || 0) / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 w-8 text-right">
                        {stats.byTier[tier] || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Per Type</h3>
              <div className="space-y-2">
                {Object.entries(PROFESSIONAL_TYPES).map(([type, info]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${info.color}`}>
                      {info.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{
                            width: `${((stats.byType[type] || 0) / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 w-8 text-right">
                        {stats.byType[type] || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Zoek op naam, email, KVK..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={e => {
                  setTypeFilter(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">Alle types</option>
                {Object.entries(PROFESSIONAL_TYPES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={e => {
                setTierFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">Alle tiers</option>
              {Object.entries(TIER_INFO).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Verified Filter */}
            <select
              value={verifiedFilter}
              onChange={e => {
                setVerifiedFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">Alle statussen</option>
              <option value="verified">Geverifieerd</option>
              <option value="pending">Wachtend op verificatie</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="newest">Nieuwste eerst</option>
              <option value="oldest">Oudste eerst</option>
              <option value="name">Naam A-Z</option>
              <option value="lastActive">Laatst actief</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : professionals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Geen professionals gevonden
              </h3>
              <p className="text-slate-500">
                Pas je filters aan of wacht op nieuwe aanmeldingen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Organisatie
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Activiteit
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Aangemeld
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {professionals.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-violet-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 truncate">
                                {p.organizationName}
                              </p>
                              {p.isVerified && (
                                <BadgeCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-slate-500 truncate">
                              {p.user.name || p.user.email}
                            </p>
                            {p.kvkNumber && (
                              <p className="text-xs text-slate-400">
                                KVK: {p.kvkNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${PROFESSIONAL_TYPES[p.organizationType]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {PROFESSIONAL_TYPES[p.organizationType]?.label || p.organizationType}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium w-fit ${TIER_INFO[p.professionalTier]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {TIER_INFO[p.professionalTier]?.icon}
                          {TIER_INFO[p.professionalTier]?.label || p.professionalTier}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {p.isVerified ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <BadgeCheck className="w-4 h-4" />
                            Geverifieerd
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-sm">
                            <Clock className="w-4 h-4" />
                            Wachtend
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="text-slate-700">
                            {p.contentViews} views, {p.toolsUsed} tools
                          </p>
                          <p className="text-slate-400 text-xs">
                            {p.teamMemberCount} teamleden
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{formatDate(p.createdAt)}</p>
                        {p.lastActiveAt && (
                          <p className="text-xs text-slate-400">
                            Actief: {formatDate(p.lastActiveAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!p.isVerified && (
                            <>
                              <button
                                onClick={() => handleQuickVerify(p.id, 'verify')}
                                disabled={actionLoading === p.id}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Verifieer"
                              >
                                {actionLoading === p.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleQuickVerify(p.id, 'reject')}
                                disabled={actionLoading === p.id}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Afwijzen"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/professionals/${p.id}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Details bekijken"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Toon {((pagination.page - 1) * pagination.limit) + 1} tot{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} van{' '}
                {pagination.total} professionals
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
