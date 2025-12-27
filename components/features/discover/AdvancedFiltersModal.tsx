'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Filter,
  MapPin,
  Ruler,
  Cigarette,
  Wine,
  Baby,
  GraduationCap,
  Heart,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Crown,
  Lock,
  Check,
  RotateCcw,
  Dumbbell,
  Users,
  BookOpen,
} from 'lucide-react'
import { Modal, Button } from '@/components/ui'
import { Gender } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface AdvancedFilters {
  // Basic filters
  minAge: number
  maxAge: number
  gender?: Gender
  maxDistance?: number
  city?: string

  // Lifestyle filters
  smoking?: string[]
  drinking?: string[]
  children?: string[]

  // Physical
  minHeight?: number
  maxHeight?: number

  // Background
  education?: string[]
  religion?: string[]
  languages?: string[]
  ethnicity?: string[]

  // Interests
  interests?: string[]
  sports?: string[]

  // Relationship
  relationshipGoal?: string[]

  // Other
  verifiedOnly?: boolean
  withPhotoOnly?: boolean
  onlineRecently?: boolean
}

interface AdvancedFiltersModalProps {
  isOpen: boolean
  onClose: () => void
  filters: AdvancedFilters
  onApply: (filters: AdvancedFilters) => void
  isPremium?: boolean
}

// ============================================
// FILTER OPTIONS DATA
// ============================================

const SMOKING_OPTIONS = [
  { value: 'never', label: 'Rookt niet', emoji: '🚭' },
  { value: 'sometimes', label: 'Rookt soms', emoji: '🌬️' },
  { value: 'regularly', label: 'Rookt regelmatig', emoji: '🚬' },
  { value: 'trying_to_quit', label: 'Probeert te stoppen', emoji: '💪' },
]

const DRINKING_OPTIONS = [
  { value: 'never', label: 'Drinkt niet', emoji: '🚫' },
  { value: 'socially', label: 'Sociaal', emoji: '🥂' },
  { value: 'regularly', label: 'Regelmatig', emoji: '🍷' },
]

const CHILDREN_OPTIONS = [
  { value: 'no', label: 'Geen kinderen', emoji: '👤' },
  { value: 'want_someday', label: 'Wil ooit', emoji: '👶' },
  { value: 'have', label: 'Heeft kinderen', emoji: '👨‍👧' },
  { value: 'dont_want', label: 'Wil geen', emoji: '✋' },
]

const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'Middelbare school', emoji: '🎒' },
  { value: 'mbo', label: 'MBO', emoji: '🔧' },
  { value: 'hbo', label: 'HBO', emoji: '📚' },
  { value: 'university', label: 'Universiteit', emoji: '🎓' },
  { value: 'phd', label: 'Gepromoveerd', emoji: '🧑‍🔬' },
]

const RELIGION_OPTIONS = [
  { value: 'none', label: 'Geen', emoji: '🌐' },
  { value: 'agnostic', label: 'Agnost', emoji: '🤔' },
  { value: 'atheist', label: 'Atheïst', emoji: '🔬' },
  { value: 'christian', label: 'Christelijk', emoji: '✝️' },
  { value: 'muslim', label: 'Islamitisch', emoji: '☪️' },
  { value: 'jewish', label: 'Joods', emoji: '✡️' },
  { value: 'buddhist', label: 'Boeddhistisch', emoji: '☸️' },
  { value: 'hindu', label: 'Hindoe', emoji: '🕉️' },
  { value: 'spiritual', label: 'Spiritueel', emoji: '🙏' },
  { value: 'other', label: 'Anders', emoji: '🌟' },
]

const LANGUAGES_OPTIONS = [
  { value: 'dutch', label: 'Nederlands', emoji: '🇳🇱' },
  { value: 'english', label: 'Engels', emoji: '🇬🇧' },
  { value: 'german', label: 'Duits', emoji: '🇩🇪' },
  { value: 'french', label: 'Frans', emoji: '🇫🇷' },
  { value: 'spanish', label: 'Spaans', emoji: '🇪🇸' },
  { value: 'turkish', label: 'Turks', emoji: '🇹🇷' },
  { value: 'arabic', label: 'Arabisch', emoji: '🇸🇦' },
  { value: 'polish', label: 'Pools', emoji: '🇵🇱' },
  { value: 'italian', label: 'Italiaans', emoji: '🇮🇹' },
  { value: 'portuguese', label: 'Portugees', emoji: '🇵🇹' },
]

