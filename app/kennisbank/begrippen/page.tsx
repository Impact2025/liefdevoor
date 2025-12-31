'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Hash
} from 'lucide-react'

// Mock begrippen data - will be replaced by API
const mockBegrippen = [
  { term: 'Afwijzing', slug: 'afwijzing', description: 'Wanneer iemand aangeeft niet geïnteresseerd te zijn in verdere contact.' },
  { term: 'Attachment Style', slug: 'attachment-style', description: 'Je hechtingsstijl bepaalt hoe je je gedraagt in relaties.' },
  { term: 'Benching', slug: 'benching', description: 'Iemand aan het lijntje houden als backup optie.' },
  { term: 'Breadcrumbing', slug: 'breadcrumbing', description: 'Af en toe kleine signalen geven zonder echte intentie.' },
  { term: 'Butterflies', slug: 'butterflies', description: 'Het opgewonden, nerveuze gevoel in je buik bij verliefdheid.' },
  { term: 'Catfishing', slug: 'catfishing', description: 'Je online voordoen als iemand anders.' },
  { term: 'Consent', slug: 'consent', description: 'Toestemming geven voor intieme handelingen.' },
  { term: 'Cuffing Season', slug: 'cuffing-season', description: 'De periode in herfst/winter waarin mensen een relatie zoeken.' },
  { term: 'DTR', slug: 'dtr', description: 'Define The Relationship - het gesprek over wat jullie zijn.' },
  { term: 'Dealbreaker', slug: 'dealbreaker', description: 'Een eigenschap die maakt dat je niet verder wilt met iemand.' },
  { term: 'Deepfake', slug: 'deepfake', description: 'AI-gegenereerde nepvideo of foto.' },
  { term: 'Dating Fatigue', slug: 'dating-fatigue', description: 'Moeheid en frustratie door langdurig online daten.' },
  { term: 'Exclusive', slug: 'exclusive', description: 'Afgesproken dat je alleen met elkaar date.' },
  { term: 'FWB', slug: 'fwb', description: 'Friends With Benefits - vrienden die ook intiem zijn.' },
  { term: 'Friend Zone', slug: 'friend-zone', description: 'Door iemand alleen als vriend gezien worden.' },
  { term: 'Ghosting', slug: 'ghosting', description: 'Zonder uitleg alle contact verbreken.' },
  { term: 'Green Flag', slug: 'green-flag', description: 'Positief signaal dat iemand betrouwbaar is.' },
  { term: 'Grooming', slug: 'grooming', description: 'Manipulatieve voorbereiding voor misbruik.' },
  { term: 'Honeymoon Phase', slug: 'honeymoon-phase', description: 'De roze wolk aan het begin van een relatie.' },
  { term: 'Icebreaker', slug: 'icebreaker', description: 'Een openingszin of vraag om het gesprek te starten.' },
  { term: 'Love Bombing', slug: 'love-bombing', description: 'Overweldigende aandacht als manipulatietechniek.' },
  { term: 'Long Distance', slug: 'long-distance', description: 'Een relatie waarbij partners ver uit elkaar wonen.' },
  { term: 'LVB', slug: 'lvb', description: 'Licht Verstandelijke Beperking.' },
  { term: 'Matching', slug: 'matching', description: 'Wanneer twee mensen wederzijds interesse tonen.' },
  { term: 'Negging', slug: 'negging', description: 'Iemand naar beneden halen om ze onzeker te maken.' },
  { term: 'Neprofiel', slug: 'neprofiel', description: 'Een vals profiel met gestolen of valse informatie.' },
  { term: 'Orbiting', slug: 'orbiting', description: 'Na ghosting toch je sociale media blijven volgen.' },
  { term: 'Pig Butchering', slug: 'pig-butchering', description: 'Romance scam gecombineerd met crypto-fraude.' },
  { term: 'Red Flag', slug: 'red-flag', description: 'Waarschuwingssignaal dat iemand niet te vertrouwen is.' },
  { term: 'Romance Scam', slug: 'romance-scam', description: 'Oplichting door te doen alsof je verliefd bent.' },
  { term: 'Sextortion', slug: 'sextortion', description: 'Chantage met intieme foto\'s of video\'s.' },
  { term: 'Situationship', slug: 'situationship', description: 'Een onduidelijke relatie zonder labels.' },
  { term: 'Slow Dating', slug: 'slow-dating', description: 'Bewust langzamer daten voor betere connecties.' },
  { term: 'Superlike', slug: 'superlike', description: 'Extra sterke like om interesse te tonen.' },
  { term: 'Swipen', slug: 'swipen', description: 'Op dating apps naar links of rechts vegen.' },
  { term: 'Zombieing', slug: 'zombieing', description: 'Wanneer iemand die je ghostte ineens terugkomt.' },
]

