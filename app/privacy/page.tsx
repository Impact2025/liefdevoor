/**
 * Privacy Policy Page
 * Complete AVG-compliant privacy policy for Liefde Voor Iedereen
 */

'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { privacyPolicyContent } from '@/lib/legal-content'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              <span className="text-xl font-semibold text-gray-900">
                Liefde Voor Iedereen
              </span>
            </Link>
            <Link href="/" className="text-rose-600 hover:underline font-medium">
              Terug naar home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {privacyPolicyContent.title}
            </h1>
            <p className="text-sm text-gray-500">
              Ingangsdatum: {privacyPolicyContent.effectiveDate} | Versie:{' '}
              {privacyPolicyContent.version} (GDPR compliant)
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            {privacyPolicyContent.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                  {section.content}
                </p>

                {/* Subsections */}
                {section.subsections?.map((sub, subIndex) => (
                  <div key={subIndex} className="ml-4 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {sub.title}
                    </h3>
                    {sub.content && (
                      <p className="text-gray-700 mb-2">{sub.content}</p>
                    )}
                    {sub.items && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {sub.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Items list */}
                {section.items && (
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                )}

                {/* Table */}
                {section.table && (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          {section.table.headers.map((header, i) => (
                            <th
                              key={i}
                              className="border border-gray-300 px-4 py-2 text-left font-semibold"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="even:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border border-gray-300 px-4 py-2"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Note */}
                {section.note && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                    <p className="text-sm text-blue-900">{section.note}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Contact */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700">
                Voor vragen over deze privacy policy of om uw rechten uit te oefenen:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700">
                <li>
                  <strong>E-mail:</strong> privacy@liefdevooriederen.nl
                </li>
                <li>
                  <strong>Privacy instellingen:</strong>{' '}
                  <Link href="/settings/privacy" className="text-rose-600 hover:underline">
                    Ga naar Privacy Instellingen
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Liefde Voor Iedereen. Alle rechten voorbehouden.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <Link href="/cookies" className="text-gray-400 hover:text-white">
              Cookieverklaring
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Algemene voorwaarden
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