const ETHNICITY_OPTIONS = [
  { value: 'european', label: 'Europees', emoji: '🇪🇺' },
  { value: 'mixed', label: 'Gemengd', emoji: '🌍' },
  { value: 'asian', label: 'Aziatisch', emoji: '🌏' },
  { value: 'african', label: 'Afrikaans', emoji: '🌍' },
  { value: 'middle_eastern', label: 'Midden-Oosters', emoji: '🌍' },
  { value: 'latin', label: 'Latijns-Amerikaans', emoji: '🌎' },
  { value: 'caribbean', label: 'Caribisch', emoji: '🏝️' },
]

const INTERESTS_OPTIONS = [
  { value: 'music', label: 'Muziek', emoji: '🎵' },
  { value: 'travel', label: 'Reizen', emoji: '✈️' },
  { value: 'sports', label: 'Sporten', emoji: '⚽' },
  { value: 'cooking', label: 'Koken', emoji: '👨‍🍳' },
  { value: 'reading', label: 'Lezen', emoji: '📖' },
  { value: 'movies', label: 'Films', emoji: '🎬' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'art', label: 'Kunst', emoji: '🎨' },
  { value: 'photography', label: 'Fotografie', emoji: '📷' },
  { value: 'nature', label: 'Natuur', emoji: '🌿' },
  { value: 'dancing', label: 'Dansen', emoji: '💃' },
  { value: 'yoga', label: 'Yoga', emoji: '🧘' },
]

const SPORTS_OPTIONS = [
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'running', label: 'Hardlopen', emoji: '🏃' },
  { value: 'cycling', label: 'Fietsen', emoji: '🚴' },
  { value: 'swimming', label: 'Zwemmen', emoji: '🏊' },
  { value: 'football', label: 'Voetbal', emoji: '⚽' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'basketball', label: 'Basketbal', emoji: '🏀' },
  { value: 'skiing', label: 'Skiën', emoji: '⛷️' },
  { value: 'hiking', label: 'Wandelen', emoji: '🥾' },
  { value: 'martial_arts', label: 'Vechtsporten', emoji: '🥋' },
]

const RELATIONSHIP_GOAL_OPTIONS = [
  { value: 'serious', label: 'Serieuze relatie', emoji: '💕' },
  { value: 'marriage', label: 'Trouwen', emoji: '💍' },
  { value: 'casual', label: 'Casual daten', emoji: '☕' },
  { value: 'open', label: 'Open voor alles', emoji: '🌟' },
]

// ============================================
// CHIP COMPONENT
// ============================================

interface FilterChipProps {
  label: string
  emoji?: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  isPremiumLocked?: boolean
}

