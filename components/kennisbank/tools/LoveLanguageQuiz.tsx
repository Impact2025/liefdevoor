'use client'

import { useState } from 'react'
import {
  Heart,
  MessageCircle,
  Gift,
  Clock,
  Hand,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Share2,
  ExternalLink,
  CheckCircle
} from 'lucide-react'

// Love Language Types
type LoveLanguage = 'words' | 'acts' | 'gifts' | 'time' | 'touch'

interface Question {
  id: number
  text: string
  optionA: { text: string; language: LoveLanguage }
  optionB: { text: string; language: LoveLanguage }
}

const questions: Question[] = [
  {
    id: 1,
    text: 'Wat zou je het meest waarderen van je partner?',
    optionA: { text: '"Ik hou van je" of "Je bent geweldig" horen', language: 'words' },
    optionB: { text: 'Een spontane knuffel of hand vasthouden', language: 'touch' },
  },
  {
    id: 2,
    text: 'Na een lange dag zou je het meest blij worden van:',
    optionA: { text: 'Samen een film kijken zonder telefoons', language: 'time' },
    optionB: { text: 'Je partner die het avondeten heeft gemaakt', language: 'acts' },
  },
  {
    id: 3,
    text: 'Welk cadeau raakt je het meest?',
    optionA: { text: 'Een handgeschreven liefdesbrief', language: 'words' },
    optionB: { text: 'Een attent cadeau dat laat zien dat je partner luistert', language: 'gifts' },
  },
  {
    id: 4,
    text: 'Wat voelt meer als liefde?',
    optionA: { text: 'Je partner die je helpt met een vervelende klus', language: 'acts' },
    optionB: { text: 'Onverdeelde aandacht tijdens een gesprek', language: 'time' },
  },
  {
    id: 5,
    text: 'Je voelt je het meest geliefd wanneer je partner:',
    optionA: { text: 'Complimenten geeft over wie je bent', language: 'words' },
    optionB: { text: 'Je schouders masseert na een stressvolle dag', language: 'touch' },
  },
  {
    id: 6,
    text: 'Wat zou je het meest missen in een relatie?',
    optionA: { text: 'Speciale cadeautjes ontvangen', language: 'gifts' },
    optionB: { text: 'Quality time zonder afleiding', language: 'time' },
  },
  {
    id: 7,
    text: 'Je voelt je het meest gewaardeerd wanneer:',
    optionA: { text: 'Je partner de was doet of opruimt', language: 'acts' },
    optionB: { text: 'Je partner je hand pakt in het openbaar', language: 'touch' },
  },
  {
    id: 8,
    text: 'Wat maakt een perfecte date?',
    optionA: { text: 'Samen een activiteit doen zonder telefoon', language: 'time' },
    optionB: { text: 'Een verrassingsuitje georganiseerd door je partner', language: 'gifts' },
  },
  {
    id: 9,
    text: 'Wat raakt je het meest?',
    optionA: { text: '"Ik ben zo trots op je"', language: 'words' },
    optionB: { text: 'Je partner die je auto wast of tankt', language: 'acts' },
  },
  {
    id: 10,
    text: 'Waar kijk je het meest naar uit bij thuiskomen?',
    optionA: { text: 'Een warme omhelzing', language: 'touch' },
    optionB: { text: 'Je partner die je vraagt hoe je dag was', language: 'words' },
  },
  {
    id: 11,
    text: 'Je zou je het meest speciaal voelen als:',
    optionA: { text: 'Je partner een weekendje weg plant voor jullie', language: 'time' },
    optionB: { text: 'Je partner iets koopt wat je even eerder noemde', language: 'gifts' },
  },
  {
    id: 12,
    text: 'Wat geeft je het meeste gevoel van verbondenheid?',
    optionA: { text: 'Samen op de bank zitten, dicht tegen elkaar', language: 'touch' },
    optionB: { text: 'Je partner die boodschappen doet zonder vragen', language: 'acts' },
  },
]

