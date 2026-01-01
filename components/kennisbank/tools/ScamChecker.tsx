'use client'

import { useState } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  ExternalLink,
  Phone,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'

interface ScamCheckResult {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  flags: string[]
  advice: string[]
  resources: {
    fraudehelpdesk: { name: string; phone: string; url: string }
    politie: { name: string; url: string }
  }
}

export default function ScamChecker() {
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ScamCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFlags, setShowFlags] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = async () => {
    if (!message.trim() || message.length < 10) {
      setError('Voer minimaal 10 karakters in')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/kennisbank/tools/scam-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, type: 'message' }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Er ging iets mis')
        return
      }

      setResult(data.data)
    } catch (err) {
      setError('Kon het bericht niet analyseren. Probeer het opnieuw.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setMessage('')
    setResult(null)
    setError(null)
    setShowFlags(false)
  }

  const copyToClipboard = async () => {
    if (!result) return

    const text = `Scam Check Resultaat:
Risicoscore: ${result.riskScore}%
Risiconiveau: ${result.riskLevel === 'high' ? 'Hoog' : result.riskLevel === 'medium' ? 'Gemiddeld' : 'Laag'}
Gedetecteerde waarschuwingen: ${result.flags.join(', ') || 'Geen'}

Advies:
${result.advice.join('\n')}

Geanalyseerd via liefdevooriederen.nl/kennisbank/tools/scam-checker`

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' }
      case 'medium':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' }
      default:
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' }
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return AlertTriangle
      case 'medium':
        return AlertCircle
      default:
        return CheckCircle
    }
  }

  if (result) {
    const colors = getRiskColor(result.riskLevel)
    const RiskIcon = getRiskIcon(result.riskLevel)

    return (
      <div className="space-y-6">
        {/* Result Header */}
        <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
              <RiskIcon className={`w-8 h-8 ${colors.icon}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-xl font-bold ${colors.text}`}>
                  {result.riskLevel === 'high'
                    ? 'Hoog Risico'
                    : result.riskLevel === 'medium'
                    ? 'Gemiddeld Risico'
                    : 'Laag Risico'}
                </h3>
                <span className={`text-3xl font-bold ${colors.text}`}>
                  {result.riskScore}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.riskLevel === 'high'
                      ? 'bg-red-500'
                      : result.riskLevel === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>

              <p className="text-gray-600 text-sm">
                {result.riskLevel === 'high'
                  ? 'Dit bericht bevat meerdere waarschuwingssignalen die vaak voorkomen bij oplichting.'
                  : result.riskLevel === 'medium'
                  ? 'Er zijn enkele waarschuwingssignalen gevonden. Wees voorzichtig.'
                  : 'Dit bericht lijkt veilig, maar blijf altijd alert.'}
              </p>
            </div>
          </div>
        </div>

        {/* Detected Flags */}
        {result.flags.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowFlags(!showFlags)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <span className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {result.flags.length} waarschuwingssignalen gevonden
              </span>
              {showFlags ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showFlags && (
              <div className="border-t border-gray-100 p-4 space-y-2">
                {result.flags.map((flag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-sm text-amber-800"
                  >
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    {flag}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Advice */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Advies
          </h4>
          <ul className="space-y-2">
            {result.advice.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-blue-800 text-sm">
                <span className="text-blue-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* High Risk Extra Warning */}
        {result.riskLevel === 'high' && (
          <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
            <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Hulp Nodig?
            </h4>
            <div className="space-y-3">
              <a
                href={result.resources.fraudehelpdesk.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:border-red-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Fraudehelpdesk</p>
                  <p className="text-sm text-gray-500">{result.resources.fraudehelpdesk.phone}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href={result.resources.politie.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:border-red-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Aangifte doen bij Politie</p>
                  <p className="text-sm text-gray-500">politie.nl</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Nieuw Bericht Checken
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Gekopieerd!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Kopieer Resultaat
              </>
            )}
          </button>
        </div>

        {/* Cross-promotion */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h4 className="font-semibold text-gray-900 mb-2">Uitgebreidere Analyse?</h4>
          <p className="text-sm text-gray-600 mb-4">
            Onze partner DatingAssistent.nl biedt geavanceerde AI-analyse met meer context en persoonlijk advies.
          </p>
          <a
            href="https://datingassistent.nl/scam-checker?ref=lvi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            Naar DatingAssistent.nl
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plak hier het verdachte bericht
        </label>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setError(null)
          }}
          placeholder="Kopieer en plak hier het bericht dat je wilt laten analyseren..."
          className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {message.length} / 10.000 karakters
          </p>
          {message.length > 0 && message.length < 10 && (
            <p className="text-xs text-amber-600">Minimaal 10 karakters</p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || message.length < 10}
        className="w-full flex items-center justify-center gap-2 py-4 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyseren...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Analyseer Bericht
          </>
        )}
      </button>

      {/* Tips */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Tips voor gebruik</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-rose-500">•</span>
            <span>Kopieer het volledige bericht voor de beste analyse</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500">•</span>
            <span>Je berichten worden niet opgeslagen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500">•</span>
            <span>Bij twijfel: blokkeer en meld het profiel</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