function FilterChip({ label, emoji, isSelected, onClick, disabled, isPremiumLocked }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPremiumLocked}
      className={`
        inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
        transition-all duration-200 border-2
        ${isSelected
          ? 'bg-rose-500 text-white border-rose-500'
          : isPremiumLocked
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:bg-rose-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isPremiumLocked && <Lock size={12} className="text-gray-400" />}
      {emoji && !isPremiumLocked && <span>{emoji}</span>}
      <span>{label}</span>
      {isSelected && <Check size={14} />}
    </button>
  )
}

// ============================================
// EXPANDABLE SECTION COMPONENT
// ============================================

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  isPremium?: boolean
  isPremiumLocked?: boolean
  activeCount?: number
}

function FilterSection({
  title,
  icon,
  children,
  defaultExpanded = false,
  isPremium,
  isPremiumLocked,
  activeCount = 0
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{icon}</span>
          <span className="font-semibold text-gray-900">{title}</span>
          {activeCount > 0 && (
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
          {isPremiumLocked && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <Crown size={12} />
              Premium
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1">
              {isPremiumLocked ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center">
                  <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-amber-800 font-medium mb-1">Premium functie</p>
                  <p className="text-amber-600 text-sm">Upgrade om te filteren op {title.toLowerCase()}</p>
                </div>
              ) : (
                children
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AdvancedFiltersModal({
  isOpen,
  onClose,
  filters: initialFilters,
  onApply,
  isPremium = false,
}: AdvancedFiltersModalProps) {
  const [filters, setFilters] = useState<AdvancedFilters>(initialFilters)

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters)
    }
  }, [isOpen, initialFilters])

  const toggleArrayFilter = (key: keyof AdvancedFilters, value: string) => {
    setFilters(prev => {
      const current = (prev[key] as string[]) || []
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [key]: newValues }
    })
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      minAge: 18,
      maxAge: 99,
    })
  }

  // Count active filters
  const countActiveFilters = () => {
    let count = 0
    if (filters.minAge !== 18 || filters.maxAge !== 99) count++
    if (filters.gender) count++
    if (filters.maxDistance) count++
    if (filters.smoking?.length) count += filters.smoking.length
    if (filters.drinking?.length) count += filters.drinking.length
    if (filters.children?.length) count += filters.children.length
    if (filters.education?.length) count += filters.education.length
    if (filters.religion?.length) count += filters.religion.length
    if (filters.languages?.length) count += filters.languages.length
    if (filters.ethnicity?.length) count += filters.ethnicity.length
    if (filters.interests?.length) count += filters.interests.length
    if (filters.sports?.length) count += filters.sports.length
    if (filters.relationshipGoal?.length) count += filters.relationshipGoal.length
    if (filters.minHeight || filters.maxHeight) count++
    if (filters.verifiedOnly) count++
    if (filters.onlineRecently) count++
    return count
  }

  const activeFilterCount = countActiveFilters()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Filter className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Geavanceerde filters</h2>
              <p className="text-sm text-gray-500">
                {activeFilterCount > 0 ? `${activeFilterCount} filters actief` : 'Pas je zoekopdracht aan'}
              </p>
            </div>
          </div>
          {!isPremium && (
            <a
              href="/prijzen"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold rounded-full hover:from-amber-500 hover:to-orange-600 transition-all"
            >
              <Crown size={14} />
              Unlock alles
            </a>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Basic Filters - Always visible */}
          <FilterSection
            title="Basis"
            icon={<Users size={20} />}
            defaultExpanded={true}
            activeCount={
              (filters.minAge !== 18 || filters.maxAge !== 99 ? 1 : 0) +
              (filters.gender ? 1 : 0) +
              (filters.maxDistance ? 1 : 0)
            }
          >
            {/* Age Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Leeftijd: {filters.minAge} - {filters.maxAge} jaar
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={filters.minAge}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    minAge: Math.min(parseInt(e.target.value), prev.maxAge - 1)
                  }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <span className="text-sm text-gray-500 w-8">{filters.minAge}</span>
                <span className="text-gray-400">-</span>
                <span className="text-sm text-gray-500 w-8">{filters.maxAge}</span>
                <input
                  type="range"
                  min="18"
                  max="99"
                  value={filters.maxAge}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxAge: Math.max(parseInt(e.target.value), prev.minAge + 1)
                  }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Ik zoek</label>
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="Iedereen"
                  emoji="👥"
                  isSelected={!filters.gender}
                  onClick={() => setFilters(prev => ({ ...prev, gender: undefined }))}
                />
                <FilterChip
                  label="Mannen"
                  emoji="👨"
                  isSelected={filters.gender === Gender.MALE}
                  onClick={() => setFilters(prev => ({ ...prev, gender: Gender.MALE }))}
                />
                <FilterChip
                  label="Vrouwen"
                  emoji="👩"
                  isSelected={filters.gender === Gender.FEMALE}
                  onClick={() => setFilters(prev => ({ ...prev, gender: Gender.FEMALE }))}
                />
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Maximale afstand: {filters.maxDistance || 'Geen limiet'}
                {filters.maxDistance && ' km'}
              </label>
              <div className="flex flex-wrap gap-2">
                {[null, 10, 25, 50, 100, 200].map((distance) => (
                  <FilterChip
                    key={distance ?? 'none'}
                    label={distance ? `${distance} km` : 'Geen limiet'}
                    isSelected={filters.maxDistance === distance}
                    onClick={() => setFilters(prev => ({ ...prev, maxDistance: distance ?? undefined }))}
                  />
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Lifestyle */}
          <FilterSection
            title="Levensstijl"
            icon={<Heart size={20} />}
            activeCount={
              (filters.smoking?.length || 0) +
              (filters.drinking?.length || 0) +
              (filters.children?.length || 0)
            }
          >
            {/* Smoking */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Roken</label>
              <div className="flex flex-wrap gap-2">
                {SMOKING_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    emoji={option.emoji}
                    isSelected={filters.smoking?.includes(option.value) || false}
                    onClick={() => toggleArrayFilter('smoking', option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Drinking */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Alcohol</label>
              <div className="flex flex-wrap gap-2">
                {DRINKING_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    emoji={option.emoji}
                    isSelected={filters.drinking?.includes(option.value) || false}
                    onClick={() => toggleArrayFilter('drinking', option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Kinderen</label>
              <div className="flex flex-wrap gap-2">
                {CHILDREN_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    emoji={option.emoji}
                    isSelected={filters.children?.includes(option.value) || false}
                    onClick={() => toggleArrayFilter('children', option.value)}
                  />
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Physical - Height */}
          <FilterSection
            title="Lengte"
            icon={<Ruler size={20} />}
            activeCount={(filters.minHeight || filters.maxHeight) ? 1 : 0}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimale lengte: {filters.minHeight || 140} cm
                </label>
                <input
                  type="range"
                  min="140"
                  max="220"
                  value={filters.minHeight || 140}
                  onChange={(e) => setFilters(prev => ({ ...prev, minHeight: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximale lengte: {filters.maxHeight || 220} cm
                </label>
                <input
                  type="range"
                  min="140"
                  max="220"
                  value={filters.maxHeight || 220}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxHeight: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </FilterSection>

          {/* Education - Premium */}
          <FilterSection
            title="Opleidingsniveau"
            icon={<GraduationCap size={20} />}
            isPremiumLocked={!isPremium}
            activeCount={filters.education?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {EDUCATION_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={filters.education?.includes(option.value) || false}
                  onClick={() => toggleArrayFilter('education', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Religion - Premium */}
          <FilterSection
            title="Geloof"
            icon={<BookOpen size={20} />}
            isPremiumLocked={!isPremium}
            activeCount={filters.religion?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {RELIGION_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={filters.religion?.includes(option.value) || false}
                  onClick={() => toggleArrayFilter('religion', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Languages - Premium */}
          <FilterSection
            title="Taal"
            icon={<Globe size={20} />}
            isPremiumLocked={!isPremium}
            activeCount={filters.languages?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={filters.languages?.includes(option.value) || false}
                  onClick={() => toggleArrayFilter('languages', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Ethnicity - Premium */}
          <FilterSection
            title="Afkomst"
            icon={<MapPin size={20} />}
            isPremiumLocked={!isPremium}
            activeCount={filters.ethnicity?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {ETHNICITY_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={filters.ethnicity?.includes(option.value) || false}
                  onClick={() => toggleArrayFilter('ethnicity', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Interests */}
          <FilterSection
            title="Hobby's"
            icon={<Sparkles size={20} />}
            activeCount={filters.interests?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={filters.interests?.includes(option.value) || false}
                  onClick={() => toggleArrayFilter('interests', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Sports */}
          <FilterSection
            title="Sporten"
            icon={<Dumbbell size={20} />}
            activeCount={filters.sports?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {SPORTS_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={filters.sports?.includes(option.value) || false}
                  onClick={() => toggleArrayFilter('sports', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Relationship Goals */}
          <FilterSection
            title="Relatie doel"
            icon={<Heart size={20} />}
            activeCount={filters.relationshipGoal?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_GOAL_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  emoji={option.emoji}
                  isSelected={filters.relationshipGoal?.includes(option.value) || false}
                  onClick={() => toggleArrayFilter('relationshipGoal', option.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Extra Toggles */}
          <FilterSection
            title="Extra opties"
            icon={<Check size={20} />}
            activeCount={
              (filters.verifiedOnly ? 1 : 0) +
              (filters.onlineRecently ? 1 : 0)
            }
          >
            <div className="space-y-3">
              {/* Verified Only */}
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <span className="font-medium text-gray-900">Alleen geverifieerd</span>
                    <p className="text-sm text-gray-500">Toon alleen geverifieerde profielen</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
              </label>

              {/* Online Recently */}
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🟢</span>
                  <div>
                    <span className="font-medium text-gray-900">Recent online</span>
                    <p className="text-sm text-gray-500">Actief in de laatste 24 uur</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.onlineRecently || false}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlineRecently: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
              </label>
            </div>
          </FilterSection>
        </div>

        {/* Footer with actions */}
        <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <Filter size={16} />
            Toon resultaten
            {activeFilterCount > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AdvancedFiltersModal
