'use client'

import Link from 'next/link'
import {
  Shield,
  Heart,
  MessageSquare,
  User,
  Calculator,
  FileCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Wrench,
  ArrowRight,
  Star
} from 'lucide-react'

// Tools configuration
const tools = [
  {
    id: 'scam-checker',
    name: 'Scam Checker',
    nameNl: 'Scam Checker',
    description: 'Plak een bericht en laat AI analyseren of er rode vlaggen in zitten.',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    href: '/kennisbank/tools/scam-checker',
    isExternal: false,
    badge: 'Populair',
    category: 'Veiligheid',
  },
  {
    id: 'love-language-quiz',
    name: 'Love Language Quiz',
    nameNl: 'Liefdetaal Quiz',
    description: 'Ontdek jouw taal van de liefde in 12 vragen.',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    href: '/kennisbank/tools/liefdetaal-quiz',
    isExternal: false,
    badge: 'Nieuw',
    category: 'Persoonlijkheid',
  },
  {
    id: 'dating-readiness',
    name: 'Dating Readiness Quiz',
    nameNl: 'Ben Je Klaar om te Daten?',
    description: 'Ontdek of dit het juiste moment is om te beginnen met daten.',
    icon: FileCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/kennisbank/tools/dating-readiness',
    isExternal: false,
    badge: 'Nieuw',
    category: 'Persoonlijkheid',
  },
  {
    id: 'icebreaker-generator',
    name: 'Icebreaker Generator',
    nameNl: 'Openingszin Generator',
    description: 'Krijg gepersonaliseerde openingszinnen op basis van iemands profiel.',
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    href: '/kennisbank/tools/icebreaker-generator',
    isExternal: false,
    category: 'Communicatie',
  },
  {
    id: 'profile-review',
    name: 'Profiel Review',
    nameNl: 'Profiel Review',
    description: 'Laat je dating profiel analyseren door AI en krijg verbeterpunten.',
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    href: 'https://datingassistent.nl/profiel-review?ref=lvi',
    isExternal: true,
    externalLabel: 'DatingAssistent.nl',
    category: 'Profiel',
  },
  {
    id: 'compatibility-quiz',
    name: 'Compatibility Quiz',
    nameNl: 'Compatibiliteit Check',
    description: 'Ontdek jouw relatieprofiel en waar je op moet letten.',
    icon: Calculator,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    href: '/kennisbank/tools/compatibility-quiz',
    isExternal: false,
    badge: 'Nieuw',
    category: 'Relaties',
  },
  {
    id: 'red-flag-checklist',
    name: 'Red Flag Checklist',
    nameNl: 'Rode Vlaggen Checklist',
    description: 'Interactieve checklist om waarschuwingssignalen te herkennen.',
    icon: FileCheck,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    href: '/kennisbank/tools/red-flag-checklist',
    isExternal: false,
    category: 'Veiligheid',
  },
  {
    id: 'message-improver',
    name: 'Bericht Verbeteraar',
    nameNl: 'Bericht Verbeteraar',
    description: 'Optimaliseer je berichten voor een betere respons.',
    icon: Sparkles,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    href: 'https://datingassistent.nl/bericht-helper?ref=lvi',
    isExternal: true,
    externalLabel: 'DatingAssistent.nl',
    category: 'Communicatie',
  },
]

// Group tools by category
const categories = [
  { name: 'Veiligheid', description: 'Bescherm jezelf tegen oplichting en fraude' },
  { name: 'Persoonlijkheid', description: 'Leer jezelf beter kennen' },
  { name: 'Communicatie', description: 'Verbeter je berichten en gesprekken' },
  { name: 'Profiel', description: 'Optimaliseer je dating profiel' },
  { name: 'Relaties', description: 'Tools voor koppels en dates' },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/kennisbank" className="text-gray-500 hover:text-gray-700">
              Kennisbank
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Tools & Hulpmiddelen</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="bg-indigo-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Interactieve Tools & Hulpmiddelen
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Handige tools om veiliger te daten, jezelf beter te leren kennen, en je communicatie te verbeteren.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                {tools.length} tools beschikbaar
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Tool */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Meest gebruikt</span>
                  <span className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    15.420 checks
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Scam Checker</h2>
                <p className="text-white/90 mb-4">
                  Ontvang je verdachte berichten? Plak ze hier en onze AI analyseert of er rode vlaggen in zitten.
                  Bescherm jezelf tegen romance scams.
                </p>
                <Link
                  href="/kennisbank/tools/scam-checker"
                  className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Start Scam Check
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tools by Category */}
        {categories.map((category) => {
          const categoryTools = tools.filter(t => t.category === category.name)
          if (categoryTools.length === 0) return null

          return (
            <section key={category.name} className="mb-12">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                <p className="text-gray-500">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTools.map((tool) => {
                  const Icon = tool.icon

                  if (tool.isExternal) {
                    return (
                      <a
                        key={tool.id}
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group relative p-6 rounded-2xl border-2 ${tool.borderColor} ${tool.bgColor} hover:shadow-lg transition-all`}
                      >
                        {tool.externalLabel && (
                          <span className="absolute top-3 right-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {tool.externalLabel}
                          </span>
                        )}
                        <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4`}>
                          <Icon className={`w-6 h-6 ${tool.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {tool.nameNl}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tool.description}
                        </p>
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`group relative p-6 rounded-2xl border-2 ${tool.borderColor} ${tool.bgColor} hover:shadow-lg transition-all`}
                    >
                      {tool.badge && (
                        <span className="absolute top-3 right-3 text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                          {tool.badge}
                        </span>
                      )}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4`} style={{ backgroundColor: `${tool.color.replace('text-', '')}10` }}>
                        <Icon className={`w-6 h-6 ${tool.color}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {tool.nameNl}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {tool.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium group-hover:gap-2 transition-all">
                        Start tool
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* DatingAssistent Partnership Banner */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Meer AI Tools?
                </h2>
                <p className="text-gray-600 mb-4">
                  Onze partner DatingAssistent.nl biedt nog meer geavanceerde AI-tools voor online daten.
                  Van profieloptimalisatie tot berichtverbeteringen.
                </p>
                <a
                  href="https://datingassistent.nl?ref=lvi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Bekijk DatingAssistent.nl
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
