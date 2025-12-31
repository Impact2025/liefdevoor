'use client'

import Link from 'next/link'
import {
  Building2,
  BookOpen,
  Download,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Heart,
  FileText,
  Video,
  Headphones,
  Award
} from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: '800+ Artikelen',
    description: 'Toegang tot onze complete kennisbank met evidence-based content over veilig daten.'
  },
  {
    icon: Download,
    title: 'PDF Downloads',
    description: 'Download artikelen en handouts om te delen met je cliënten of patiënten.'
  },
  {
    icon: Video,
    title: 'Webinars & Training',
    description: 'Exclusieve toegang tot professionele webinars en trainingsmateriaal.'
  },
  {
    icon: Users,
    title: 'Team Toegang',
    description: 'Deel content met je team en beheer meerdere gebruikers.'
  },
  {
    icon: Shield,
    title: 'Evidence-Based',
    description: 'Al onze content is gebaseerd op wetenschappelijk onderzoek en best practices.'
  },
  {
    icon: Award,
    title: 'Accreditatie',
    description: 'Accreditatiepunten voor selecte trainingen en workshops.'
  },
]

const tiers = [
  {
    name: 'Basic',
    price: 'Gratis',
    description: 'Voor individuele professionals',
    features: [
      '10 artikelen per maand',
      'Basis zoekfunctie',
      'Nieuwsbrief',
      'Community forum',
    ],
    cta: 'Gratis Starten',
    popular: false,
  },
  {
    name: 'Standard',
    price: '€29',
    period: '/maand',
    description: 'Voor actieve professionals',
    features: [
      'Onbeperkt artikelen lezen',
      '10 PDF downloads per maand',
      'Webinar toegang',
      'Priority support',
      'Tot 3 teamleden',
    ],
    cta: 'Start Proefperiode',
    popular: true,
  },
  {
    name: 'Premium',
    price: '€99',
    period: '/maand',
    description: 'Voor organisaties',
    features: [
      'Alles uit Standard',
      'Onbeperkt PDF downloads',
      'White-label opties',
      'API toegang',
      'Tot 10 teamleden',
      'Dedicated accountmanager',
      'Custom trainingen',
    ],
    cta: 'Contact Opnemen',
    popular: false,
  },
]

const testimonials = [
  {
    quote: 'De kennisbank is een onmisbare bron geworden voor mijn praktijk. Mijn cliënten waarderen de begrijpelijke artikelen.',
    author: 'Sarah van den Berg',
    role: 'Relatietherapeut',
    organization: 'Praktijk Verbinding',
  },
  {
    quote: 'Eindelijk betrouwbare informatie over veilig daten die ik kan delen met mijn patiënten. De Easy Read versies zijn fantastisch.',
    author: 'Dr. Mark Jansen',
    role: 'GZ-psycholoog',
    organization: 'GGZ Centrum',
  },
]

export default function ProfessionalsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6">
              <Building2 className="w-4 h-4" />
              Voor Zorgprofessionals
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              De Complete Dating Kennisbank voor Professionals
            </h1>

            <p className="text-xl text-white/80 mb-8">
              Betrouwbare, evidence-based content over veilig daten. Speciaal ontwikkeld voor
              therapeuten, coaches, begeleiders en zorginstellingen.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/professionals/aanmelden"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Gratis Aanmelden
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#prijzen"
                className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Bekijk Prijzen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>AVG Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Evidence-Based</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>500+ Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              <span>Nederlands</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-lg text-gray-600">
              Van uitgebreide artikelen tot praktische tools - ondersteun je cliënten
              met betrouwbare informatie over veilig daten.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Content Categorieën
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Onze kennisbank bevat 800+ artikelen verdeeld over de volgende categorieën:
              </p>
              <ul className="space-y-4">
                {[
                  { name: 'Veiligheid & Privacy', count: 120 },
                  { name: 'Inclusief Daten', count: 100 },
                  { name: 'Communicatie & Grenzen', count: 80 },
                  { name: 'Relatie Opbouw', count: 100 },
                  { name: 'Professionele Content', count: 80 },
                  { name: 'Tools & Assessments', count: 40 },
                ].map((cat) => (
                  <li key={cat.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-gray-900">{cat.name}</span>
                    </span>
                    <span className="text-sm text-gray-500">{cat.count}+ artikelen</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
              <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-4">
                <FileText className="w-4 h-4" />
                Voorbeeld Artikel
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Romance Scams Herkennen: Gids voor Professionals
              </h3>
              <p className="text-gray-600 mb-4">
                Deze uitgebreide gids helpt professionals bij het herkennen en bespreken van
                romance scams met cliënten. Inclusief rode vlaggen checklist en gesprekshandleiding.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                  Veiligheid
                </span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  Professional
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  Easy Read beschikbaar
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>12 min leestijd</span>
                <span>•</span>
                <span>PDF download</span>
                <span>•</span>
                <span>Audio versie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prijzen" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transparante Prijzen
            </h2>
            <p className="text-lg text-gray-600">
              Kies het abonnement dat past bij jouw praktijk. Start gratis en upgrade wanneer je wilt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  tier.popular
                    ? 'border-indigo-600 shadow-lg'
                    : 'border-gray-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Meest Gekozen
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    {tier.period && (
                      <span className="text-gray-500">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.name === 'Premium' ? '/contact' : '/professionals/aanmelden'}
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Wat Professionals Zeggen
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-white rounded-xl border border-gray-200 p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role} • {testimonial.organization}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start Vandaag Nog
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Meld je gratis aan en ontdek hoe onze kennisbank je praktijk kan versterken.
          </p>
          <Link
            href="/professionals/aanmelden"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
          >
            Gratis Aanmelden
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Geen creditcard nodig • Direct toegang • Annuleer wanneer je wilt
          </p>
        </div>
      </section>
    </div>
  )
}
