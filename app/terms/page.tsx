/**
 * Terms & Conditions Page
 */

'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { termsContent } from '@/lib/legal-content'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              <span className="text-xl font-semibold">Liefde Voor Iedereen</span>
            </Link>
            <Link href="/" className="text-rose-600 hover:underline font-medium">
              Terug naar home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {termsContent.title}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Ingangsdatum: {termsContent.effectiveDate} | Versie: {termsContent.version}
          </p>

          <div className="prose prose-slate max-w-none">
            <p className="text-gray-700 mb-8">{termsContent.intro}</p>

            {termsContent.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                {section.content && (
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{section.content}</p>
                )}
                {section.items && (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Liefde Voor Iedereen
          </p>
        </div>
      </footer>
    </div>
  )
}
