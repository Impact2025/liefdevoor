'use client'

import Link from 'next/link'
import {
  ChevronRight,
  AlertTriangle,
  Info,
  BookOpen,
  Shield,
  Heart
} from 'lucide-react'
import RedFlagChecklist from '@/components/kennisbank/tools/RedFlagChecklist'

export default function RedFlagChecklistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/kennisbank" className="text-gray-500 hover:text-gray-700">
              Kennisbank
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/kennisbank/tools" className="text-gray-500 hover:text-gray-700">
              Tools
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Red Flag Checklist</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-red-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Red Flag Checklist</h1>
                  <p className="text-amber-100">Herken waarschuwingssignalen</p>
                </div>
              </div>
              <p className="text-amber-50">
                Loop deze checklist door om te bepalen of er waarschuwingssignalen zijn
                bij iemand die je online hebt ontmoet.
              </p>
            </div>

            {/* Tool */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <RedFlagChecklist />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                Over deze checklist
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze interactieve checklist helpt je om mogelijke rode vlaggen te
                identificeren bij iemand die je online datet.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 21 waarschuwingssignalen</li>
                <li>• 5 categorieën</li>
                <li>• Gepersonaliseerd advies</li>
              </ul>
            </div>

            {/* Why Important */}
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Waarom Belangrijk?
              </h3>
              <p className="text-sm text-amber-700">
                Rode vlaggen zijn waarschuwingssignalen die kunnen wijzen op:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                <li>• Romance scams en oplichting</li>
                <li>• Catfishing</li>
                <li>• Manipulatief gedrag</li>
                <li>• Potentieel gevaarlijke situaties</li>
              </ul>
            </div>

            {/* Related Articles */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Gerelateerde Artikelen
              </h3>
              <div className="space-y-2">
                <Link
                  href="/kennisbank/veiligheid/rode-vlaggen-online-daten"
                  className="block text-sm text-rose-600 hover:text-rose-700"
                >
                  Rode Vlaggen bij Online Daten →
                </Link>
                <Link
                  href="/kennisbank/veiligheid/romance-scams-herkennen"
                  className="block text-sm text-rose-600 hover:text-rose-700"
                >
                  Romance Scams Herkennen →
                </Link>
                <Link
                  href="/kennisbank/relaties/gezonde-relatie-kenmerken"
                  className="block text-sm text-rose-600 hover:text-rose-700"
                >
                  Kenmerken Gezonde Relatie →
                </Link>
              </div>
            </div>

            {/* Trust Your Gut */}
            <div className="bg-rose-50 rounded-xl border border-rose-100 p-6">
              <h3 className="font-semibold text-rose-800 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Vertrouw op je Gevoel
              </h3>
              <p className="text-sm text-rose-700">
                Als iets niet goed voelt, is dat vaak met reden. Je intuïtie is een
                krachtig hulpmiddel. Neem de tijd en laat je niet opjagen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
