'use client'

import { useState } from 'react'
import {
  Heart,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Shield,
  Brain,
  Clock,
  Users
} from 'lucide-react'

interface Question {
  id: number
  text: string
  category: 'emotional' | 'practical' | 'mindset' | 'timing'
  options: { text: string; score: number }[]
}

const questions: Question[] = [
  // Emotional Readiness (4 questions)
  {
    id: 1,
    category: 'emotional',
    text: 'Hoe voel je je over je vorige relatie(s)?',
    options: [
      { text: 'Ik heb het verwerkt en er van geleerd', score: 4 },
      { text: 'Ik denk er soms nog aan, maar het gaat steeds beter', score: 3 },
      { text: 'Ik denk er regelmatig aan met gemengde gevoelens', score: 2 },
      { text: 'Ik ben er nog niet overheen', score: 1 },
    ],
  },
  {
    id: 2,
    category: 'emotional',
    text: 'Hoe tevreden ben je met jezelf als single?',
    options: [
      { text: 'Heel tevreden - ik geniet van mijn eigen gezelschap', score: 4 },
      { text: 'Redelijk tevreden, maar een partner zou leuk zijn', score: 3 },
      { text: 'Soms eenzaam, ik mis iemand', score: 2 },
      { text: 'Ik voel me incompleet zonder partner', score: 1 },
    ],
  },
  {
    id: 3,
    category: 'emotional',
    text: 'Hoe ga je om met afwijzing?',
    options: [
      { text: 'Het hoort erbij, ik neem het niet persoonlijk', score: 4 },
      { text: 'Het doet even pijn maar ik herstel snel', score: 3 },
      { text: 'Het raakt me behoorlijk, maar ik ga door', score: 2 },
      { text: 'Afwijzing is een van mijn grootste angsten', score: 1 },
    ],
  },
  {
    id: 4,
    category: 'emotional',
    text: 'Ken je je eigen behoeften en grenzen?',
    options: [
      { text: 'Ja, heel goed - ik kan ze duidelijk communiceren', score: 4 },
      { text: 'Grotendeels, ik leer nog steeds', score: 3 },
      { text: 'Ik begin ze te ontdekken', score: 2 },
      { text: 'Niet echt, ik pas me vaak aan anderen aan', score: 1 },
    ],
  },
  // Practical Readiness (3 questions)
  {
    id: 5,
    category: 'practical',
    text: 'Heb je tijd voor daten in je leven?',
    options: [
      { text: 'Ja, ik heb een goede werk-privé balans', score: 4 },
      { text: 'Redelijk, ik kan tijd vrijmaken', score: 3 },
      { text: 'Het is krap, maar ik wil het proberen', score: 2 },
      { text: 'Eigenlijk niet, ik ben heel druk', score: 1 },
    ],
  },
  {
    id: 6,
    category: 'practical',
    text: 'Hoe staat het met je financiële situatie?',
    options: [
      { text: 'Stabiel - ik kan af en toe iets leuks doen', score: 4 },
      { text: 'Redelijk, met een budget kan ik daten', score: 3 },
      { text: 'Krap, maar creatieve dates zijn mogelijk', score: 2 },
      { text: 'Financieel is het nu echt niet het moment', score: 1 },
    ],
  },
  {
    id: 7,
    category: 'practical',
    text: 'Heb je een eigen leven met hobby\'s en vrienden?',
    options: [
      { text: 'Ja, een rijk sociaal leven en diverse interesses', score: 4 },
      { text: 'Redelijk, maar er is ruimte voor meer', score: 3 },
      { text: 'Een paar goede vrienden, weinig hobby\'s', score: 2 },
      { text: 'Niet echt, ik zou een partner kunnen gebruiken', score: 1 },
    ],
  },
  // Mindset (3 questions)
  {
    id: 8,
    category: 'mindset',
    text: 'Wat is je motivatie om te daten?',
    options: [
      { text: 'Ik ben open voor een verbinding, maar niet wanhopig', score: 4 },
      { text: 'Ik wil graag iemand leren kennen', score: 3 },
      { text: 'Ik voel druk (leeftijd, omgeving)', score: 2 },
      { text: 'Ik wil niet alleen zijn', score: 1 },
    ],
  },
  {
    id: 9,
    category: 'mindset',
    text: 'Hoe realistisch zijn je verwachtingen?',
    options: [
      { text: 'Ik weet dat het tijd kost en imperfect is', score: 4 },
      { text: 'Redelijk realistisch, met hoop op magie', score: 3 },
      { text: 'Ik zoek de perfecte match', score: 2 },
      { text: 'Love at first sight of niets', score: 1 },
    ],
  },
  {
    id: 10,
    category: 'mindset',
    text: 'Ben je bereid om te investeren in dates?',
    options: [
      { text: 'Ja, tijd, energie en aandacht zijn het waard', score: 4 },
      { text: 'Zeker, als ik iemand leuk vind', score: 3 },
      { text: 'Als het niet te veel moeite kost', score: 2 },
      { text: 'Ik wil dat het vanzelf gaat', score: 1 },
    ],
  },
  // Timing (2 questions)
  {
    id: 11,
    category: 'timing',
    text: 'Zijn er grote veranderingen in je leven gaande?',
    options: [
      { text: 'Nee, mijn leven is stabiel', score: 4 },
      { text: 'Kleine veranderingen, maar niets groots', score: 3 },
      { text: 'Ja, maar ik kan het aan', score: 2 },
      { text: 'Ja, veel onzekerheid op dit moment', score: 1 },
    ],
  },
  {
    id: 12,
    category: 'timing',
    text: 'Wanneer eindigde je laatste relatie?',
    options: [
      { text: 'Meer dan een jaar geleden (of nooit gehad)', score: 4 },
      { text: '6 maanden tot een jaar geleden', score: 3 },
      { text: '3 tot 6 maanden geleden', score: 2 },
      { text: 'Minder dan 3 maanden geleden', score: 1 },
    ],
  },
]

