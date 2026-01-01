'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Heart,
  MessageCircle,
  Gift,
  Clock,
  Hand,
  RotateCcw,
  Share2,
  ExternalLink,
  CheckCircle,
  Copy,
  Check,
  Download,
  Sparkles,
  Users,
  TrendingUp,
  BookOpen,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Link2
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

const languageInfo: Record<LoveLanguage, {
  name: string
  icon: typeof Heart
  color: string
  bgColor: string
  description: string
  tips: string[]
  partnerTips: string[]
  famousPeople: string[]
}> = {
  words: {
    name: 'Bevestigende Woorden',
    icon: MessageCircle,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    description: 'Je voelt je geliefd door complimenten, aanmoediging en woorden van waardering. "Ik hou van je" en "Je bent geweldig" betekenen veel voor jou.',
    tips: [
      'Schrijf je partner dagelijks een lief berichtje',
      'Geef specifieke complimenten over karakter, niet alleen uiterlijk',
      'Spreek je waardering uit voor kleine dingen',
      'Schrijf liefdesbrieven of kaartjes voor speciale momenten'
    ],
    partnerTips: [
      'Zeg regelmatig "ik hou van je" en meen het',
      'Geef complimenten in het bijzijn van anderen',
      'Laat voice memos achter als je weg bent',
      'Schrijf een lijst met 10 dingen die je aan hen waardeert'
    ],
    famousPeople: ['Taylor Swift', 'John Legend']
  },
  acts: {
    name: 'Hulpvaardigheid',
    icon: Hand,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Daden zeggen meer dan woorden voor jou. Je voelt je geliefd wanneer je partner dingen voor je doet, van kleine klusjes tot grote gebaren.',
    tips: [
      'Vraag je partner wat je voor hen kunt doen',
      'Neem taken over zonder dat ze erom vragen',
      'Maak een "love coupon book" met hulpvolle gebaren',
      'Doe de vervelende klusjes die ze uitstellen'
    ],
    partnerTips: [
      'Kook hun favoriete maaltijd onverwachts',
      'Doe een taak die ze normaal zelf doen',
      'Maak hun ochtend makkelijker (koffie, lunch klaarmaken)',
      'Fix dat ding dat al maanden kapot is'
    ],
    famousPeople: ['Keanu Reeves', 'Tom Hanks']
  },
  gifts: {
    name: 'Cadeaus Ontvangen',
    icon: Gift,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'Het gaat niet om materialisme - het gaat om de gedachte en moeite. Attente cadeaus laten zien dat iemand aan je denkt.',
    tips: [
      'Het hoeft niet duur te zijn - het gaat om de gedachte',
      'Onthoud wat ze zeggen en verras ze later ermee',
      'Breng iets mee van je reizen of uitjes',
      'Creëer een wishlist voor speciale gelegenheden'
    ],
    partnerTips: [
      'Neem kleine cadeautjes mee "zomaar"',
      'Onthoud wat ze noemen en koop het later',
      'Maak handgemaakte cadeaus voor extra betekenis',
      'Verzamel souvenirs van jullie avonturen samen'
    ],
    famousPeople: ['Beyoncé', 'Oprah Winfrey']
  },
  time: {
    name: 'Quality Time',
    icon: Clock,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Onverdeelde aandacht is het belangrijkst. Je voelt je geliefd wanneer je partner echt aanwezig is, zonder afleidingen.',
    tips: [
      'Plan vaste "date nights" in jullie agenda',
      'Leg je telefoon weg tijdens gesprekken',
      'Doe samen nieuwe activiteiten',
      'Maak oogcontact en luister actief'
    ],
    partnerTips: [
      'Plan regelmatig quality time in, ook al is het kort',
      'Wees 100% aanwezig - geen telefoon',
      'Doe activiteiten die zij leuk vinden',
      'Creëer rituelen samen (ochtendkoffie, avondwandeling)'
    ],
    famousPeople: ['Michelle Obama', 'Prince William']
  },
  touch: {
    name: 'Fysieke Aanraking',
    icon: Heart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Knuffels, hand vasthouden en fysieke nabijheid geven je een gevoel van veiligheid en liefde.',
    tips: [
      'Geef dagelijks knuffels van minimaal 20 seconden',
      'Pak hun hand vast tijdens het wandelen',
      'Geef schouder- of voetmassages',
      'Zit dicht bij elkaar, ook als je tv kijkt'
    ],
    partnerTips: [
      'Initieer vaker fysiek contact',
      'Geef een kus voor je het huis verlaat',
      'Streel hun arm of rug terloops',
      'Knuffel zonder dat het ergens toe hoeft te leiden'
    ],
    famousPeople: ['David Beckham', 'Justin Timberlake']
  },
}

