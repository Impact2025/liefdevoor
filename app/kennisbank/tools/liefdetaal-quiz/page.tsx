'use client'

import Link from 'next/link'
import {
  ChevronRight,
  Heart,
  Info,
  ExternalLink,
  BookOpen
} from 'lucide-react'
import LoveLanguageQuiz from '@/components/kennisbank/tools/LoveLanguageQuiz'

export default function LoveLanguageQuizPage() {
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
            <span className="text-gray-900 font-medium">Liefdetaal Quiz</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Liefdetaal Quiz</h1>
                  <p className="text-rose-100">Ontdek hoe jij liefde geeft en ontvangt</p>
                </div>
              </div>
              <p className="text-rose-50">
                Gebaseerd op het werk van Dr. Gary Chapman. Ontdek welke van de 5
                liefdetalen het meest bij jou past.
              </p>
            </div>

            {/* Quiz */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <LoveLanguageQuiz />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-rose-600" />
                Over deze quiz
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                De 5 Liefdetalen is een concept van Dr. Gary Chapman. Iedereen heeft
                een primaire manier waarop ze liefde ervaren en uiten.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 12 vragen</li>
                <li>• ~3 minuten</li>
                <li>• Direct resultaat</li>
              </ul>
            </div>

            {/* The 5 Languages */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">De 5 Liefdetalen</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-gray-700">Bevestigende Woorden</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-700">Hulpvaardigheid</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-700">Cadeaus Ontvangen</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-gray-700">Quality Time</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-gray-700">Fysieke Aanraking</span>
                </li>
              </ul>
            </div>

            {/* Related Article */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Gerelateerd Artikel
              </h3>
              <Link
                href="/kennisbank/communicatie/liefdetalen-relatie"
                className="block text-sm text-rose-600 hover:text-rose-700"
              >
                Liefdetalen in je Relatie: Praktische Tips →
              </Link>
            </div>

            {/* DatingAssistent Promo */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-2">Uitgebreidere Analyse?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Onze partner DatingAssistent.nl biedt een uitgebreidere quiz met
                persoonlijk advies.
              </p>
              <a
                href="https://datingassistent.nl/liefdetaal?ref=lvi"
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
