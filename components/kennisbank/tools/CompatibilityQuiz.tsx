'use client'

import { useState } from 'react'
import {
  Heart,
  Users,
  Home,
  Briefcase,
  MessageCircle,
  Compass,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  CheckCircle,
  Sparkles
} from 'lucide-react'

// Compatibility Dimensions
type Dimension = 'communication' | 'lifestyle' | 'values' | 'intimacy' | 'goals'

interface Question {
  id: number
  dimension: Dimension
  text: string
  options: { text: string; score: number }[]
}

const questions: Question[] = [
  // Communication Style (3 questions)
  {
    id: 1,
    dimension: 'communication',
    text: 'Hoe ga je het liefst om met meningsverschillen?',
    options: [
      { text: 'Direct bespreken en oplossen', score: 4 },
      { text: 'Even afkoelen en dan praten', score: 3 },
      { text: 'Hints geven en hopen dat de ander het begrijpt', score: 2 },
      { text: 'Vermijden totdat het vanzelf overgaat', score: 1 },
    ],
  },
  {
    id: 2,
    dimension: 'communication',
    text: 'Hoe vaak wil je contact met je partner als jullie niet samen zijn?',
    options: [
      { text: 'Meerdere keren per dag - ik wil alles delen', score: 4 },
      { text: 'Eén à twee keer per dag is fijn', score: 3 },
      { text: 'Een paar keer per week is genoeg', score: 2 },
      { text: 'Alleen als er iets belangrijks is', score: 1 },
    ],
  },
  {
    id: 3,
    dimension: 'communication',
    text: 'Hoe uit je het liefst je gevoelens?',
    options: [
      { text: 'Openlijk praten over emoties', score: 4 },
      { text: 'Door daden en gebaren', score: 3 },
      { text: 'Schrijven (berichten, brieven)', score: 2 },
      { text: 'Ik houd gevoelens liever voor mezelf', score: 1 },
    ],
  },
  // Lifestyle (3 questions)
  {
    id: 4,
    dimension: 'lifestyle',
    text: 'Wat is jouw ideale weekend?',
    options: [
      { text: 'Actief: sporten, uitjes, sociale activiteiten', score: 4 },
      { text: 'Mix van actief en rustig', score: 3 },
      { text: 'Rustig: thuis, films, lezen', score: 2 },
      { text: 'Alleen tijd voor mezelf', score: 1 },
    ],
  },
  {
    id: 5,
    dimension: 'lifestyle',
    text: 'Hoe sta je tegenover financiën in een relatie?',
    options: [
      { text: 'Alles samen delen', score: 4 },
      { text: 'Gedeelde pot voor vaste lasten, eigen geld voor de rest', score: 3 },
      { text: 'Ieder betaalt de helft, verder gescheiden', score: 2 },
      { text: 'Volledig gescheiden financiën', score: 1 },
    ],
  },
  {
    id: 6,
    dimension: 'lifestyle',
    text: 'Hoe belangrijk is netheid en orde voor jou?',
    options: [
      { text: 'Heel belangrijk - alles moet op zijn plek', score: 4 },
      { text: 'Redelijk netjes, maar niet overdreven', score: 3 },
      { text: 'Georganiseerde chaos werkt voor mij', score: 2 },
      { text: 'Ik maak me er niet druk om', score: 1 },
    ],
  },
  // Values (3 questions)
  {
    id: 7,
    dimension: 'values',
    text: 'Hoe belangrijk is familie voor jou?',
    options: [
      { text: 'Heel belangrijk - regelmatig contact', score: 4 },
      { text: 'Belangrijk, maar op afstand', score: 3 },
      { text: 'Mijn partner komt eerst', score: 2 },
      { text: 'Familie speelt geen grote rol', score: 1 },
    ],
  },
  {
    id: 8,
    dimension: 'values',
    text: 'Wat vind je van persoonlijke groei en ontwikkeling?',
    options: [
      { text: 'Essentieel - ik werk constant aan mezelf', score: 4 },
      { text: 'Belangrijk, maar in mijn eigen tempo', score: 3 },
      { text: 'Soms, als het nodig is', score: 2 },
      { text: 'Ik ben tevreden zoals ik ben', score: 1 },
    ],
  },
  {
    id: 9,
    dimension: 'values',
    text: 'Hoe kijk je naar trouw en vertrouwen?',
    options: [
      { text: 'Absoluut - geen ruimte voor twijfel', score: 4 },
      { text: 'Heel belangrijk, maar mensen maken fouten', score: 3 },
      { text: 'Vertrouwen moet verdiend worden', score: 2 },
      { text: 'Ik ga liever niet te diep op dit onderwerp in', score: 1 },
    ],
  },
  // Intimacy (2 questions)
  {
    id: 10,
    dimension: 'intimacy',
    text: 'Hoe belangrijk is fysieke affectie voor jou?',
    options: [
      { text: 'Heel belangrijk - dagelijks knuffelen/aanraken', score: 4 },
      { text: 'Belangrijk, maar niet overdreven', score: 3 },
      { text: 'Af en toe is genoeg', score: 2 },
      { text: 'Ik ben niet zo van fysiek contact', score: 1 },
    ],
  },
  {
    id: 11,
    dimension: 'intimacy',
    text: 'Hoe open ben je over intimiteit en verlangens?',
    options: [
      { text: 'Heel open - ik praat graag over alles', score: 4 },
      { text: 'Open met de juiste persoon', score: 3 },
      { text: 'Liever acties dan woorden', score: 2 },
      { text: 'Dit is een privé onderwerp', score: 1 },
    ],
  },
  // Future Goals (2 questions)
  {
    id: 12,
    dimension: 'goals',
    text: 'Wat is jouw kijk op samenwonen?',
    options: [
      { text: 'Zo snel mogelijk als het klikt', score: 4 },
      { text: 'Na een jaar of langer samen', score: 3 },
      { text: 'Alleen als we zeker weten dat het serieus is', score: 2 },
      { text: 'Ik houd liever mijn eigen plek', score: 1 },
    ],
  },
  {
    id: 13,
    dimension: 'goals',
    text: 'Hoe zie je de toekomst qua kinderen?',
    options: [
      { text: 'Ik wil zeker kinderen', score: 4 },
      { text: 'Sta ervoor open met de juiste persoon', score: 3 },
      { text: 'Twijfel nog', score: 2 },
      { text: 'Geen kinderen voor mij', score: 1 },
    ],
  },
]

