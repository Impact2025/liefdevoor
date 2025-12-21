/**
 * LocationPrivacy Component
 *
 * Privacy notice for location features
 * Explains how location data is used and displayed
 */

'use client'

import { Lock, Shield, MapPin, Eye } from 'lucide-react'

interface LocationPrivacyProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function LocationPrivacy({ variant = 'default', className = '' }: LocationPrivacyProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-2 p-3 bg-blue-50 rounded-lg ${className}`}>
        <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          We tonen alleen je regio aan anderen, niet je exacte locatie.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-gray-900">Jouw Privacy</h3>
      </div>

      <div className="space-y-3">
        <PrivacyPoint
          icon={<MapPin size={18} />}
          title="Regio, niet exact adres"
          description="We tonen alleen je stad/regio, niet je precieze locatie"
        />

        <PrivacyPoint
          icon={<Eye size={18} />}
          title="Afgeronde afstanden"
          description="Anderen zien alleen '~5 km afstand', niet exact"
        />

        <PrivacyPoint
          icon={<Lock size={18} />}
          title="Veilig opgeslagen"
          description="Je locatiegegevens worden versleuteld opgeslagen"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-xs text-blue-700">
          💡 Je locatie helpt om matches in je buurt te vinden. Je kunt dit altijd wijzigen in je instellingen.
        </p>
      </div>
    </div>
  )
}

function PrivacyPoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div>
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}