const categoryInfo = {
  emotional: { name: 'Emotionele Gereedheid', icon: Heart, color: 'rose' },
  practical: { name: 'Praktische Gereedheid', icon: Shield, color: 'blue' },
  mindset: { name: 'Mindset', icon: Brain, color: 'purple' },
  timing: { name: 'Timing', icon: Clock, color: 'amber' },
}

export default function DatingReadinessQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  const handleAnswer = (score: number, optionIndex: number) => {
    setSelectedOption(optionIndex)
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: score,
    }))

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedOption(null)
      } else {
        setIsComplete(true)
      }
    }, 300)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setIsComplete(false)
    setSelectedOption(null)
  }

  const calculateResults = () => {
    const categoryScores: Record<string, { total: number; count: number }> = {
      emotional: { total: 0, count: 0 },
      practical: { total: 0, count: 0 },
      mindset: { total: 0, count: 0 },
      timing: { total: 0, count: 0 },
    }

    questions.forEach((q) => {
      if (answers[q.id]) {
        categoryScores[q.category].total += answers[q.id]
        categoryScores[q.category].count += 1
      }
    })

    const results: Record<string, number> = {}
    Object.entries(categoryScores).forEach(([cat, data]) => {
      results[cat] = data.count > 0 ? Math.round((data.total / (data.count * 4)) * 100) : 0
    })

    return results
  }

  const getOverallScore = (results: Record<string, number>) => {
    const scores = Object.values(results)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return { level: 'Klaar om te Daten!', color: 'green', emoji: '🚀' }
    if (score >= 70) return { level: 'Bijna Klaar', color: 'blue', emoji: '✨' }
    if (score >= 50) return { level: 'In Ontwikkeling', color: 'amber', emoji: '🌱' }
    return { level: 'Neem Eerst de Tijd', color: 'rose', emoji: '🌸' }
  }

  const getAdvice = (results: Record<string, number>) => {
    const advice: string[] = []

    if (results.emotional < 60) {
      advice.push('Werk aan je emotionele verwerking voordat je begint met daten')
    }
    if (results.practical < 60) {
      advice.push('Zorg eerst voor een stabiele basis in je leven')
    }
    if (results.mindset < 60) {
      advice.push('Onderzoek je motivatie en verwachtingen')
    }
    if (results.timing < 60) {
      advice.push('De timing is misschien niet ideaal - overweeg even te wachten')
    }

    if (advice.length === 0) {
      advice.push('Je bent goed voorbereid! Veel succes met daten')
    }

    return advice
  }

  if (isComplete) {
    const results = calculateResults()
    const overall = getOverallScore(results)
    const readiness = getReadinessLevel(overall)
    const advice = getAdvice(results)

    return (
      <div className="space-y-6">
        {/* Main Result */}
        <div className={`bg-${readiness.color}-50 rounded-xl p-6 border border-${readiness.color}-200 text-center`}>
          <div className="text-4xl mb-3">{readiness.emoji}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Jouw Dating Readiness
          </h2>
          <h3 className={`text-2xl font-bold text-${readiness.color}-600 mb-3`}>
            {readiness.level}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <div className="text-3xl font-bold text-gray-900">{overall}%</div>
            <span className="text-gray-500">gereed</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Score per Categorie</h3>
          <div className="space-y-4">
            {(Object.entries(results) as [string, number][]).map(([cat, score]) => {
              const info = categoryInfo[cat as keyof typeof categoryInfo]
              const Icon = info.icon

              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${info.color}-600`} />
                      <span className="text-sm font-medium text-gray-700">
                        {info.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {score >= 70 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : score >= 50 ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                      <span className="text-sm text-gray-500">{score}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Advice */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Advies voor Jou
          </h3>
          <ul className="space-y-2">
            {advice.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        {overall >= 60 && (
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-3">Volgende Stappen</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Maak een aantrekkelijk profiel aan</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Leer de veiligheidsrichtlijnen kennen</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Begin met openheid en geduld</span>
              </li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetQuiz}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Opnieuw doen
          </button>
          {overall >= 60 ? (
            <a
              href="/registreren"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              Start met Daten
              <Heart className="w-4 h-4" />
            </a>
          ) : (
            <a
              href="/kennisbank/veiligheid"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lees Meer Tips
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentCategory = categoryInfo[question.category]
  const CategoryIcon = currentCategory.icon

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-2">
            <CategoryIcon className={`w-4 h-4 text-${currentCategory.color}-600`} />
            <span>{currentCategory.name}</span>
          </div>
          <span>Vraag {currentQuestion + 1} van {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          {question.text}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.score, index)}
              disabled={selectedOption !== null}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedOption === index
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } disabled:cursor-not-allowed`}
            >
              <span className="text-gray-700">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-sm text-gray-500">
        Wees eerlijk - dit helpt je het beste resultaat te krijgen
      </p>
    </div>
  )
}
