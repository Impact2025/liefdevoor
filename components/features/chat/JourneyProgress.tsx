'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Mic,
  Calendar,
  Loader2,
} from 'lucide-react'

interface JourneyProgressProps {
  matchId: string
  partnerName: string
  compact?: boolean
}

interface Milestone {
  key: string
  label: string
  achieved: boolean
  achievedAt?: string
  bonus: number
}

interface JourneyData {
  currentScore: number
  initialScore: number
  growth: number
  growthPercentage: number
  milestones: Milestone[]
  nextMilestone?: {
    key: string
    label: string
    bonus: number
    progress?: number
  }
}

// Icon mapping for milestones
const MILESTONE_ICONS: Record<string, typeof Heart> = {
  first_message: MessageCircle,
  messages_10: MessageCircle,
  messages_50: MessageCircle,
  messages_100: MessageCircle,
  voice_note_sent: Mic,
  voice_note_received: Mic,
  vibe_check_started: Sparkles,
  vibe_check_completed: Sparkles,
  both_want_date: Heart,
  date_planned: Calendar,
  date_confirmed: Calendar,
  active_7_days: TrendingUp,
  active_30_days: TrendingUp,
}

export default function JourneyProgress({ matchId, partnerName, compact = false }: JourneyProgressProps) {
  const [data, setData] = useState<JourneyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/journey`)
        if (res.ok) {
          const journeyData = await res.json()
          setData(journeyData)
        }
      } catch (error) {
        console.error('Error fetching journey progress:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgress()
    // Poll every 60 seconds
    const interval = setInterval(fetchProgress, 60000)
    return () => clearInterval(interval)
  }, [matchId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const achievedMilestones = data.milestones.filter((m) => m.achieved)
  const upcomingMilestones = data.milestones.filter((m) => !m.achieved).slice(0, 3)

  // Compact view for header
  if (compact) {
    return (
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-full px-3 py-1.5 border border-rose-100"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {Math.round(data.currentScore)}
          </div>
          {data.growth > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
            >
              <TrendingUp className="w-2.5 h-2.5 text-white" />
            </motion.div>
          )}
        </div>
        <div className="text-left">
          <span className="text-xs font-medium text-slate-700 block">Match Score</span>
          {data.growth > 0 && (
            <span className="text-xs text-green-600">+{data.growth}%</span>
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">{Math.round(data.currentScore)}</span>
            </div>
            <div>
              <h3 className="font-semibold">Jullie Journey</h3>
              <p className="text-sm text-white/80">
                Met {partnerName}
              </p>
            </div>
          </div>
          {data.growth > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{data.growth}%</span>
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Start: {data.initialScore}%</span>
            <span>Nu: {data.currentScore}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: `${data.initialScore}%` }}
              animate={{ width: `${data.currentScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Next milestone */}
      {data.nextMilestone && (
        <div className="p-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Volgende milestone</p>
              <p className="text-xs text-amber-600">{data.nextMilestone.label} (+{data.nextMilestone.bonus}%)</p>
            </div>
            {data.nextMilestone.progress !== undefined && (
              <div className="w-16">
                <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${data.nextMilestone.progress}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 text-right mt-0.5">
                  {Math.round(data.nextMilestone.progress)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestones toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-sm text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          {achievedMilestones.length} milestones behaald
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Expandable milestones list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              {/* Achieved milestones */}
              {achievedMilestones.map((milestone, index) => {
                const Icon = MILESTONE_ICONS[milestone.key] || CheckCircle2
                return (
                  <motion.div
                    key={milestone.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-green-50 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">{milestone.label}</p>
                      <p className="text-xs text-green-600">+{milestone.bonus}% bonus</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </motion.div>
                )
              })}

              {/* Upcoming milestones */}
              {upcomingMilestones.length > 0 && (
                <>
                  <p className="text-xs text-slate-400 pt-2">Nog te behalen</p>
                  {upcomingMilestones.map((milestone) => {
                    const Icon = MILESTONE_ICONS[milestone.key] || Circle
                    return (
                      <div
                        key={milestone.key}
                        className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl opacity-60"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-600">{milestone.label}</p>
                          <p className="text-xs text-slate-400">+{milestone.bonus}% bonus</p>
                        </div>
                        <Circle className="w-5 h-5 text-slate-300" />
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
