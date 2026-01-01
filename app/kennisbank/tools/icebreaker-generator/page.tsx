'use client'

import Link from 'next/link'
import {
  ChevronRight,
  MessageSquare,
  Info,
  BookOpen,
  ExternalLink,
  Lightbulb
} from 'lucide-react'
import IcebreakerGenerator from '@/components/kennisbank/tools/IcebreakerGenerator'

export default function IcebreakerGeneratorPage() {
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
            <span className="text-gray-900 font-medium">Openingszin Generator</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Openingszin Generator</h1>
                  <p className="text-blue-100">Breek het ijs met originele berichten</p>
                </div>
              </div>
              <p className="text-blue-50">
                Krijg gepersonaliseerde openingszinnen op basis van iemands interesses
                en de toon die je wilt aanslaan.
              </p>
            </div>

            {/* Tool */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <IcebreakerGenerator />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Over deze tool
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Deze generator helpt je om creatieve openingszinnen te bedenken
                die inspelen op de interesses van de persoon die je wilt aanschrijven.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 9 interessegebieden</li>
                <li>• 4 verschillende tonen</li>
                <li>• 100+ unieke berichten</li>
              </ul>
            </div>

            {/* Do's and Don'ts */}
            <div className="bg-green-50 rounded-xl border border-green-100 p-6">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Wat Wel Werkt
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>✓ Personaliseer naar hun profiel</li>
                <li>✓ Stel een open vraag</li>
                <li>✓ Toon oprechte interesse</li>
                <li>✓ Wees uniek en origineel</li>
                <li>✓ Houd het kort en bondig</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
              <h3 className="font-semibold text-red-800 mb-3">Wat Niet Werkt</h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li>✗ Alleen "Hey" of "Hi"</li>
                <li>✗ Copy-paste aan iedereen</li>
                <li>✗ Te seksueel van start</li>
                <li>✗ Ellenlange berichten</li>
                <li>✗ Negatief over jezelf</li>
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
                  href="/kennisbank/communicatie/online-gesprek-starten"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  Online Gesprek Starten →
                </Link>
                <Link
                  href="/kennisbank/communicatie/gesprek-gaande-houden"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  Gesprek Gaande Houden →
                </Link>
                <Link
                  href="/kennisbank/communicatie/van-chat-naar-date"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  Van Chat naar Date →
                </Link>
              </div>
            </div>

            {/* DatingAssistent Promo */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-2">AI Bericht Verbeteren?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Onze partner DatingAssistent.nl kan je berichten analyseren en
                verbeteren met AI.
              </p>
              <a
                href="https://datingassistent.nl/bericht-helper?ref=lvi"
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
