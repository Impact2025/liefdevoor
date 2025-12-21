/**
 * Incognito Toggle - Browse anonymously
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EyeOff, Crown, Shield, Check } from 'lucide-react'

interface IncognitoToggleProps {
  className?: string
}

export function IncognitoToggle({ className = '' }: IncognitoToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [hasFeature, setHasFeature] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    fetchIncognitoStatus()
  }, [])

  const fetchIncognitoStatus = async () => {
    try {
      const res = await fetch('/api/incognito')
      const data = await res.json()
      if (res.ok) {
        setIsEnabled(data.isEnabled)
        setHasFeature(data.hasFeature)
      }
    } catch (error) {
      console.error('Error fetching incognito status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async () => {
    if (!hasFeature || isToggling) return

    setIsToggling(true)
    try {
      const res = await fetch('/api/incognito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isEnabled }),
      })

      if (res.ok) {
        const data = await res.json()
        setIsEnabled(data.isEnabled)
      }
    } catch (error) {
      console.error('Error toggling incognito:', error)
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-2xl p-4 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isEnabled ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <EyeOff className={`w-5 h-5 ${isEnabled ? 'text-purple-600' : 'text-gray-500'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Incognito Mode</h3>
            <p className="text-sm text-gray-500">
              {isEnabled ? 'Je bent onzichtbaar' : 'Browse anoniem'}
            </p>
          </div>
        </div>

        {hasFeature ? (
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isEnabled ? 'bg-purple-500' : 'bg-gray-300'
            } ${isToggling ? 'opacity-50' : ''}`}
          >
            <motion.div
              animate={{ x: isEnabled ? 24 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
            />
          </button>
        ) : (
          <a
            href="/prijzen"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-medium rounded-full"
          >
            <Crown size={14} />
            Upgrade
          </a>
        )}
      </div>

      {/* Benefits */}
      {hasFeature && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield size={14} className="text-purple-500" />
            <span>Je profiel verschijnt niet in Discover</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Check size={14} className="text-purple-500" />
            <span>Alleen mensen die jij liket kunnen je zien</span>
          </div>
        </div>
      )}

      {!hasFeature && (
        <p className="mt-3 text-sm text-gray-500">
          Incognito Mode is beschikbaar met Liefde Compleet
        </p>
      )}
    </div>
  )
}

export default IncognitoToggle
