'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronRight,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  BookOpenCheck,
  User,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react'

// Mock article data - will be replaced by API
const mockArticle = {
  id: '1',
  title: 'Romance Scams Herkennen: De Complete Gids',
  titleNl: 'Romance Scams Herkennen: De Complete Gids',
  slug: 'romance-scams-herkennen',
  content: `
    <h2>Wat is een Romance Scam?</h2>
    <p>Een romance scam is een vorm van fraude waarbij oplichters zich voordoen als een romantische partner om slachtoffers geld afhandig te maken. Deze oplichters bouwen vaak weken- of maandenlang een vertrouwensband op voordat ze om geld vragen.</p>

    <h2>De 5 Fases van een Romance Scam</h2>
    <h3>Fase 1: Het Eerste Contact</h3>
    <p>De oplichter benadert je via een datingsite, sociale media, of reageert op een post. Ze hebben vaak een aantrekkelijk profiel met gestolen foto's.</p>

    <h3>Fase 2: De Grooming</h3>
    <p>Ze bouwen snel een emotionele band op. Ze sturen veel berichten, bellen je, en geven je het gevoel bijzonder te zijn. Dit heet "love bombing".</p>

    <h3>Fase 3: De Test</h3>
    <p>Ze vragen om een klein bedrag - bijvoorbeeld €50 voor een "noodgeval". Als je betaalt, weten ze dat je een potentieel slachtoffer bent.</p>

    <h3>Fase 4: De Crisis</h3>
    <p>Er ontstaat een "noodsituatie" waarvoor veel geld nodig is. Dit kan een ziekenhuisrekening zijn, vastzitten op het vliegveld, of zakelijke problemen.</p>

    <h3>Fase 5: De Herhaling</h3>
    <p>Na de eerste betaling blijven er nieuwe problemen komen die geld vereisen. Dit gaat door totdat het slachtoffer stopt met betalen of geen geld meer heeft.</p>

    <h2>20 Rode Vlaggen</h2>
    <ol>
      <li>Het profiel is "te mooi om waar te zijn"</li>
      <li>Ze willen snel van het platform af naar WhatsApp of email</li>
      <li>Ze kunnen nooit videobellen</li>
      <li>Ze werken in het buitenland (leger, offshore, hulpverlening)</li>
      <li>Ze vragen om financiële informatie</li>
      <li>Ze willen heel snel een serieuze relatie</li>
      <li>Ze hebben altijd een excuus om niet te ontmoeten</li>
      <li>Ze maken veel spelfouten in een taal die hun moedertaal zou moeten zijn</li>
      <li>Hun verhaal klopt niet als je doorvraagt</li>
      <li>Ze sturen dezelfde foto's steeds opnieuw</li>
      <li>Ze worden boos als je kritische vragen stelt</li>
      <li>Ze kennen geen details over hun zogenaamde woonplaats</li>
      <li>Ze vragen om cadeaubonnen of cryptocurrency</li>
      <li>Ze hebben een "neef" of "advocaat" die je moet betalen</li>
      <li>Ze beloven dat ze het geld terugbetalen</li>
      <li>Ze dreigen of manipuleren als je niet betaalt</li>
      <li>Hun berichten lijken gekopieerd (algemeen, niet persoonlijk)</li>
      <li>Ze reageren op rare tijden (tijdzone komt niet overeen)</li>
      <li>Ze hebben geen sociale media voetafdruk</li>
      <li>Je gevoel zegt dat er iets niet klopt</li>
    </ol>

    <h2>Wat Te Doen Als Je Slachtoffer Bent</h2>
    <p>Stop direct met alle contact. Doe aangifte bij de politie. Meld het bij de Fraudehelpdesk. En vergeet niet: het is niet jouw schuld.</p>
  `,
  contentEasyRead: `
    <h2>Wat is een Romance Scam?</h2>
    <p>Een romance scam is oplichting.</p>
    <p>Iemand doet alsof hij of zij verliefd is op jou.</p>
    <p>Maar het is nep.</p>
    <p>Ze willen alleen je geld.</p>

    <h2>Hoe herken je een oplichter?</h2>

    <h3>1. Te mooi om waar te zijn</h3>
    <p>De persoon ziet er heel mooi uit op foto's.</p>
    <p>Die foto's zijn vaak gestolen van iemand anders.</p>

    <h3>2. Nooit videobellen</h3>
    <p>Ze willen nooit videobellen.</p>
    <p>Ze hebben altijd een excuus.</p>

    <h3>3. Ze vragen om geld</h3>
    <p>Op een dag vragen ze om geld.</p>
    <p>Ze hebben een "probleem".</p>
    <p>Geef NOOIT geld aan iemand die je niet in het echt hebt ontmoet.</p>

    <h2>Wat moet je doen?</h2>
    <p>Stop met praten met deze persoon.</p>
    <p>Vertel het aan iemand die je vertrouwt.</p>
    <p>Je kunt aangifte doen bij de politie.</p>
  `,
  hasEasyRead: true,
  excerpt: 'Leer de belangrijkste signalen herkennen om jezelf te beschermen tegen dating fraude.',
  featuredImage: null,
  articleType: 'PILLAR',
  category: {
    name: 'Veiligheid & Bescherming',
    slug: 'veiligheid',
    color: '#DC2626',
  },
  author: {
    name: 'Redactie LVI',
  },
  keywords: ['romance scam', 'dating fraude', 'oplichting', 'catfish', 'love bombing'],
  viewCount: 15420,
  helpfulCount: 892,
  notHelpfulCount: 23,
  publishedAt: '2025-01-15',
  updatedAt: '2025-01-20',
  readTime: 12,
  relatedArticles: [
    { title: 'Love Bombing Herkennen', slug: 'veiligheid/love-bombing-herkennen' },
    { title: 'Catfishing: Zo Ontdek je Nepprofielen', slug: 'veiligheid/catfishing-herkennen' },
    { title: 'Veilig Afspreken Checklist', slug: 'veiligheid/veilig-afspreken-checklist' },
  ],
}

