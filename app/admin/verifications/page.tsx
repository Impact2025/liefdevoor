'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Camera,
  Check,
  X,
  AlertTriangle,
  Bot,
  User,
  Clock,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Shield,
  BadgeCheck,
  ImageOff,
  Sparkles,
} from 'lucide-react';

interface Verification {
  id: string;
  userId: string;
  photoUrl: string;
  pose: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  isAiGenerated: boolean | null;
  aiConfidence: number | null;
  aiAnalysis: {
    aiIndicators: string[];
    qualityIssues: string[];
    recommendation: string;
    reasoning: string;
  } | null;
  hasFace: boolean | null;
  faceCount: number | null;
  qualityScore: number | null;
  priority: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
    createdAt: string;
    isPhotoVerified: boolean;
  };
}

interface Stats {
  pending: number;
  flagged: number;
  approved: number;
  rejected: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, flagged: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'pending,flagged' | 'approved' | 'rejected' | 'all'>('pending,flagged');
  const [sortBy, setSortBy] = useState<'priority' | 'oldest' | 'newest' | 'ai-flagged'>('priority');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'all' ? 'pending,flagged,approved,rejected' : filter;
      const response = await fetch(
        `/api/admin/verifications?status=${statusParam}&page=${pagination.page}&limit=20&sortBy=${sortBy}`
      );
      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.page, sortBy]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedVerification) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/verifications/${selectedVerification.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (response.ok) {
        // Update local state
        setVerifications(prev =>
          prev.map(v =>
            v.id === selectedVerification.id
              ? { ...v, status: action === 'approve' ? 'approved' : 'rejected' }
              : v
          )
        );
        setSelectedVerification(null);
        setRejectionReason('');
        // Refresh to update counts
        fetchVerifications();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Wachtend' },
      flagged: { bg: 'bg-red-100', text: 'text-red-700', label: 'Gemarkeerd' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Goedgekeurd' },
      rejected: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Afgewezen' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Foto Verificatie</h1>
                <p className="text-slate-500">Review verificatiefoto's met AI-ondersteuning</p>
              </div>
            </div>
            <button
              onClick={() => fetchVerifications()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                <p className="text-sm text-slate-500">Wachtend</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
                <p className="text-sm text-slate-500">Gemarkeerd</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                <p className="text-sm text-slate-500">Goedgekeurd</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
                <p className="text-sm text-slate-500">Afgewezen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">Filter:</span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'pending,flagged', label: 'Te reviewen' },
                  { value: 'approved', label: 'Goedgekeurd' },
                  { value: 'rejected', label: 'Afgewezen' },
                  { value: 'all', label: 'Alles' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setFilter(f.value as typeof filter);
                      setPagination(p => ({ ...p, page: 1 }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f.value
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sorteer:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 bg-slate-100 border-0 rounded-lg text-sm font-medium text-slate-700"
              >
                <option value="priority">Prioriteit (AI-flagged eerst)</option>
                <option value="oldest">Oudste eerst</option>
                <option value="newest">Nieuwste eerst</option>
                <option value="ai-flagged">AI verdacht</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Verification List */}
          <div className="col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : verifications.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Geen verificaties te reviewen
                </h3>
                <p className="text-slate-500">
                  Alle verificaties zijn afgehandeld!
                </p>
              </div>
            ) : (
              verifications.map(v => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVerification(v)}
                  className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedVerification?.id === v.id
                      ? 'border-emerald-500 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Photo Preview */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      {v.photoUrl.startsWith('data:') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.photoUrl}
                          alt="Verificatie"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Image
                          src={v.photoUrl}
                          alt="Verificatie"
                          fill
                          className="object-cover rounded-lg"
                        />
                      )}
                      {/* AI Warning Badge */}
                      {v.isAiGenerated && v.aiConfidence && v.aiConfidence > 0.5 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {/* No Face Warning */}
                      {v.hasFace === false && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <ImageOff className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {v.user.name || 'Geen naam'}
                            </span>
                            {v.status === 'flagged' && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                Gemarkeerd
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{v.user.email}</p>
                        </div>
                        {getStatusBadge(v.status)}
                      </div>

                      {/* AI Analysis Summary */}
                      {v.aiAnalysis && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {v.isAiGenerated && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                              <Bot className="w-3 h-3" />
                              AI: {Math.round((v.aiConfidence || 0) * 100)}%
                            </span>
                          )}
                          {v.hasFace === false && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                              <ImageOff className="w-3 h-3" />
                              Geen gezicht
                            </span>
                          )}
                          {v.qualityScore !== null && v.qualityScore < 0.5 && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                              Lage kwaliteit
                            </span>
                          )}
                          {v.aiAnalysis.recommendation && (
                            <span
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                v.aiAnalysis.recommendation === 'approve'
                                  ? 'bg-green-50 text-green-700'
                                  : v.aiAnalysis.recommendation === 'reject'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              AI: {v.aiAnalysis.recommendation}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(v.submittedAt)}
                        </span>
                        {v.priority > 0 && (
                          <span className="flex items-center gap-1 text-red-500">
                            Prioriteit: {v.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  Pagina {pagination.page} van {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="col-span-1">
            {selectedVerification ? (
              <div className="bg-white rounded-xl border border-slate-200 sticky top-8">
                {/* Photo */}
                <div className="relative aspect-square">
                  {selectedVerification.photoUrl.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedVerification.photoUrl}
                      alt="Verificatie"
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  ) : (
                    <Image
                      src={selectedVerification.photoUrl}
                      alt="Verificatie"
                      fill
                      className="object-cover rounded-t-xl"
                    />
                  )}
                </div>

                <div className="p-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedVerification.user.name || 'Geen naam'}
                      </p>
                      <p className="text-sm text-slate-500">{selectedVerification.user.email}</p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {selectedVerification.aiAnalysis && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">AI Analyse</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {selectedVerification.aiAnalysis.reasoning}
                      </p>
                      {selectedVerification.aiAnalysis.aiIndicators.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-red-600 mb-1">AI Indicatoren:</p>
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {selectedVerification.aiAnalysis.aiIndicators.map((indicator, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-400 rounded-full" />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedVerification.aiAnalysis.qualityIssues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-amber-600 mb-1">
                            Kwaliteitsproblemen:
                          </p>
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {selectedVerification.aiAnalysis.qualityIssues.map((issue, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-amber-400 rounded-full" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {selectedVerification.isAiGenerated
                          ? `${Math.round((selectedVerification.aiConfidence || 0) * 100)}%`
                          : '0%'}
                      </p>
                      <p className="text-xs text-slate-500">AI Kans</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {selectedVerification.faceCount ?? '?'}
                      </p>
                      <p className="text-xs text-slate-500">Gezichten</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-slate-900">
                        {selectedVerification.qualityScore
                          ? `${Math.round(selectedVerification.qualityScore * 100)}%`
                          : '?'}
                      </p>
                      <p className="text-xs text-slate-500">Kwaliteit</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {(selectedVerification.status === 'pending' ||
                    selectedVerification.status === 'flagged') && (
                    <div className="space-y-3">
                      {/* Rejection reason input */}
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Reden afwijzing (optioneel)
                        </label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          placeholder="Bijv: Geen duidelijk gezicht zichtbaar"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction('reject')}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <X className="w-5 h-5" />
                              Afwijzen
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleAction('approve')}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              Goedkeuren
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Already reviewed */}
                  {selectedVerification.status === 'approved' && (
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <BadgeCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-700">Goedgekeurd</p>
                      {selectedVerification.reviewedAt && (
                        <p className="text-xs text-green-600">
                          {formatDate(selectedVerification.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedVerification.status === 'rejected' && (
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-red-700">Afgewezen</p>
                      {selectedVerification.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          {selectedVerification.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">
                  Selecteer een verificatie om details te bekijken
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
