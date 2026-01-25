'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Is dit echt voor iedereen?',
    answer: 'Ja. Iedereen mag lid worden. Ook mensen met een beperking. Ook mensen zonder beperking. Iedereen is welkom.'
  },
  {
    question: 'Moet ik meteen betalen?',
    answer: 'Nee. Je kunt gratis beginnen. Premium probeer je 2 maanden gratis. Daarna kies je zelf.'
  },
  {
    question: 'Hoe weet ik dat profielen echt zijn?',
    answer: 'We controleren elk profiel. Met onze computer (AI). En met echte mensen. Nep-profielen worden verwijderd.'
  },
  {
    question: 'Kan een begeleider mee helpen?',
    answer: 'Ja, dat kan. De begeleider kan helpen met je profiel. Maar ziet je berichten NIET. Jouw privacy blijft gewaarborgd.'
  },
  {
    question: 'Wat als ik iets verdachts zie?',
    answer: 'Klik op de HELP knop. We kijken er meteen naar. Binnen 30 minuten krijg je reactie.'
  },
  {
    question: 'Zijn er echt geen verborgen kosten?',
    answer: 'Nee. Wat je ziet is wat je betaalt. Geen verrassingen. Geen extra kosten.'
  },
  {
    question: 'Kan ik altijd stoppen?',
    answer: 'Ja. Klik op "Account verwijderen". Geen gedoe. Geen vragen. Alles wordt gewist binnen 30 dagen.'
  },
  {
    question: 'Werkt dit ook in België?',
    answer: 'Ja! We zijn voor Nederland én België. De site werkt in beide landen.'
  }
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden transition-all"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="text-lg font-semibold text-slate-900 pr-4">
              {faq.question}
            </span>
            <ChevronDown
              className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div className="px-6 pb-6">
              <p className="text-lg text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
