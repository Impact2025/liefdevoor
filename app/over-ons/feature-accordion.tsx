'use client'

import { useState } from 'react'
import { Shield, Search, Users, Bot, ChevronDown, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Shield,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Je bent hier veilig',
    description: 'Elke dag controleren we alle profielen. Onze computer (AI) herkent nep-profielen. Vincent heeft in 15 jaar meer dan 10.000 oplichters geblokkeerd.',
    bullets: [
      'Elke foto wordt gecontroleerd binnen 24 uur',
      'Verdacht bericht? Klik op HELP - we helpen binnen 30 minuten',
      'Al 347 oplichters geblokkeerd sinds januari 2026'
    ],
    link: {
      text: 'Lees hoe we je beschermen tegen oplichting',
      href: '/veiligheid'
    }
  },
  {
    icon: Search,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    title: 'Geen spelletjes, geen gedoe',
    description: 'Wij geloven niet in spelletjes spelen. Geen trucjes. Geen betalen om berichten te lezen.',
    bullets: [
      'Echte mensen die een relatie zoeken',
      'Geen tijdslimiet op berichten',
      'Geen verstopte kosten'
    ],
    highlight: '2 maanden gratis Premium = alle functies gratis proberen'
  },
  {
    icon: Users,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Voor iedereen',
    description: 'Voor wie is deze site? Voor iedereen die een relatie zoekt.',
    bullets: [
      'Ook voor mensen met een beperking',
      'Ook voor ouderen',
      'Ook voor jongeren',
      'Ook voor mensen die het moeilijk vinden om nieuwe mensen te ontmoeten'
    ],
    footer: 'Iedereen is welkom. We respecteren elkaar. Je mag zijn wie je bent.'
  },
  {
    icon: Bot,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Slimme hulp bij daten',
    description: 'Daten kan spannend zijn. Wij helpen je.',
    subTitle: 'Onze AI DatingAssistent helpt je met:',
    bullets: [
      'Een goed profiel maken',
      'Leuke berichten sturen',
      'Gespreksonderwerpen vinden'
    ],
    footer: 'Je bepaalt zelf wat je wilt. De assistent geeft alleen tips. Jij blijft de baas.',
    link: {
      text: 'Zo werkt de AI DatingAssistent',
      href: '/features/ai-assistent'
    }
  }
]

export function FeatureAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-4">
      {features.map((feature, index) => {
        const Icon = feature.icon
        const isOpen = openIndex === index

        return (
          <div
            key={index}
            className={`bg-white rounded-2xl border-2 transition-all ${
              isOpen ? 'border-rose-300 shadow-lg' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center gap-4 p-6 text-left hover:bg-slate-50 transition-colors rounded-2xl"
              aria-expanded={isOpen}
            >
              <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <span className="text-xl font-bold text-slate-900 flex-1">
                {feature.title}
              </span>
              <ChevronDown
                className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-[600px]' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-8 pt-2">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {feature.subTitle && (
                  <p className="font-semibold text-slate-900 mb-4">
                    {feature.subTitle}
                  </p>
                )}

                <ul className="space-y-3 mb-6">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {feature.highlight && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                    <p className="text-emerald-800 font-semibold">
                      {feature.highlight}
                    </p>
                  </div>
                )}

                {feature.footer && (
                  <p className="text-slate-600 italic mb-6">
                    {feature.footer}
                  </p>
                )}

                {feature.link && (
                  <Link
                    href={feature.link.href}
                    className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
                  >
                    {feature.link.text}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
