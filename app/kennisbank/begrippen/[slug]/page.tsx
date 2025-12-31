'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Share2,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  BookOpenCheck
} from 'lucide-react'

// Mock data - will be replaced by API
const mockTerm = {
  term: 'Ghosting',
  slug: 'ghosting',
  definition: 'Ghosting is wanneer iemand met wie je date of chat ineens alle contact verbreekt zonder uitleg. De persoon reageert niet meer op berichten, beantwoordt geen telefoontjes, en verdwijnt als een geest.',
  definitionEasyRead: `Ghosting betekent dat iemand stopt met praten tegen jou.

De persoon reageert niet meer.
Je krijgt geen bericht terug.
De persoon vertelt niet waarom.

Het lijkt alsof de persoon een geest wordt.
Daarom heet het "ghosting".
Ghost is Engels voor geest.`,
  hasEasyRead: true,
  pronunciation: 'GO-sting',
  origin: 'Engels: "ghost" (geest) + "-ing"',
  firstUsed: 'De term werd populair rond 2014 met de opkomst van dating apps.',
  examples: [
    'Na drie dates en dagelijks appen, reageerde ze ineens nergens meer op. Ik werd geghost.',
    'Hij ghostte me na onze eerste date - ik heb nooit meer iets van hem gehoord.',
  ],
  relatedTerms: [
    { term: 'Zombieing', slug: 'zombieing', description: 'Wanneer iemand die je ghostte ineens terugkomt' },
    { term: 'Orbiting', slug: 'orbiting', description: 'Na ghosting toch je sociale media blijven volgen' },
    { term: 'Breadcrumbing', slug: 'breadcrumbing', description: 'Af en toe kleine signalen geven zonder echte intentie' },
  ],
  category: {
    name: 'Communicatie',
    slug: 'communicatie',
  },
  seeAlso: [
    { title: 'Omgaan met Ghosting', slug: 'communicatie/omgaan-met-ghosting' },
    { title: 'Waarom Mensen Ghosten', slug: 'communicatie/waarom-mensen-ghosten' },
  ],
  viewCount: 9850,
  helpfulCount: 567,
}

export default function BegripDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [term] = useState(mockTerm)
  const [isEasyRead, setIsEasyRead] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not-helpful' | null>(null)

  const handleFeedback = (isHelpful: boolean) => {
    setFeedbackGiven(isHelpful ? 'helpful' : 'not-helpful')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${term.term} - Dating Begrippenlijst`,
        text: term.definition,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link gekopieerd!')
    }
  }

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
            <Link href="/kennisbank/begrippen" className="text-gray-500 hover:text-gray-700">
              Begrippenlijst
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{term.term}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/kennisbank/begrippen"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar begrippenlijst
        </Link>

        {/* Main Card */}
        <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-50 px-8 py-8 border-b border-emerald-100">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">Begrippenlijst</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {term.term}
            </h1>
            {term.pronunciation && (
              <p className="text-gray-500 italic">
                Uitspraak: {term.pronunciation}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Easy Read Toggle */}
            {term.hasEasyRead && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpenCheck className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Makkelijk Lezen</p>
                      <p className="text-sm text-blue-700">Korte zinnen, eenvoudige woorden</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEasyRead(!isEasyRead)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      isEasyRead ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        isEasyRead ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Definition */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
                Betekenis
              </h2>
              <div className={`text-gray-700 ${isEasyRead ? 'text-xl leading-relaxed whitespace-pre-line' : 'text-lg'}`}>
                {isEasyRead ? term.definitionEasyRead : term.definition}
              </div>
            </section>

            {/* Origin */}
            {!isEasyRead && term.origin && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Herkomst</h2>
                <p className="text-gray-600">{term.origin}</p>
                {term.firstUsed && (
                  <p className="text-gray-500 text-sm mt-2">{term.firstUsed}</p>
                )}
              </section>
            )}

            {/* Examples */}
            {!isEasyRead && term.examples && term.examples.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Voorbeelden</h2>
                <ul className="space-y-3">
                  {term.examples.map((example, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-emerald-500 font-bold">&ldquo;</span>
                      <span className="text-gray-600 italic">{example}</span>
                      <span className="text-emerald-500 font-bold">&rdquo;</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Related Terms */}
            {term.relatedTerms && term.relatedTerms.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Gerelateerde begrippen</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {term.relatedTerms.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/kennisbank/begrippen/${related.slug}`}
                      className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {related.term}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {related.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* See Also (Articles) */}
            {term.seeAlso && term.seeAlso.length > 0 && (
              <section className="mb-8 p-4 bg-gray-50 rounded-xl">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Lees meer over dit onderwerp
                </h2>
                <ul className="space-y-2">
                  {term.seeAlso.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/kennisbank/${article.slug}`}
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Delen
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Was deze uitleg duidelijk?</h3>
            {feedbackGiven ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span>Bedankt voor je feedback!</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleFeedback(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Ja
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Nee
                </button>
              </div>
            )}
          </div>
        </article>

        {/* Browse More */}
        <div className="mt-8 text-center">
          <Link
            href="/kennisbank/begrippen"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Bekijk alle {200}+ begrippen
          </Link>
        </div>
      </main>
    </div>
  )
}