const dimensionInfo: Record<Dimension, { name: string; icon: typeof Heart; color: string; description: string }> = {
  communication: {
    name: 'Communicatie',
    icon: MessageCircle,
    color: 'blue',
    description: 'Hoe je communiceert en conflicten oplost',
  },
  lifestyle: {
    name: 'Levensstijl',
    icon: Home,
    color: 'green',
    description: 'Dagelijkse gewoontes en voorkeuren',
  },
  values: {
    name: 'Waarden',
    icon: Heart,
    color: 'rose',
    description: 'Kernovertuigingen en prioriteiten',
  },
  intimacy: {
    name: 'Intimiteit',
    icon: Users,
    color: 'purple',
    description: 'Fysieke en emotionele nabijheid',
  },
  goals: {
    name: 'Toekomst',
    icon: Compass,
    color: 'amber',
    description: 'Plannen en verwachtingen',
  },
}

export default function CompatibilityQuiz() {
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
    const dimensionScores: Record<Dimension, { total: number; count: number }> = {
      communication: { total: 0, count: 0 },
      lifestyle: { total: 0, count: 0 },
      values: { total: 0, count: 0 },
      intimacy: { total: 0, count: 0 },
      goals: { total: 0, count: 0 },
    }

    questions.forEach((q) => {
      if (answers[q.id]) {
        dimensionScores[q.dimension].total += answers[q.id]
        dimensionScores[q.dimension].count += 1
      }
    })

    const results: Record<Dimension, number> = {} as Record<Dimension, number>
    Object.entries(dimensionScores).forEach(([dim, data]) => {
      results[dim as Dimension] = data.count > 0 ? Math.round((data.total / (data.count * 4)) * 100) : 0
    })

    return results
  }

  const getOverallScore = (results: Record<Dimension, number>) => {
    const scores = Object.values(results)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const getCompatibilityType = (overall: number) => {
    if (overall >= 80) return { type: 'Open & Betrokken', emoji: '💕', description: 'Je bent klaar voor een diepe, open relatie' }
    if (overall >= 60) return { type: 'Balans Zoeker', emoji: '⚖️', description: 'Je zoekt een gezonde balans tussen nabijheid en ruimte' }
    if (overall >= 40) return { type: 'Onafhankelijke Geest', emoji: '🦋', description: 'Je waardeert je vrijheid en groeit het best met ruimte' }
    return { type: 'Voorzichtige Ontdekker', emoji: '🌱', description: 'Je neemt de tijd om vertrouwen op te bouwen' }
  }

  if (isComplete) {
    const results = calculateResults()
    const overall = getOverallScore(results)
    const compatType = getCompatibilityType(overall)

    return (
      <div className="space-y-6">
        {/* Main Result */}
        <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-xl p-6 border border-rose-100 text-center">
          <div className="text-4xl mb-3">{compatType.emoji}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Jouw Relatietype
          </h2>
          <h3 className="text-2xl font-bold text-rose-600 mb-3">
            {compatType.type}
          </h3>
          <p className="text-gray-600">{compatType.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-gray-700">Openheid Score: {overall}%</span>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Jouw Profiel per Gebied</h3>
          <div className="space-y-4">
            {(Object.entries(results) as [Dimension, number][]).map(([dim, score]) => {
              const info = dimensionInfo[dim]
              const Icon = info.icon

              return (
                <div key={dim} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${info.color}-600`} />
                      <span className="text-sm font-medium text-gray-700">
                        {info.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{score}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${info.color}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{info.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Tips voor Jouw Type</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Zoek iemand met vergelijkbare scores voor harmonie</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Tegengestelden kunnen ook werken met goede communicatie</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>Bespreek verwachtingen vroeg in de relatie</span>
            </li>
          </ul>
        </div>

        {/* What to look for */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3">Waar Moet Je Op Letten?</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700 mb-1">Belangrijk voor jou:</p>
              <ul className="text-gray-600 space-y-1">
                {Object.entries(results)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 2)
                  .map(([dim]) => (
                    <li key={dim}>• {dimensionInfo[dim as Dimension].name}</li>
                  ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Ruimte voor groei:</p>
              <ul className="text-gray-600 space-y-1">
                {Object.entries(results)
                  .sort(([, a], [, b]) => a - b)
                  .slice(0, 2)
                  .map(([dim]) => (
                    <li key={dim}>• {dimensionInfo[dim as Dimension].name}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetQuiz}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Opnieuw doen
          </button>
          <a
            href="https://datingassistent.nl/compatibility?ref=lvi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Uitgebreide Match Analyse
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentDimension = dimensionInfo[question.dimension]
  const DimensionIcon = currentDimension.icon

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-2">
            <DimensionIcon className={`w-4 h-4 text-${currentDimension.color}-600`} />
            <span>{currentDimension.name}</span>
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
        Kies het antwoord dat het beste bij je past
      </p>
    </div>
  )
}
