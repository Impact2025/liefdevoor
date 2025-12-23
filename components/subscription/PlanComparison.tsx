/**
 * PlanComparison - Compare subscription plans
 *
 * Allows users to see what's included in each plan and upgrade
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown,
  Heart,
  Sparkles,
  Check,
  X,
  ChevronRight,
  Zap,
  MessageCircle,
  Eye,
  Volume2,
  CheckCircle2,
  Shield,
  TrendingUp,
  MapPin,
  EyeOff,
  Gift
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/pricing'

interface PlanComparisonProps {
  currentPlan?: 'FREE' | 'PLUS' | 'COMPLETE'
  className?: string
}

export function PlanComparison({ currentPlan = 'FREE', className = '' }: PlanComparisonProps) {
  const router = useRouter()

  const features = [
    { id: 'profile', name: 'Profiel aanmaken', free: true, plus: true, complete: true, icon: Heart },
    { id: 'likes', name: 'Dagelijkse likes', free: '10', plus: 'Onbeperkt', complete: 'Onbeperkt', icon: Heart },
    { id: 'chats', name: 'Chats starten per dag', free: '1', plus: 'Onbeperkt', complete: 'Onbeperkt', icon: MessageCircle },
    { id: 'see_likes', name: 'Zie wie jou leuk vindt', free: false, plus: true, complete: true, icon: Eye },
    { id: 'audio', name: 'Audioberichten sturen', free: false, plus: true, complete: true, icon: Volume2 },
    { id: 'read_receipts', name: 'Leesbevestigingen', free: false, plus: true, complete: true, icon: CheckCircle2 },
    { id: 'no_ads', name: 'Geen advertenties', free: false, plus: true, complete: true, icon: Shield },
    { id: 'supermessages', name: 'Superberichten per maand', free: '0', plus: '0', complete: '3', icon: Gift },
    { id: 'boost', name: 'Profiel boost per maand', free: '0', plus: '0', complete: '1', icon: Zap },
    { id: 'priority', name: 'Prioriteit in zoekresultaten', free: false, plus: false, complete: true, icon: TrendingUp },
    { id: 'filters', name: 'Geavanceerde filters', free: false, plus: false, complete: true, icon: Sparkles },
    { id: 'passport', name: 'Passport (swipe overal)', free: false, plus: false, complete: true, icon: MapPin },
    { id: 'incognito', name: 'Incognito modus', free: false, plus: false, complete: true, icon: EyeOff },
  ]

  const plans = [
    {
      tier: 'FREE',
      name: 'Basis',
      price: 0,
      period: 'Altijd gratis',
      color: 'gray',
      gradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      icon: Heart,
      buttonText: currentPlan === 'FREE' ? 'Huidig plan' : 'Downgrade',
      buttonDisabled: currentPlan === 'FREE',
    },
    {
      tier: 'PLUS',
      name: 'Liefde Plus',
      price: 9.95,
      period: 'per maand',
      color: 'rose',
      gradient: 'from-rose-50 to-pink-100',
      borderColor: 'border-rose-300',
      icon: Sparkles,
      highlighted: true,
      buttonText: currentPlan === 'PLUS' ? 'Huidig plan' : currentPlan === 'FREE' ? 'Upgrade' : 'Downgrade',
      buttonDisabled: currentPlan === 'PLUS',
    },
    {
      tier: 'COMPLETE',
      name: 'Liefde Compleet',
      price: 24.95,
      period: 'voor 3 maanden',
      pricePerMonth: 8.32,
      savings: 'Bespaar €4.89/maand',
      color: 'purple',
      gradient: 'from-purple-50 via-purple-100 to-pink-100',
      borderColor: 'border-purple-400',
      icon: Crown,
      buttonText: currentPlan === 'COMPLETE' ? 'Huidig plan' : 'Upgrade',
      buttonDisabled: currentPlan === 'COMPLETE',
    },
  ]

  const handleSelectPlan = (tier: string) => {
    if (tier === 'FREE' && currentPlan !== 'FREE') {
      // Handle downgrade/cancel
      router.push('/subscription/cancel')
    } else if (tier !== currentPlan) {
      router.push('/prijzen')
    }
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Kies het plan dat bij je past</h2>
        <p className="text-gray-600">Upgrade voor meer features en betere matches</p>
      </div>

      {/* Plans Grid - Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-1/4 pb-4 text-left">
                <div className="text-lg font-semibold text-gray-900">Features</div>
              </th>
              {plans.map((plan) => {
                const Icon = plan.icon
                return (
                  <th key={plan.tier} className="w-1/4 pb-4">
                    <div className={`bg-gradient-to-br ${plan.gradient} border-2 ${plan.borderColor} rounded-2xl p-6 ${
                      plan.highlighted ? 'shadow-xl scale-105' : 'shadow-sm'
                    }`}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Icon className={`w-6 h-6 ${
                          plan.tier === 'COMPLETE' ? 'text-purple-600' :
                          plan.tier === 'PLUS' ? 'text-rose-600' :
                          'text-gray-600'
                        }`} />
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      </div>
                      <div className="mb-4">
                        <div className="text-3xl font-black text-gray-900">
                          {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                        </div>
                        <div className="text-sm text-gray-600">{plan.period}</div>
                        {plan.pricePerMonth && (
                          <div className="text-xs text-gray-500 mt-1">
                            €{plan.pricePerMonth}/maand
                          </div>
                        )}
                        {plan.savings && (
                          <div className="text-xs font-semibold text-green-600 mt-1">
                            {plan.savings}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectPlan(plan.tier)}
                        disabled={plan.buttonDisabled}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          plan.buttonDisabled
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : plan.tier === 'COMPLETE'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                              : plan.tier === 'PLUS'
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg'
                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {plan.buttonText}
                      </button>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <tr key={feature.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{feature.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <FeatureCell value={feature.free} />
                  </td>
                  <td className="py-4 text-center">
                    <FeatureCell value={feature.plus} />
                  </td>
                  <td className="py-4 text-center">
                    <FeatureCell value={feature.complete} highlighted />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Plans Cards - Mobile */}
      <div className="lg:hidden space-y-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${plan.gradient} border-2 ${plan.borderColor} rounded-2xl p-6 ${
                plan.highlighted ? 'shadow-xl' : 'shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-8 h-8 ${
                  plan.tier === 'COMPLETE' ? 'text-purple-600' :
                  plan.tier === 'PLUS' ? 'text-rose-600' :
                  'text-gray-600'
                }`} />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="text-xs font-semibold text-rose-600">Meest populair</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-black text-gray-900">
                  {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                </div>
                <div className="text-sm text-gray-600">{plan.period}</div>
                {plan.pricePerMonth && (
                  <div className="text-xs text-gray-500 mt-1">€{plan.pricePerMonth}/maand</div>
                )}
                {plan.savings && (
                  <div className="text-sm font-semibold text-green-600 mt-2">{plan.savings}</div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                {features.map((feature) => {
                  const value = feature[plan.tier.toLowerCase() as 'free' | 'plus' | 'complete']
                  const Icon = feature.icon
                  return (
                    <div key={feature.id} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature.name}:</span>
                      <span className="text-sm font-semibold text-gray-900 ml-auto">
                        {typeof value === 'boolean' ? (
                          value ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-300" />
                        ) : (
                          value
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => handleSelectPlan(plan.tier)}
                disabled={plan.buttonDisabled}
                className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  plan.buttonDisabled
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.tier === 'COMPLETE'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                      : plan.tier === 'PLUS'
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                {plan.buttonText}
                {!plan.buttonDisabled && <ChevronRight className="w-5 h-5" />}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function FeatureCell({ value, highlighted = false }: { value: boolean | string, highlighted?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`w-6 h-6 inline-block ${highlighted ? 'text-purple-600' : 'text-green-600'}`} />
    ) : (
      <X className="w-6 h-6 inline-block text-gray-300" />
    )
  }

  return (
    <span className={`font-semibold ${highlighted ? 'text-purple-600' : 'text-gray-900'}`}>
      {value}
    </span>
  )
}

export default PlanComparison
