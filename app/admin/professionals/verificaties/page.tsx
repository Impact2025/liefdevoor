'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  BadgeCheck,
  Clock,
  Check,
  X,
  ArrowLeft,
  RefreshCw,
  Loader2,
  FileText,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Professional {
  id: string;
  organizationName: string;
  organizationType: string;
  kvkNumber: string | null;
  btwNumber: string | null;
  websiteUrl: string | null;
  phoneNumber: string | null;
  address: string | null;
  verificationDoc: string | null;
  isVerified: boolean;
  professionalTier: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
    createdAt: string;
  };
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

export default function VerificatiesPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/professionals?verified=pending&page=${pagination.page}&limit=20&sortBy=oldest`
      );
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.professionals);
        setPagination(p => ({
          ...p,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleAction = async (action: 'verify' | 'reject') => {
    if (!selectedProfessional) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/professionals/${selectedProfessional.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (response.ok) {
        setProfessionals(prev => prev.filter(p => p.id !== selectedProfessional.id));
        setSelectedProfessional(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const daysSinceSubmission = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Vandaag';
    if (days === 1) return 'Gisteren';
    return `${days} dagen geleden`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/professionals"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Verificatie Queue</h1>
                <p className="text-slate-500">
                  {pagination.total} professional{pagination.total !== 1 ? 's' : ''} wachten op verificatie
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchProfessionals()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* List */}
          <div className="col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            ) : professionals.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BadgeCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Alle verificaties afgehandeld!
                </h3>
                <p className="text-slate-500 mb-4">
                  Er zijn geen professionals meer die wachten op verificatie.
                </p>
                <Link
                  href="/admin/professionals"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Terug naar overzicht
                </Link>
              </div>
            ) : (
              professionals.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProfessional(p)}
                  className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer hover:shadow-lg ${
                    selectedProfessional?.id === p.id
                      ? 'border-violet-500 shadow-lg'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {p.organizationName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {p.user.name || p.user.email}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${PROFESSIONAL_TYPES[p.organizationType]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {PROFESSIONAL_TYPES[p.organizationType]?.label || p.organizationType}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        {p.kvkNumber && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4 text-slate-400" />
                            KVK: {p.kvkNumber}
                          </span>
                        )}
                        {p.websiteUrl && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4 text-slate-400" />
                            Website
                          </span>
                        )}
                        {p.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-slate-400" />
                            Telefoon
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600 font-medium">
                          {daysSinceSubmission(p.createdAt)}
                        </span>
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
            {selectedProfessional ? (
              <div className="bg-white rounded-xl border border-slate-200 sticky top-8">
                {/* Header */}
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {selectedProfessional.organizationName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PROFESSIONAL_TYPES[selectedProfessional.organizationType]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {PROFESSIONAL_TYPES[selectedProfessional.organizationType]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-4 border-b border-slate-200 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Contactgegevens
                  </h4>

                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedProfessional.user.name || 'Geen naam'}
                      </p>
                      <p className="text-xs text-slate-500">Contactpersoon</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-900">{selectedProfessional.user.email}</p>
                      <p className="text-xs text-slate-500">Email</p>
                    </div>
                  </div>

                  {selectedProfessional.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-900">{selectedProfessional.phoneNumber}</p>
                        <p className="text-xs text-slate-500">Telefoon</p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.websiteUrl && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <div>
                        <a
                          href={selectedProfessional.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
                        >
                          {selectedProfessional.websiteUrl.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-slate-500">Website</p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-900 whitespace-pre-line">
                          {selectedProfessional.address}
                        </p>
                        <p className="text-xs text-slate-500">Adres</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="p-4 border-b border-slate-200 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Bedrijfsgegevens
                  </h4>

                  {selectedProfessional.kvkNumber && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-mono text-slate-900">
                          {selectedProfessional.kvkNumber}
                        </p>
                        <p className="text-xs text-slate-500">KVK Nummer</p>
                      </div>
                    </div>
                  )}

                  {selectedProfessional.btwNumber && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-mono text-slate-900">
                          {selectedProfessional.btwNumber}
                        </p>
                        <p className="text-xs text-slate-500">BTW Nummer</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-900">
                        {formatDate(selectedProfessional.createdAt)}
                      </p>
                      <p className="text-xs text-slate-500">Aangemeld op</p>
                    </div>
                  </div>
                </div>

                {/* Verification Document */}
                {selectedProfessional.verificationDoc && (
                  <div className="p-4 border-b border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                      Verificatie Document
                    </h4>
                    <a
                      href={selectedProfessional.verificationDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm text-slate-700"
                    >
                      <FileText className="w-4 h-4" />
                      Bekijk document
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Reden afwijzing (optioneel)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Bijv: KVK nummer niet geldig, website niet bereikbaar..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
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
                      onClick={() => handleAction('verify')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <BadgeCheck className="w-5 h-5" />
                          Verifieer
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    Bij verificatie ontvangt de professional een bevestigingsmail.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">
                  Selecteer een professional om de details te bekijken en te verifiëren
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
