/**
 * Cookie Policy Page
 */

'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cookiePolicyContent } from '@/lib/legal-content'

export default function CookiesPage() {
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
            {cookiePolicyContent.title}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Laatst gewijzigd: {cookiePolicyContent.lastModified}
          </p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold mb-4">{cookiePolicyContent.intro.title}</h2>
            <p className="text-gray-700 mb-8">{cookiePolicyContent.intro.content}</p>

            <h2 className="text-2xl font-bold mb-4">2. Welke cookies wij gebruiken</h2>
            {cookiePolicyContent.categories.map((category, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-700 mb-4">{category.description}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Naam</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Aanbieder</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Doel</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Bewaartermijn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.cookies.map((cookie, i) => (
                        <tr key={i} className="even:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                            {cookie.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{cookie.provider}</td>
                          <td className="border border-gray-300 px-4 py-2">{cookie.purpose}</td>
                          <td className="border border-gray-300 px-4 py-2">{cookie.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <h2 className="text-2xl font-bold mb-4">{cookiePolicyContent.management.title}</h2>
            <p className="text-gray-700 mb-4">{cookiePolicyContent.management.content}</p>

            <div className="bg-stone-50 border-l-4 border-rose-500 p-4 my-6">
              <p className="text-sm text-rose-900">
                <strong>Uw voorkeuren wijzigen?</strong> Ga naar{' '}
                <Link href="/settings/privacy" className="underline font-semibold">
                  Privacy Instellingen
                </Link>{' '}
                om uw cookie voorkeuren aan te passen.
              </p>
            </div>
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
