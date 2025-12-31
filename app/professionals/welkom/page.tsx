'use client'

import Link from 'next/link'
import {
  CheckCircle,
  Mail,
  ArrowRight,
  BookOpen,
  Settings,
  Users,
  FileText
} from 'lucide-react'

const nextSteps = [
  {
    icon: Mail,
    title: 'Bevestig je e-mail',
    description: 'Klik op de link in de e-mail die we je hebben gestuurd.',
    action: 'Opnieuw versturen',
    href: '#',
  },
  {
    icon: FileText,
    title: 'Verificatie',
    description: 'Voeg je BIG-registratie of andere credentials toe voor volledige toegang.',
    action: 'Verificatie starten',
    href: '/professionals/dashboard/verificatie',
  },
  {
    icon: BookOpen,
    title: 'Ontdek de kennisbank',
    description: 'Bekijk onze 800+ artikelen over veilig daten.',
    action: 'Naar kennisbank',
    href: '/kennisbank',
  },
  {
    icon: Settings,
    title: 'Instellingen',
    description: 'Pas je profiel en notificaties aan.',
    action: 'Naar instellingen',
    href: '/professionals/dashboard/instellingen',
  },
]

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>

        {/* Welcome Message */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Welkom bij het Professional Portal!
        </h1>
        <p className="text-xl text-white/80 mb-12">
          Je account is succesvol aangemaakt. Je kunt nu beginnen met het verkennen
          van onze kennisbank.
        </p>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Volgende stappen
          </h2>

          <div className="space-y-4">
            {nextSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-indigo-600 font-medium">
                      Stap {index + 1}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {step.description}
                  </p>
                </div>
                <Link
                  href={step.href}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 flex-shrink-0"
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4">
            <Link
              href="/professionals/dashboard"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Naar Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/kennisbank"
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Kennisbank Verkennen
            </Link>
          </div>
        </div>

        {/* Help Note */}
        <p className="text-white/60 text-sm mt-8">
          Vragen? Neem contact op via{' '}
          <a href="mailto:professionals@liefdevooridereen.nl" className="text-white hover:underline">
            professionals@liefdevooridereen.nl
          </a>
        </p>
      </div>
    </div>
  )
}
