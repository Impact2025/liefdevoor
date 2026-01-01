'use client'

import Link from 'next/link'
import {
  ChevronRight,
  Shield,
  Info,
  AlertTriangle,
  BookOpen,
  Phone,
  ExternalLink
} from 'lucide-react'
import ScamChecker from '@/components/kennisbank/tools/ScamChecker'

export default function ScamCheckerPage() {
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
            <span className="text-gray-900 font-medium">Scam Checker</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Scam Checker</h1>
                  <p className="text-red-100">Bescherm jezelf tegen romance scams</p>
                </div>
              </div>
              <p className="text-red-50">
                Plak een verdacht bericht en onze AI analyseert het op rode vlaggen die vaak voorkomen bij dating oplichting.
              </p>
            </div>

            {/* Tool */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <ScamChecker />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-red-600" />
                Over deze tool
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                De Scam Checker analyseert berichten op patronen die vaak voorkomen bij romance scams en catfishing.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 50+ scam patronen</li>
                <li>• Direct resultaat</li>
                <li>• Anonieme analyse</li>
                <li>• Praktisch advies</li>
              </ul>
            </div>

            {/* Warning Signs */}
            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Rode Vlaggen
              </h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• Vraagt om geld of gift cards</li>
                <li>• Wil snel van platform af</li>
                <li>• Te snelle liefdesverklaringen</li>
                <li>• Zegt in het leger/offshore te werken</li>
                <li>• Noodsituatie met geld nodig</li>
                <li>• Crypto/investering tips</li>
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
                  href="/kennisbank/veiligheid/romance-scams-herkennen"
                  className="block text-sm text-rose-600 hover:text-rose-700"
                >
                  Romance Scams Herkennen →
                </Link>
                <Link
                  href="/kennisbank/veiligheid/catfishing-herkennen"
                  className="block text-sm text-rose-600 hover:text-rose-700"
                >
                  Catfishing Herkennen →
                </Link>
                <Link
                  href="/kennisbank/veiligheid/veilig-online-daten"
                  className="block text-sm text-rose-600 hover:text-rose-700"
                >
                  Veilig Online Daten →
                </Link>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Al Slachtoffer?
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                Heb je al geld overgemaakt? Neem direct contact op met de Fraudehelpdesk.
              </p>
              <a
                href="https://www.fraudehelpdesk.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-amber-800"
              >
                088-786 73 72
              </a>
              <a
                href="https://www.fraudehelpdesk.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-amber-700 mt-2 hover:text-amber-800"
              >
                fraudehelpdesk.nl
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