// Group by first letter
const groupByLetter = (terms: typeof mockBegrippen) => {
  const grouped: Record<string, typeof mockBegrippen> = {}

  terms.forEach(term => {
    const firstLetter = term.term.charAt(0).toUpperCase()
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = []
    }
    grouped[firstLetter].push(term)
  })

  // Sort within each group
  Object.keys(grouped).forEach(letter => {
    grouped[letter].sort((a, b) => a.term.localeCompare(b.term))
  })

  return grouped
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function BegrippenPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  // Filter and group
  const filteredTerms = useMemo(() => {
    let terms = mockBegrippen

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      terms = terms.filter(term =>
        term.term.toLowerCase().includes(query) ||
        term.description.toLowerCase().includes(query)
      )
    }

    if (selectedLetter) {
      terms = terms.filter(term =>
        term.term.charAt(0).toUpperCase() === selectedLetter
      )
    }

    return terms
  }, [searchQuery, selectedLetter])

  const groupedTerms = useMemo(() => groupByLetter(filteredTerms), [filteredTerms])

  // Get available letters (letters that have terms)
  const availableLetters = useMemo(() => {
    const letters = new Set(mockBegrippen.map(t => t.term.charAt(0).toUpperCase()))
    return alphabet.filter(l => letters.has(l))
  }, [])

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
            <span className="text-gray-900 font-medium">Begrippenlijst</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="bg-emerald-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dating Begrippenlijst
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                De complete A-Z encyclopedie van dating termen. Van ghosting tot love bombing - leer wat alle begrippen betekenen.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                {mockBegrippen.length} begrippen
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search & Filter */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedLetter(null) // Clear letter filter when searching
              }}
              placeholder="Zoek een begrip..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Alphabet Filter */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLetter === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Alle
            </button>
            {alphabet.map(letter => {
              const hasTerms = availableLetters.includes(letter)
              return (
                <button
                  key={letter}
                  onClick={() => hasTerms && setSelectedLetter(letter)}
                  disabled={!hasTerms}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    selectedLetter === letter
                      ? 'bg-emerald-600 text-white'
                      : hasTerms
                        ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results */}
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Geen begrippen gevonden voor &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedLetter(null)
              }}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Alle begrippen tonen
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedTerms).sort().map(letter => (
              <section key={letter} id={`letter-${letter}`}>
                {/* Letter Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600">{letter}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {groupedTerms[letter].length} begrip{groupedTerms[letter].length !== 1 ? 'pen' : ''}
                  </span>
                </div>

                {/* Terms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedTerms[letter].map(term => (
                    <Link
                      key={term.slug}
                      href={`/kennisbank/begrippen/${term.slug}`}
                      className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors mb-2">
                            {term.term}
                          </h2>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {term.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Popular Terms */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Hash className="w-5 h-5 text-emerald-600" />
            Meest gezochte begrippen
          </h2>
          <div className="flex flex-wrap gap-3">
            {['Ghosting', 'Love Bombing', 'Red Flag', 'Catfishing', 'Benching', 'DTR', 'Swipen'].map(term => (
              <Link
                key={term}
                href={`/kennisbank/begrippen/${term.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
