'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Shield,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  Share2,
  Info,
  MessageSquare
} from 'lucide-react'

// Tool configurations
const toolConfigs: Record<string, {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}> = {
  'scam-checker': {
    name: 'Scam Checker',
    description: 'Analyseer berichten op verdachte patronen en rode vlaggen',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
}

// Red flags patterns (simplified - actual logic in SafetySentinel)
const redFlagPatterns = [
  { pattern: /geld|betalen|overmaken|bedrag/i, flag: 'Verzoek om geld' },
  { pattern: /crypto|bitcoin|investering/i, flag: 'Cryptocurrency/investering' },
  { pattern: /gift\s?card|cadeaubon/i, flag: 'Vraagt om gift cards' },
  { pattern: /whatsapp|telegram|signal/i, flag: 'Wil snel van platform af' },
  { pattern: /ik hou van je|i love you/i, flag: 'Snelle liefdesverklaring' },
  { pattern: /noodgeval|emergency|ziekenhuis/i, flag: 'Noodsituatie' },
  { pattern: /leger|army|olie|offshore/i, flag: 'Verdacht beroep' },
  { pattern: /weduwe|widow|alleen/i, flag: 'Emotionele manipulatie' },
  { pattern: /erfenis|inheritance|miljoen/i, flag: 'Erfenis/grote bedragen' },
  { pattern: /bank|rekening|account/i, flag: 'Bankgegevens' },
]

interface ScamCheckResult {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  advice: string[]
}

function analyzeMessage(message: string): ScamCheckResult {
  const flags: string[] = []
  let riskScore = 0

  // Check patterns
  redFlagPatterns.forEach(({ pattern, flag }) => {
    if (pattern.test(message)) {
      flags.push(flag)
      riskScore += 15
    }
  })

  // Additional checks
  if (message.length < 50 && /\d{6,}/.test(message)) {
    flags.push('Kort bericht met nummer')
    riskScore += 10
  }

  if (/€\d+|EUR\s?\d+|\$\d+/i.test(message)) {
    flags.push('Specifiek bedrag genoemd')
    riskScore += 20
  }

  if (/https?:\/\//.test(message) && !message.includes('liefdevoorIedereen.nl')) {
    flags.push('Externe link')
    riskScore += 10
  }

  // Cap at 100
  riskScore = Math.min(100, riskScore)

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (riskScore >= 60) riskLevel = 'high'
  else if (riskScore >= 30) riskLevel = 'medium'

  // Generate advice
  const advice: string[] = []
  if (riskScore < 30) {
    advice.push('Dit bericht lijkt veilig.')
    advice.push('Blijf altijd alert en vertrouw op je gevoel.')
  } else if (riskScore < 60) {
    advice.push('Er zijn enkele waarschuwingssignalen gevonden.')
    advice.push('Wees voorzichtig met het delen van persoonlijke informatie.')
    advice.push('Neem de tijd om deze persoon beter te leren kennen.')
  } else {
    advice.push('WAARSCHUWING: Dit bericht bevat meerdere rode vlaggen.')
    advice.push('Deel NOOIT bankgegevens, geld of gift cards.')
    advice.push('Overweeg dit profiel te blokkeren en te melden.')
    advice.push('Bel de Fraudehelpdesk als je al geld hebt overgemaakt.')
  }

  return { riskScore, riskLevel, flags, advice }
}

// Scam Checker Component
function ScamChecker() {
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ScamCheckResult | null>(null)

  const handleAnalyze = async () => {
    if (!message.trim() || message.length < 10) return

    setIsAnalyzing(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const analysisResult = analyzeMessage(message)
    setResult(analysisResult)
    setIsAnalyzing(false)
  }

  const handleClear = () => {
    setMessage('')
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plak het bericht dat je wilt checken:
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Plak hier het verdachte bericht..."
          rows={6}
          className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 mt-2">
          {message.length} karakters {message.length < 10 && message.length > 0 && '(minimaal 10)'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={message.length < 10 || isAnalyzing}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyseren...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Check Bericht
            </>
          )}
        </button>
        {(message || result) && (
          <button
            onClick={handleClear}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Wissen
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Risk Score */}
          <div className={`rounded-2xl p-6 ${
            result.riskLevel === 'high' ? 'bg-red-50 border-2 border-red-200' :
            result.riskLevel === 'medium' ? 'bg-yellow-50 border-2 border-yellow-200' :
            'bg-green-50 border-2 border-green-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                result.riskLevel === 'high' ? 'bg-red-100' :
                result.riskLevel === 'medium' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                {result.riskLevel === 'high' ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : result.riskLevel === 'medium' ? (
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-xl font-bold ${
                    result.riskLevel === 'high' ? 'text-red-800' :
                    result.riskLevel === 'medium' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {result.riskLevel === 'high' ? 'Hoog Risico' :
                     result.riskLevel === 'medium' ? 'Gemiddeld Risico' :
                     'Laag Risico'}
                  </h3>
                  <span className={`text-2xl font-bold ${
                    result.riskLevel === 'high' ? 'text-red-600' :
                    result.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {result.riskScore}%
                  </span>
                </div>
                <p className={`text-sm ${
                  result.riskLevel === 'high' ? 'text-red-700' :
                  result.riskLevel === 'medium' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  {result.flags.length} waarschuwingssignalen gevonden
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.riskLevel === 'high' ? 'bg-red-500' :
                    result.riskLevel === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Flags Found */}
          {result.flags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Gevonden Waarschuwingssignalen
              </h3>
              <ul className="space-y-2">
                {result.flags.map((flag, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advice */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Ons Advies
            </h3>
            <ul className="space-y-2">
              {result.advice.map((advice, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-800">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  {advice}
                </li>
              ))}
            </ul>
          </div>

          {/* External Tool Promo */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Uitgebreidere Analyse?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Onze partner DatingAssistent.nl biedt geavanceerde AI-analyse met meer context en tips.
                </p>
                <a
                  href="https://datingassistent.nl/scam-checker?ref=lvi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Probeer DatingAssistent.nl
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500">
          <strong>Disclaimer:</strong> Deze tool geeft een indicatie op basis van bekende patronen.
          Het is geen vervanging voor je eigen oordeel. Bij twijfel, stop alle contact en overleg met
          iemand die je vertrouwt of neem contact op met de{' '}
          <a href="https://www.fraudehelpdesk.nl" target="_blank" rel="noopener" className="text-red-600 hover:underline">
            Fraudehelpdesk
          </a>.
        </p>
      </div>
    </div>
  )
}

export default function ToolPage() {
  const params = useParams()
  const slug = params?.slug as string

  const toolConfig = toolConfigs[slug]

  // If tool not found, show generic message
  if (!toolConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tool niet gevonden
          </h1>
          <Link
            href="/kennisbank/tools"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Terug naar alle tools
          </Link>
        </div>
      </div>
    )
  }

  const Icon = toolConfig.icon

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
            <Link href="/kennisbank/tools" className="text-gray-500 hover:text-gray-700">
              Tools
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{toolConfig.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/kennisbank/tools"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar tools
        </Link>

        {/* Tool Header */}
        <header className={`${toolConfig.bgColor} rounded-2xl p-8 mb-8`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center">
              <Icon className={`w-8 h-8 ${toolConfig.color}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {toolConfig.name}
              </h1>
              <p className="text-gray-600">
                {toolConfig.description}
              </p>
            </div>
          </div>
        </header>

        {/* Tool Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {slug === 'scam-checker' && <ScamChecker />}

          {/* Add other tools here */}
          {slug !== 'scam-checker' && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Deze tool is nog in ontwikkeling.
              </p>
              <Link
                href="/kennisbank/tools"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Bekijk andere tools
              </Link>
            </div>
          )}
        </div>

        {/* Related Articles */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Gerelateerde artikelen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/kennisbank/veiligheid/romance-scams-herkennen"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                Romance Scams Herkennen: De Complete Gids
              </h3>
              <p className="text-sm text-gray-500 mt-1">12 min lezen</p>
            </Link>
            <Link
              href="/kennisbank/veiligheid/20-rode-vlaggen-chatberichten"
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                20 Rode Vlaggen in Chatberichten
              </h3>
              <p className="text-sm text-gray-500 mt-1">8 min lezen</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
