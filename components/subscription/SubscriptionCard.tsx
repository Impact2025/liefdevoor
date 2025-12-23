/**
 * SubscriptionCard - Wereldklasse subscription management
 *
 * Toont huidige abonnement met features, limits, en upgrade opties
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Crown,
  Heart,
  MessageCircle,
  Eye,
  Volume2,
  CheckCircle2,
  Zap,
  TrendingUp,
  Sparkles,
  Shield,
  EyeOff,
  MapPin,
  ChevronRight,
  Calendar,
  CreditCard,
  Gift
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SubscriptionInfo } from '@/lib/subscription'
import { formatPrice } from '@/lib/pricing'

interface SubscriptionCardProps {
  className?: string
}

export function SubscriptionCard({ className = '' }: SubscriptionCardProps) {
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    )
  }

  if (!subscription) {
    return null
  }

  const planConfig = {
    FREE: {
      name: 'Basis',
      color: 'gray',
      gradient: 'from-white to-white',
      icon: Heart,
      iconBg: 'bg-gray-50',
      iconColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      accentColor: 'text-gray-900',
    },
    PLUS: {
      name: 'Liefde Plus',
      color: 'teal',
      gradient: 'from-white to-white',
      icon: Sparkles,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-700',
      borderColor: 'border-teal-200',
      accentColor: 'text-teal-700',
    },
    COMPLETE: {
      name: 'Liefde Compleet',
      color: 'teal',
      gradient: 'from-white to-white',
      icon: Crown,
      iconBg: 'bg-teal-700',
      iconColor: 'text-white',
      borderColor: 'border-teal-300',
      accentColor: 'text-teal-700',
    },
  }

  const config = planConfig[subscription.plan]
  const Icon = config.icon

  // Calculate usage percentages
  const dailyLikesUsed = subscription.features.dailyLikes === -1 ? 0 : 50 // Mock data
  const dailyLikesLimit = subscription.features.dailyLikes
  const likesPercentage = dailyLikesLimit === -1 ? 100 : (dailyLikesUsed / dailyLikesLimit) * 100

  return (
    <div className={className}>
      {/* Main Subscription Card */}
      <div className={`bg-white rounded-lg border ${config.borderColor} overflow-hidden`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                <p className="text-sm text-gray-500">
                  {subscription.plan === 'FREE' ? 'Gratis' : 'Premium'}
                </p>
              </div>
            </div>

            {subscription.status === 'active' && (
              <div className={`px-3 py-1 rounded-md ${
                subscription.plan === 'COMPLETE' || subscription.plan === 'PLUS'
                  ? 'bg-teal-50 text-teal-700'
                  : 'bg-gray-50 text-gray-700'
              } text-sm font-medium`}>
                Actief
              </div>
            )}
          </div>

          {subscription.plan !== 'FREE' && subscription.expiresAt && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Verlengt op</span>
                <span className="font-medium text-gray-900">
                  {new Date(subscription.expiresAt).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Daily Limits */}
        {subscription.plan !== 'COMPLETE' && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">Dagelijkse likes</span>
                  <span className="text-sm font-medium text-gray-900">
                    {subscription.features.dailyLikes === -1 ? 'Onbeperkt' : `${dailyLikesUsed}/${dailyLikesLimit}`}
                  </span>
                </div>
                {subscription.features.dailyLikes !== -1 && (
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all"
                      style={{ width: `${likesPercentage}%` }}
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nieuwe chats</span>
                  <span className="text-sm font-medium text-gray-900">
                    {subscription.features.dailyChats === -1 ? 'Onbeperkt' : `0/${subscription.features.dailyChats}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Inbegrepen</h4>
          <div className="grid grid-cols-1 gap-2">
            {subscription.features.dailyLikes === -1 && (
              <FeatureItem icon={Heart} label="Onbeperkt likes" active />
            )}
            {subscription.features.dailyChats === -1 && (
              <FeatureItem icon={MessageCircle} label="Onbeperkt chatten" active />
            )}
            {subscription.features.canSeeWhoLikedYou && (
              <FeatureItem icon={Eye} label="Zie wie je leuk vindt" active />
            )}
            {subscription.features.canSendAudio && (
              <FeatureItem icon={Volume2} label="Audioberichten" active />
            )}
            {subscription.features.readReceipts && (
              <FeatureItem icon={CheckCircle2} label="Leesbevestigingen" active />
            )}
            {subscription.features.noAds && (
              <FeatureItem icon={Shield} label="Geen advertenties" active />
            )}
            {subscription.features.canBoost && (
              <FeatureItem icon={Zap} label="Profiel boost" active />
            )}
            {subscription.features.priorityInSearch && (
              <FeatureItem icon={TrendingUp} label="Prioriteit in zoeken" active />
            )}
            {subscription.features.advancedFilters && (
              <FeatureItem icon={Sparkles} label="Geavanceerde filters" active />
            )}
            {subscription.features.canUsePassport && (
              <FeatureItem icon={MapPin} label="Passport (swipe overal)" active />
            )}
            {subscription.features.canUseIncognito && (
              <FeatureItem icon={EyeOff} label="Incognito modus" active />
            )}
          </div>
        </div>

        {/* Supermessages Balance */}
        {(subscription.monthlySupermessages > 0 || subscription.credits > 0) && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Superberichten</p>
                <p className="text-xs text-gray-500">
                  {subscription.monthlySupermessages > 0 && `${subscription.monthlySupermessages} maandelijks`}
                  {subscription.monthlySupermessages > 0 && subscription.credits > 0 && ' + '}
                  {subscription.credits > 0 && `${subscription.credits} gekocht`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">
                  {subscription.monthlySupermessages + subscription.credits}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        {subscription.plan !== 'COMPLETE' && (
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={() => router.push('/prijzen')}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              {subscription.plan === 'FREE' ? 'Upgrade naar Plus' : 'Upgrade naar Compleet'}
            </button>
          </div>
        )}

        {/* Manage Subscription */}
        {subscription.plan !== 'FREE' && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => router.push('/subscription/manage')}
              className="w-full text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
            >
              Abonnement beheren
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

function FeatureItem({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        active ? 'bg-teal-100' : 'bg-gray-100'
      }`}>
        <Icon className={`w-3 h-3 ${active ? 'text-teal-700' : 'text-gray-400'}`} />
      </div>
      <span className={`text-sm ${active ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colorConfig = {
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  }

  return (
    <div className={`${colorConfig[color as keyof typeof colorConfig]} border rounded-xl p-3`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}

export default SubscriptionCard