const languageInfo: Record<LoveLanguage, { name: string; icon: typeof Heart; color: string; description: string }> = {
  words: {
    name: 'Bevestigende Woorden',
    icon: MessageCircle,
    color: 'rose',
    description: 'Je voelt je geliefd door complimenten, aanmoediging en woorden van waardering. "Ik hou van je" en "Je bent geweldig" betekenen veel voor jou.',
  },
  acts: {
    name: 'Hulpvaardigheid',
    icon: Hand,
    color: 'emerald',
    description: 'Daden zeggen meer dan woorden voor jou. Je voelt je geliefd wanneer je partner dingen voor je doet, van kleine klusjes tot grote gebaren.',
  },
  gifts: {
    name: 'Cadeaus Ontvangen',
    icon: Gift,
    color: 'amber',
    description: 'Het gaat niet om materialisme - het gaat om de gedachte en moeite. Attente cadeaus laten zien dat iemand aan je denkt.',
  },
  time: {
    name: 'Quality Time',
    icon: Clock,
    color: 'indigo',
    description: 'Onverdeelde aandacht is het belangrijkst. Je voelt je geliefd wanneer je partner echt aanwezig is, zonder afleidingen.',
  },
  touch: {
    name: 'Fysieke Aanraking',
    icon: Heart,
    color: 'purple',
    description: 'Knuffels, hand vasthouden en fysieke nabijheid geven je een gevoel van veiligheid en liefde.',
  },
}

export default function LoveLanguageQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<LoveLanguage, number>>({
    words: 0,
    acts: 0,
    gifts: 0,
    time: 0,
    touch: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null)

  const handleAnswer = (answer: 'A' | 'B') => {
    setSelectedAnswer(answer)

    const question = questions[currentQuestion]
    const language = answer === 'A' ? question.optionA.language : question.optionB.language

    setScores((prev) => ({
      ...prev,
      [language]: prev[language] + 1,
    }))

    // Delay before moving to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer(null)
      } else {
        setIsComplete(true)
      }
    }, 300)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScores({ words: 0, acts: 0, gifts: 0, time: 0, touch: 0 })
    setIsComplete(false)
    setSelectedAnswer(null)
  }

  const getResults = () => {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [LoveLanguage, number][]
    return sorted
  }

  const getPrimaryLanguage = (): LoveLanguage => {
    return getResults()[0][0]
  }

  if (isComplete) {
    const results = getResults()
    const primary = getPrimaryLanguage()
    const primaryInfo = languageInfo[primary]
    const PrimaryIcon = primaryInfo.icon
    const maxScore = Math.max(...Object.values(scores))

    return (
      <div className="space-y-6">
        {/* Primary Result */}
        <div className={`bg-${primaryInfo.color}-50 rounded-xl p-6 border border-${primaryInfo.color}-200`}>
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto bg-${primaryInfo.color}-100 rounded-full flex items-center justify-center mb-4`}>
              <PrimaryIcon className={`w-8 h-8 text-${primaryInfo.color}-600`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Jouw Primaire Liefdetaal
            </h2>
            <h3 className={`text-2xl font-bold text-${primaryInfo.color}-600 mb-4`}>
              {primaryInfo.name}
            </h3>
            <p className="text-gray-600">
              {primaryInfo.description}
            </p>
          </div>
        </div>

        {/* All Scores */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Jouw Volledige Profiel</h3>
          <div className="space-y-4">
            {results.map(([lang, score]) => {
              const info = languageInfo[lang]
              const Icon = info.icon
              const percentage = Math.round((score / maxScore) * 100)

              return (
                <div key={lang} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${info.color}-600`} />
                      <span className="text-sm font-medium text-gray-700">
                        {info.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{score} punten</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${info.color}-500 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Tips voor jouw Liefdetaal</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
              <span>Communiceer je behoeften duidelijk naar je partner</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
              <span>Ontdek ook de liefdetaal van je partner</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
              <span>Waardeer gebaren die niet jouw primaire taal zijn</span>
            </li>
          </ul>
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
            href="https://datingassistent.nl/liefdetaal?ref=lvi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Uitgebreide Analyse
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Vraag {currentQuestion + 1} van {questions.length}</span>
          <span>{Math.round(progress)}%</span>
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
          <button
            onClick={() => handleAnswer('A')}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedAnswer === 'A'
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } disabled:cursor-not-allowed`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedAnswer === 'A'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                A
              </span>
              <span className="text-gray-700">{question.optionA.text}</span>
            </span>
          </button>

          <button
            onClick={() => handleAnswer('B')}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedAnswer === 'B'
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } disabled:cursor-not-allowed`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedAnswer === 'B'
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                B
              </span>
              <span className="text-gray-700">{question.optionB.text}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Navigation hint */}
      <p className="text-center text-sm text-gray-500">
        Kies de optie die het meest bij je past
      </p>
    </div>
  )
}
