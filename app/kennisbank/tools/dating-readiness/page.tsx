'use client'

import Link from 'next/link'
import {
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink,
  BookOpen,
  Heart,
  Shield,
  Brain,
  Clock
} from 'lucide-react'
import DatingReadinessQuiz from '@/components/kennisbank/tools/DatingReadinessQuiz'

export default function DatingReadinessPage() {
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
            <span className="text-gray-900 font-medium">Dating Readiness Quiz</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Ben Jij Klaar om te Daten?</h1>
                  <p className="text-amber-100">Ontdek je dating readiness</p>
                </div>
              </div>
              <p className="text-amber-50">
                Niet iedereen is op elk moment klaar voor daten. Deze quiz helpt je
                te bepalen of dit het juiste moment is.
              </p>
            </div>

            {/* Quiz */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <DatingReadinessQuiz />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                Over deze quiz
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze quiz analyseert vier belangrijke aspecten van je dating readiness:
                emotioneel, praktisch, mindset en timing.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 12 vragen</li>
                <li>• ~4 minuten</li>
                <li>• Direct resultaat met advies</li>
              </ul>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Wat We Meten</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-rose-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Emotionele Gereedheid</span>
                    <p className="text-gray-500 text-xs">Verwerking, zelfbeeld, grenzen</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Praktische Gereedheid</span>
                    <p className="text-gray-500 text-xs">Tijd, financiën, sociaal leven</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Mindset</span>
                    <p className="text-gray-500 text-xs">Motivatie, verwachtingen</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">Timing</span>
                    <p className="text-gray-500 text-xs">Levensomstandigheden</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Related Article */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Gerelateerde Artikelen
              </h3>
              <div className="space-y-2">
                <Link
                  href="/kennisbank/veiligheid/eerste-date-tips"
                  className="block text-sm text-amber-600 hover:text-amber-700"
                >
                  Tips voor je Eerste Date →
                </Link>
                <Link
                  href="/kennisbank/communicatie/online-gesprek-starten"
                  className="block text-sm text-amber-600 hover:text-amber-700"
                >
                  Online Gesprek Starten →
                </Link>
              </div>
            </div>

            {/* Not Ready Yet? */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">Nog Niet Klaar?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Geen zorgen! Het is beter om te wachten tot je echt klaar bent.
                Lees onze artikelen over zelfzorg en persoonlijke groei.
              </p>
              <Link
                href="/kennisbank/relaties"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Bekijk Relatie Tips
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
