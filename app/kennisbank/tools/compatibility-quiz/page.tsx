'use client'

import Link from 'next/link'
import {
  ChevronRight,
  Users,
  Info,
  ExternalLink,
  BookOpen,
  Heart,
  MessageCircle,
  Home,
  Compass
} from 'lucide-react'
import CompatibilityQuiz from '@/components/kennisbank/tools/CompatibilityQuiz'

export default function CompatibilityQuizPage() {
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
            <span className="text-gray-900 font-medium">Compatibility Quiz</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Compatibility Quiz</h1>
                  <p className="text-purple-100">Ontdek jouw relatieprofiel</p>
                </div>
              </div>
              <p className="text-purple-50">
                Leer jezelf beter kennen en ontdek wat je zoekt in een relatie.
                Dit helpt je bewuster te daten.
              </p>
            </div>

            {/* Quiz */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <CompatibilityQuiz />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600" />
                Over deze quiz
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze quiz analyseert vijf belangrijke relatiedimensies om te
                bepalen wat voor type partner het beste bij je past.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 13 vragen</li>
                <li>• ~5 minuten</li>
                <li>• Direct resultaat</li>
              </ul>
            </div>

            {/* Dimensions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">De 5 Dimensies</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700">Communicatie</span>
                </li>
                <li className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Levensstijl</span>
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-gray-700">Waarden</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700">Intimiteit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-500" />
                  <span className="text-gray-700">Toekomstplannen</span>
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
                  href="/kennisbank/relaties/verwachtingen-relatie"
                  className="block text-sm text-purple-600 hover:text-purple-700"
                >
                  Verwachtingen in een Relatie →
                </Link>
                <Link
                  href="/kennisbank/communicatie/liefdetalen-relatie"
                  className="block text-sm text-purple-600 hover:text-purple-700"
                >
                  Liefdetalen in je Relatie →
                </Link>
              </div>
            </div>

            {/* DatingAssistent Promo */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-2">Match Analyse?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Onze partner DatingAssistent.nl biedt een uitgebreide
                compatibiliteitsanalyse met je potentiële matches.
              </p>
              <a
                href="https://datingassistent.nl/compatibility?ref=lvi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Naar DatingAssistent.nl
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
