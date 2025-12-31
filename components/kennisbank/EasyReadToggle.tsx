'use client'

import { Accessibility, Check } from 'lucide-react'

interface EasyReadToggleProps {
  hasEasyRead: boolean
  isActive: boolean
  onToggle: (active: boolean) => void
  className?: string
}

export default function EasyReadToggle({
  hasEasyRead,
  isActive,
  onToggle,
  className = ''
}: EasyReadToggleProps) {
  if (!hasEasyRead) return null

  return (
    <div className={`flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Accessibility className="w-5 h-5 text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-blue-900">Makkelijk Lezen</p>
        <p className="text-sm text-blue-700">
          Kortere zinnen en eenvoudige woorden
        </p>
      </div>

      <button
        onClick={() => onToggle(!isActive)}
        role="switch"
        aria-checked={isActive}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isActive ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span className="sr-only">Makkelijk lezen aan/uit</span>
        <span
          className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          {isActive && <Check className="w-3 h-3 text-blue-600" />}
        </span>
      </button>
    </div>
  )
}