export default function ArticlePage() {
  const params = useParams()
  const categorySlug = params?.category as string
  const articleSlug = params?.slug as string

  const [article] = useState(mockArticle)
  const [isEasyRead, setIsEasyRead] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not-helpful' | null>(null)
  const [showTableOfContents, setShowTableOfContents] = useState(true)

  // Extract headings from content for table of contents
  const extractHeadings = (html: string) => {
    const headings: { level: number; text: string; id: string }[] = []
    const regex = /<h([23])[^>]*>([^<]+)<\/h[23]>/g
    let match
    while ((match = regex.exec(html)) !== null) {
      const text = match[2]
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      headings.push({
        level: parseInt(match[1]),
        text,
        id,
      })
    }
    return headings
  }

  const headings = extractHeadings(isEasyRead ? article.contentEasyRead : article.content)

  // Add IDs to headings in content
  const contentWithIds = (isEasyRead ? article.contentEasyRead : article.content)
    .replace(/<h([23])([^>]*)>([^<]+)<\/h([23])>/g, (match, level, attrs, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return `<h${level} id="${id}"${attrs}>${text}</h${level}>`
    })

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedbackGiven(isHelpful ? 'helpful' : 'not-helpful')
    // TODO: Call API to save feedback
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.titleNl,
        text: article.excerpt,
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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/kennisbank" className="text-gray-500 hover:text-gray-700">
              Kennisbank
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href={`/kennisbank/${article.category.slug}`}
              className="text-gray-500 hover:text-gray-700"
            >
              {article.category.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {article.titleNl}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Back Link */}
            <Link
              href={`/kennisbank/${article.category.slug}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar {article.category.name}
            </Link>

            {/* Article Header */}
            <header className="mb-8">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {article.articleType === 'PILLAR' && (
                  <span className="text-sm bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-medium">
                    Uitgebreide gids
                  </span>
                )}
                {article.hasEasyRead && (
                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <BookOpenCheck className="w-4 h-4" />
                    Easy Read beschikbaar
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {article.titleNl}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {article.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.publishedAt).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime} min lezen
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.viewCount.toLocaleString()} views
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Delen
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  <Bookmark className="w-4 h-4" />
                  Opslaan
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </header>

            {/* Easy Read Toggle */}
            {article.hasEasyRead && (
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

            {/* Article Content */}
            <div
              className={`prose prose-lg max-w-none ${
                isEasyRead ? 'prose-xl leading-relaxed' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />

            {/* Keywords/Tags */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Gerelateerde onderwerpen:</p>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword) => (
                  <Link
                    key={keyword}
                    href={`/kennisbank/zoeken?q=${encodeURIComponent(keyword)}`}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {keyword}
                  </Link>
                ))}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Was dit artikel nuttig?</h3>

              {feedbackGiven ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Bedankt voor je feedback!</span>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Ja, nuttig
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Kan beter
                  </button>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-4">
                {article.helpfulCount} mensen vonden dit artikel nuttig
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-6">

              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setShowTableOfContents(!showTableOfContents)}
                    className="w-full flex items-center justify-between p-4 font-semibold text-gray-900"
                  >
                    <span>Inhoudsopgave</span>
                    {showTableOfContents ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  {showTableOfContents && (
                    <nav className="px-4 pb-4">
                      <ul className="space-y-2">
                        {headings.map((heading, index) => (
                          <li
                            key={index}
                            className={heading.level === 3 ? 'ml-4' : ''}
                          >
                            <a
                              href={`#${heading.id}`}
                              className="text-sm text-gray-600 hover:text-rose-600 block py-1"
                            >
                              {heading.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}
                </div>
              )}

              {/* Related Articles */}
              {article.relatedArticles.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Gerelateerde artikelen</h3>
                  <ul className="space-y-3">
                    {article.relatedArticles.map((related, index) => (
                      <li key={index}>
                        <Link
                          href={`/kennisbank/${related.slug}`}
                          className="text-sm text-gray-600 hover:text-rose-600 flex items-center gap-2"
                        >
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          {related.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* DatingAssistent Promo */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Tip</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Wil je een bericht laten checken door AI? Gebruik de Scam Checker van onze partner.
                </p>
                <a
                  href="https://datingassistent.nl/scam-checker?ref=lvi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Naar DatingAssistent.nl
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 mb-1">Word je opgelicht?</p>
                    <p className="text-sm text-red-700 mb-2">
                      Stop direct met betalen. Bel de Fraudehelpdesk.
                    </p>
                    <a
                      href="https://www.fraudehelpdesk.nl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      fraudehelpdesk.nl →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .sticky, aside, nav, button {
            display: none !important;
          }
          article {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
