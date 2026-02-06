'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  BadgeCheck,
  Clock,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Calendar,
  ExternalLink,
  Loader2,
  Check,
  X,
  Users,
  Eye,
  Wrench,
  Crown,
  Star,
  Sparkles,
  Trash2,
  Edit,
  AlertTriangle,
  Activity,
  TrendingUp,
  MoreVertical,
  MessageSquare,
  Pin,
  PinOff,
  Send,
  History,
  LogIn,
  BookOpen,
  Download,
  Video,
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
  verifiedAt: string | null;
  verifiedById: string | null;
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
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
    createdAt: string;
    isVerified: boolean;
    isPhotoVerified: boolean;
    lastSeen: string | null;
    city: string | null;
  };
  teamMembers: {
    id: string;
    email: string;
    name: string;
    role: string | null;
    canEdit: boolean;
    canInvite: boolean;
    invitedAt: string;
    acceptedAt: string | null;
  }[];
}

interface AdminNote {
  id: string;
  content: string;
  noteType: string;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const NOTE_TYPES: Record<string, { label: string; color: string }> = {
  GENERAL: { label: 'Algemeen', color: 'bg-slate-100 text-slate-700' },
  VERIFICATION: { label: 'Verificatie', color: 'bg-blue-100 text-blue-700' },
  SUPPORT: { label: 'Support', color: 'bg-purple-100 text-purple-700' },
  BILLING: { label: 'Facturatie', color: 'bg-green-100 text-green-700' },
  WARNING: { label: 'Waarschuwing', color: 'bg-red-100 text-red-700' },
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  LOGIN: <LogIn className="w-4 h-4" />,
  ARTICLE_VIEWED: <BookOpen className="w-4 h-4" />,
  ARTICLE_DOWNLOADED: <Download className="w-4 h-4" />,
  TOOL_USED: <Wrench className="w-4 h-4" />,
  WEBINAR_REGISTERED: <Video className="w-4 h-4" />,
  PROFILE_UPDATE: <Edit className="w-4 h-4" />,
  TEAM_MEMBER_INVITED: <Users className="w-4 h-4" />,
};

const PROFESSIONAL_TYPES: Record<string, { label: string; color: string }> = {
  THERAPIST: { label: 'Therapeut', color: 'bg-purple-100 text-purple-700' },
  COACH: { label: 'Coach', color: 'bg-blue-100 text-blue-700' },
  CARE_INSTITUTION: { label: 'Zorginstelling', color: 'bg-green-100 text-green-700' },
  EDUCATION: { label: 'Onderwijs', color: 'bg-amber-100 text-amber-700' },
  HEALTHCARE: { label: 'Gezondheidszorg', color: 'bg-rose-100 text-rose-700' },
  GOVERNMENT: { label: 'Overheid', color: 'bg-slate-100 text-slate-700' },
  OTHER: { label: 'Overig', color: 'bg-gray-100 text-gray-700' },
};

const TIER_INFO: Record<string, { label: string; icon: React.ReactNode; color: string; price: string }> = {
  BASIC: { label: 'Basic', icon: <Star className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600', price: 'Gratis' },
  STANDARD: { label: 'Standard', icon: <Sparkles className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', price: '€29/maand' },
  PREMIUM: { label: 'Premium', icon: <Crown className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700', price: '€99/maand' },
};

export default function ProfessionalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('GENERAL');
  const [notesLoading, setNotesLoading] = useState(false);

  // Activity state
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'activity'>('info');

  useEffect(() => {
    async function fetchProfessional() {
      try {
        const response = await fetch(`/api/admin/professionals/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProfessional(data.professional);
        } else if (response.status === 404) {
          router.push('/admin/professionals');
        }
      } catch (error) {
        console.error('Failed to fetch professional:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfessional();
  }, [id, router]);

  // Fetch notes
  useEffect(() => {
    async function fetchNotes() {
      if (!id) return;
      setNotesLoading(true);
      try {
        const response = await fetch(`/api/admin/professionals/${id}/notes`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setNotesLoading(false);
      }
    }

    fetchNotes();
  }, [id]);

  // Fetch activity
  useEffect(() => {
    async function fetchActivity() {
      if (!id) return;
      setActivitiesLoading(true);
      try {
        const response = await fetch(`/api/admin/professionals/${id}/activity?limit=20`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setActivitiesLoading(false);
      }
    }

    fetchActivity();
  }, [id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`/api/admin/professionals/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, noteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => [data.note, ...prev]);
        setNewNote('');
        setNoteType('GENERAL');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const response = await fetch(`/api/admin/professionals/${id}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });

      if (response.ok) {
        setNotes(prev =>
          prev.map(n => (n.id === noteId ? { ...n, isPinned: !currentPinned } : n))
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
        );
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/admin/professionals/${id}/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleVerify = async (action: 'verify' | 'reject') => {
    if (!professional) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfessional(prev => prev ? { ...prev, ...data.professional } : null);
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTierChange = async (newTier: string) => {
    if (!professional) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionalTier: newTier }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfessional(prev => prev ? { ...prev, ...data.professional } : null);
        setShowTierModal(false);
      }
    } catch (error) {
      console.error('Tier change failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!professional) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/professionals');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Professional niet gevonden</h2>
          <Link href="/admin/professionals" className="text-violet-600 hover:text-violet-700">
            Terug naar overzicht
          </Link>
        </div>
      </div>
    );
  }

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
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {professional.organizationName}
                  </h1>
                  {professional.isVerified && (
                    <BadgeCheck className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${PROFESSIONAL_TYPES[professional.organizationType]?.color}`}>
                    {PROFESSIONAL_TYPES[professional.organizationType]?.label}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${TIER_INFO[professional.professionalTier]?.color}`}>
                    {TIER_INFO[professional.professionalTier]?.icon}
                    {TIER_INFO[professional.professionalTier]?.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!professional.isVerified && (
                <>
                  <button
                    onClick={() => handleVerify('reject')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Afwijzen
                  </button>
                  <button
                    onClick={() => handleVerify('verify')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BadgeCheck className="w-4 h-4" />
                    )}
                    Verifieer
                  </button>
                </>
              )}
              <button
                onClick={() => setShowTierModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 font-medium rounded-lg transition-colors"
              >
                <Crown className="w-4 h-4" />
                Tier wijzigen
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{professional.contentViews}</p>
                    <p className="text-sm text-slate-500">Content views</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{professional.toolsUsed}</p>
                    <p className="text-sm text-slate-500">Tools gebruikt</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{professional.teamMembers.length}</p>
                    <p className="text-sm text-slate-500">Teamleden</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {professional.lastActiveAt
                        ? new Date(professional.lastActiveAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
                        : 'Nooit'}
                    </p>
                    <p className="text-sm text-slate-500">Laatst actief</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'info'
                      ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Informatie
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'notes'
                      ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Notities
                  {notes.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full">
                      {notes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'activity'
                      ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Activiteit
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'notes' && (
                <div className="p-4">
                  {/* Add Note Form */}
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <select
                        value={noteType}
                        onChange={e => setNoteType(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      >
                        {Object.entries(NOTE_TYPES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="Schrijf een notitie..."
                        rows={2}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  {notesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>Nog geen notities</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map(note => (
                        <div
                          key={note.id}
                          className={`p-4 rounded-lg border ${
                            note.isPinned ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${NOTE_TYPES[note.noteType]?.color || 'bg-slate-100 text-slate-700'}`}>
                                {NOTE_TYPES[note.noteType]?.label || note.noteType}
                              </span>
                              {note.isPinned && (
                                <Pin className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleTogglePin(note.id, note.isPinned)}
                                className="p-1 hover:bg-slate-100 rounded transition-colors"
                                title={note.isPinned ? 'Losmaken' : 'Vastpinnen'}
                              >
                                {note.isPinned ? (
                                  <PinOff className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <Pin className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                title="Verwijderen"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm whitespace-pre-wrap">{note.content}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <span>{note.authorName}</span>
                            <span>•</span>
                            <span>{new Date(note.createdAt).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="p-4">
                  {activitiesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>Nog geen activiteit geregistreerd</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {ACTION_ICONS[activity.action] || <Activity className="w-4 h-4 text-slate-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">{activity.action.replace(/_/g, ' ')}</span>
                              {activity.description && (
                                <span className="text-slate-500"> - {activity.description}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(activity.createdAt).toLocaleDateString('nl-NL', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Organization Info - Only show when info tab is active */}
            {activeTab === 'info' && (
            <>
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Organisatie Informatie</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Organisatienaam
                    </p>
                    <p className="text-slate-900">{professional.organizationName}</p>
                  </div>

                  {professional.kvkNumber && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        KVK Nummer
                      </p>
                      <p className="text-slate-900 font-mono">{professional.kvkNumber}</p>
                    </div>
                  )}

                  {professional.btwNumber && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        BTW Nummer
                      </p>
                      <p className="text-slate-900 font-mono">{professional.btwNumber}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {professional.websiteUrl && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Website
                      </p>
                      <a
                        href={professional.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-600 hover:text-violet-700 flex items-center gap-1"
                      >
                        {professional.websiteUrl.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {professional.phoneNumber && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Telefoon
                      </p>
                      <p className="text-slate-900">{professional.phoneNumber}</p>
                    </div>
                  )}

                  {professional.address && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Adres
                      </p>
                      <p className="text-slate-900 whitespace-pre-line">{professional.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Teamleden ({professional.teamMembers.length})
                </h3>
              </div>
              {professional.teamMembers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Geen teamleden toegevoegd</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {professional.teamMembers.map(member => (
                    <div key={member.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                            {member.role}
                          </span>
                        )}
                        {member.acceptedAt ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <Check className="w-3 h-3" />
                            Geaccepteerd
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-xs">
                            <Clock className="w-3 h-3" />
                            Uitgenodigd
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Owner */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Accounteigenaar</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {professional.user.name || 'Geen naam'}
                    </p>
                    <p className="text-sm text-slate-500">{professional.user.email}</p>
                  </div>
                </div>

                {professional.user.city && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {professional.user.city}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Lid sinds {formatDate(professional.user.createdAt)}
                </div>

                <Link
                  href={`/admin/users/${professional.user.id}`}
                  className="block w-full text-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
                >
                  Bekijk gebruikersprofiel
                </Link>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Abonnement</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tier</span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${TIER_INFO[professional.professionalTier]?.color}`}>
                    {TIER_INFO[professional.professionalTier]?.icon}
                    {TIER_INFO[professional.professionalTier]?.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Prijs</span>
                  <span className="font-medium text-slate-900">
                    {TIER_INFO[professional.professionalTier]?.price}
                  </span>
                </div>

                {professional.subscriptionEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Verloopt</span>
                    <span className="text-slate-900">{formatDate(professional.subscriptionEnd)}</span>
                  </div>
                )}

                <hr className="border-slate-200" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Content toegang</span>
                    {professional.canAccessContent ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">PDF downloads</span>
                    {professional.canDownloadPdf ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">White-label</span>
                    {professional.canWhiteLabel ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Client limiet</span>
                    <span className="text-slate-900">
                      {professional.clientLimit === 0 ? 'Onbeperkt' : professional.clientLimit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Verificatie Status</h3>
              </div>
              <div className="p-4">
                {professional.isVerified ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BadgeCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-medium text-green-700">Geverifieerd</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(professional.verifiedAt)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="font-medium text-amber-700">Wacht op verificatie</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Aangevraagd op {formatDate(professional.createdAt)}
                    </p>
                  </div>
                )}

                {professional.verificationDoc && (
                  <a
                    href={professional.verificationDoc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Bekijk verificatiedocument
                  </a>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Aangemaakt</span>
                  <span className="text-slate-700">{formatDate(professional.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bijgewerkt</span>
                  <span className="text-slate-700">{formatDate(professional.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Laatst actief</span>
                  <span className="text-slate-700">{formatDate(professional.lastActiveAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Change Modal */}
      {showTierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tier Wijzigen</h3>
            <p className="text-slate-600 mb-4">
              Selecteer de nieuwe tier voor {professional.organizationName}
            </p>
            <div className="space-y-2">
              {Object.entries(TIER_INFO).map(([tier, info]) => (
                <button
                  key={tier}
                  onClick={() => handleTierChange(tier)}
                  disabled={actionLoading || professional.professionalTier === tier}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    professional.professionalTier === tier
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded ${info.color}`}>
                      {info.icon}
                      {info.label}
                    </span>
                  </div>
                  <span className="text-slate-600">{info.price}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTierModal(false)}
              className="mt-4 w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Account Verwijderen</h3>
                <p className="text-sm text-slate-500">Deze actie kan niet ongedaan worden</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              Weet je zeker dat je het professional account van{' '}
              <strong>{professional.organizationName}</strong> wilt verwijderen? Alle teamleden
              worden ook verwijderd.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Verwijderen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
