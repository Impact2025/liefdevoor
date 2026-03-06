'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Calendar,
  Crown,
  BadgeCheck,
  Camera,
  Activity,
  MessageSquare,
  Heart,
  Image,
  Shield,
  Star,
  Clock,
  Zap,
} from 'lucide-react'

interface UserDetail {
  id: string
  name: string | null
  email: string | null
  role: string
  gender: string | null
  birthDate: string | null
  city: string | null
  postcode: string | null
  bio: string | null
  profileImage: string | null
  isVerified: boolean
  isPhotoVerified: boolean
  isOnboarded: boolean
  profileComplete: boolean
  subscriptionTier: string
  credits: number
  safetyScore: number
  createdAt: string
  lastSeen: string | null
  isOnline: boolean
  registrationSource: string | null
  occupation: string | null
  education: string | null
  _count: {
    matches1: number
    matches2: number
    photos: number
  }
  subscriptions: Array<{
    id: string
    plan: string
    status: string
    startDate: string
    endDate: string | null
    createdAt: string
  }>
  migrationUser: {
    segment: string
    status: string
    claimedAt: string | null
    couponCode: string | null
    oldEmail: string
  } | null
}

function getAge(birthDate: string | null): string {
  if (!birthDate) return 'Onbekend'
  const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  return `${age} jaar`
}

function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setUser(data.user)
      })
      .catch(() => setError('Kon gebruiker niet laden'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error || 'Gebruiker niet gevonden'}
        </div>
        <Link href="/admin/dashboard" className="mt-4 inline-flex items-center gap-2 text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> Terug naar dashboard
        </Link>
      </div>
    )
  }

  const totalMatches = user._count.matches1 + user._count.matches2

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Terug naar dashboard
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-slate-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{user.name || 'Naamloos'}</h1>
              {user.isOnline && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Online
                </span>
              )}
              {user.subscriptionTier === 'PREMIUM' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
              {user.role === 'ADMIN' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
              {user.gender && <span>{user.gender === 'MALE' ? 'Man' : user.gender === 'FEMALE' ? 'Vrouw' : user.gender}</span>}
              {user.birthDate && <span>{getAge(user.birthDate)}</span>}
              {user.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {user.city}
                </span>
              )}
              {user.registrationSource && (
                <span className="flex items-center gap-1 text-violet-600">
                  <Star className="w-3.5 h-3.5" /> {user.registrationSource}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${user.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                <BadgeCheck className="w-3 h-3" />
                {user.isVerified ? 'Email geverifieerd' : 'Niet geverifieerd'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${user.isPhotoVerified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <Camera className="w-3 h-3" />
                {user.isPhotoVerified ? "Foto geverifieerd" : "Foto niet geverifieerd"}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${user.profileComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'}`}>
                <Activity className="w-3 h-3" />
                {user.profileComplete ? 'Profiel compleet' : 'Profiel incompleet'}
              </span>
            </div>
          </div>

          {/* Safety score */}
          <div className="text-center flex-shrink-0">
            <div className={`text-3xl font-bold ${user.safetyScore >= 80 ? 'text-green-600' : user.safetyScore >= 50 ? 'text-amber-500' : 'text-red-600'}`}>
              {user.safetyScore}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Safety score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Activiteit</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-rose-600">{totalMatches}</div>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                <Heart className="w-3 h-3" /> Matches
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{user._count.photos}</div>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                <Image className="w-3 h-3" /> Foto&apos;s
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">{user.credits}</div>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-0.5 mt-0.5">
                <Zap className="w-3 h-3" /> Credits
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Tijdlijn</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Geregistreerd</span>
              <span className="text-slate-800 font-medium">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Laatste activiteit</span>
              <span className="text-slate-800 font-medium">{formatDateTime(user.lastSeen)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Onboarding</span>
              <span className={`font-medium ${user.isOnboarded ? 'text-green-600' : 'text-orange-500'}`}>
                {user.isOnboarded ? 'Voltooid' : 'Niet voltooid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-2">Bio</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Subscriptions */}
      {user.subscriptions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Abonnementen</h2>
          <div className="space-y-2">
            {user.subscriptions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-slate-800">{sub.plan}</span>
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {formatDate(sub.startDate)} {sub.endDate ? `→ ${formatDate(sub.endDate)}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration info */}
      {user.migrationUser && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 mb-6">
          <h2 className="font-semibold text-emerald-800 mb-3">Migratie (OogvoorLiefde)</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-emerald-600">Oud email</span>
              <div className="font-medium text-emerald-900">{user.migrationUser.oldEmail}</div>
            </div>
            <div>
              <span className="text-emerald-600">Segment</span>
              <div className="font-medium text-emerald-900">{user.migrationUser.segment}</div>
            </div>
            <div>
              <span className="text-emerald-600">Status</span>
              <div className="font-medium text-emerald-900">{user.migrationUser.status}</div>
            </div>
            {user.migrationUser.claimedAt && (
              <div>
                <span className="text-emerald-600">Geclaimd op</span>
                <div className="font-medium text-emerald-900">{formatDate(user.migrationUser.claimedAt)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action links */}
      <div className="flex gap-3">
        <Link
          href={`/api/admin/users/${user.id}/activity`}
          target="_blank"
          className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          Activiteitslog bekijken
        </Link>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          Terug naar dashboard
        </Link>
      </div>
    </div>
  )
}