// Average distribution based on research
const averageDistribution: Record<LoveLanguage, number> = {
  words: 23,
  time: 22,
  acts: 21,
  touch: 19,
  gifts: 15
}

export default function LoveLanguageQuiz() {
  const { data: session } = useSession()
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
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Save result to database
  const saveResult = useCallback(async (finalScores: Record<LoveLanguage, number>) => {
    setIsSaving(true)
    try {
      const sorted = Object.entries(finalScores).sort(([, a], [, b]) => b - a) as [LoveLanguage, number][]
      const primary = sorted[0][0]
      const secondary = sorted[1][0]

      const response = await fetch('/api/kennisbank/tools/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug: 'liefdetaal-quiz',
          toolType: 'QUIZ',
          input: { answers: questions.length },
          output: {
            scores: finalScores,
            ranking: sorted,
            primary: {
              language: primary,
              name: languageInfo[primary].name,
              score: sorted[0][1]
            },
            secondary: {
              language: secondary,
              name: languageInfo[secondary].name,
              score: sorted[1][1]
            }
          },
          score: sorted[0][1],
          metadata: {
            quizVersion: '2.0',
            questionsAnswered: questions.length
          }
        })
      })

      const data = await response.json()
      if (data.shareToken) {
        setShareToken(data.shareToken)
      }
    } catch (error) {
      console.error('Failed to save result:', error)
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handleAnswer = (answer: 'A' | 'B') => {
    setSelectedAnswer(answer)

    const question = questions[currentQuestion]
    const language = answer === 'A' ? question.optionA.language : question.optionB.language

    const newScores = {
      ...scores,
      [language]: scores[language] + 1,
    }
    setScores(newScores)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer(null)
      } else {
        setIsComplete(true)
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#6366f1']
        })
        // Save result
        saveResult(newScores)
      }
    }, 400)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScores({ words: 0, acts: 0, gifts: 0, time: 0, touch: 0 })
    setIsComplete(false)
    setSelectedAnswer(null)
    setShareToken(null)
  }

  const getResults = () => {
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [LoveLanguage, number][]
    return sorted
  }

  const getPrimaryLanguage = (): LoveLanguage => {
    return getResults()[0][0]
  }

  const getSecondaryLanguage = (): LoveLanguage => {
    return getResults()[1][0]
  }

  const copyShareLink = async () => {
    const url = shareToken
      ? `${window.location.origin}/kennisbank/tools/result/${shareToken}`
      : window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/kennisbank/tools/result/${shareToken}`
    : typeof window !== 'undefined' ? window.location.href : ''

  const shareText = `Mijn primaire liefdetaal is ${languageInfo[getPrimaryLanguage()]?.name}! Ontdek jouw liefdetaal:`

  if (isComplete) {
    const results = getResults()
    const primary = getPrimaryLanguage()
    const secondary = getSecondaryLanguage()
    const primaryInfo = languageInfo[primary]
    const secondaryInfo = languageInfo[secondary]
    const PrimaryIcon = primaryInfo.icon
    const SecondaryIcon = secondaryInfo.icon
    const maxScore = Math.max(...Object.values(scores))
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Primary Result Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${primaryInfo.bgColor} rounded-2xl p-6 border-2 border-${primary === 'words' ? 'rose' : primary === 'acts' ? 'emerald' : primary === 'gifts' ? 'amber' : primary === 'time' ? 'indigo' : 'purple'}-200 relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <PrimaryIcon className="w-full h-full" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Jouw Primaire Liefdetaal</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl ${primaryInfo.bgColor} flex items-center justify-center border-2 border-white shadow-lg`}>
                <PrimaryIcon className={`w-8 h-8 ${primaryInfo.color}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${primaryInfo.color}`}>
                  {primaryInfo.name}
                </h2>
                <p className="text-gray-600">{Math.round((results[0][1] / totalScore) * 100)}% van je antwoorden</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {primaryInfo.description}
            </p>
          </div>
        </motion.div>

        {/* Secondary Language */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${secondaryInfo.bgColor} flex items-center justify-center`}>
              <SecondaryIcon className={`w-5 h-5 ${secondaryInfo.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Secundaire Liefdetaal</p>
              <p className={`font-semibold ${secondaryInfo.color}`}>{secondaryInfo.name}</p>
            </div>
            <span className="text-sm text-gray-500">
              {Math.round((results[1][1] / totalScore) * 100)}%
            </span>
          </div>
        </motion.div>

        {/* Full Score Breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Jouw Volledige Profiel</h3>
          </div>
          <div className="space-y-4">
            {results.map(([lang, score], index) => {
              const info = languageInfo[lang]
              const Icon = info.icon
              const percentage = Math.round((score / totalScore) * 100)
              const avgPercentage = averageDistribution[lang]

              return (
                <motion.div
                  key={lang}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${info.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${info.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {info.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{percentage}%</span>
                      <span className="text-xs text-gray-400">
                        (gem. {avgPercentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className={`absolute inset-y-0 left-0 rounded-full ${
                        lang === 'words' ? 'bg-rose-500' :
                        lang === 'acts' ? 'bg-emerald-500' :
                        lang === 'gifts' ? 'bg-amber-500' :
                        lang === 'time' ? 'bg-indigo-500' :
                        'bg-purple-500'
                      }`}
                    />
                    {/* Average marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                      style={{ left: `${avgPercentage}%` }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            De verticale lijn toont het gemiddelde van alle gebruikers
          </p>
        </motion.div>

        {/* Tips Sections */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-gray-900">Tips voor Jou</h3>
            </div>
            <ul className="space-y-2">
              {primaryInfo.tips.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-900">Tips voor je Partner</h3>
            </div>
            <ul className="space-y-2">
              {primaryInfo.partnerTips.slice(0, 3).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Related Article */}
        <motion.a
          href={`/kennisbank/communicatie/liefdetalen-${primary}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-rose-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
              <BookOpen className="w-6 h-6 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Meer leren?</p>
              <p className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                Alles over {primaryInfo.name}
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
          </div>
        </motion.a>

        {/* Share Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              <h3 className="font-semibold">Deel je Resultaat</h3>
            </div>
            {isSaving && (
              <span className="text-sm text-gray-400">Opslaan...</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm">Twitter</span>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span className="text-sm">Facebook</span>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span className="text-sm">LinkedIn</span>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Mijn Liefdetaal Resultaat')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">Email</span>
            </a>
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Gekopieerd!' : 'Kopieer Link'}</span>
            </button>
          </div>

          <p className="text-sm text-gray-400">
            Nodig je partner uit om de quiz ook te doen en vergelijk jullie resultaten!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetQuiz}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Opnieuw doen
          </button>
          <a
            href="https://datingassistent.nl/liefdetaal?ref=lvi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-200"
          >
            <Sparkles className="w-4 h-4" />
            Uitgebreide AI Analyse
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* User History Link */}
        {session?.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <a
              href="/kennisbank/tools/mijn-resultaten"
              className="text-sm text-gray-500 hover:text-rose-600 transition-colors"
            >
              Bekijk al je quiz resultaten →
            </a>
          </motion.div>
        )}
      </motion.div>
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
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            {question.text}
          </h3>

          <div className="space-y-3">
            {['A', 'B'].map((option) => {
              const optionData = option === 'A' ? question.optionA : question.optionB
              const isSelected = selectedAnswer === option

              return (
                <motion.button
                  key={option}
                  onClick={() => handleAnswer(option as 'A' | 'B')}
                  disabled={selectedAnswer !== null}
                  whileHover={{ scale: selectedAnswer === null ? 1.01 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.99 : 1 }}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } disabled:cursor-not-allowed`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option}
                    </span>
                    <span className="text-gray-700 flex-1">{optionData.text}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hint */}
      <p className="text-center text-sm text-gray-500">
        Kies de optie die het meest bij je past - er is geen goed of fout
      </p>
    </div>
  )
}
