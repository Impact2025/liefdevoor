'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Shield,
  Heart,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Share2,
  ExternalLink,
  CheckCircle,
  Check,
  Sparkles,
  Users,
  TrendingUp,
  BookOpen,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Link2,
  Info,
  ArrowRight
} from 'lucide-react'

// Attachment Style Types
type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'fearful'

interface Question {
  id: number
  text: string
  options: {
    text: string
    scores: Record<AttachmentStyle, number>
  }[]
}

// Research-based questions adapted from ECR-R (Experiences in Close Relationships-Revised)
const questions: Question[] = [
  {
    id: 1,
    text: 'Hoe voel je je over emotionele intimiteit in relaties?',
    options: [
      { text: 'Ik voel me comfortabel met intimiteit en zoek het actief op', scores: { secure: 3, anxious: 1, avoidant: 0, fearful: 0 } },
      { text: 'Ik verlang naar intimiteit maar ben bang afgewezen te worden', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik vind het moeilijk om dichtbij iemand te komen', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Ik wil intimiteit maar duw mensen vaak weg', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 2,
    text: 'Als je partner een dag niet reageert op berichten, wat denk je dan?',
    options: [
      { text: 'Ze zijn vast druk, ik hoor wel van ze', scores: { secure: 3, anxious: 0, avoidant: 1, fearful: 0 } },
      { text: 'Ik maak me zorgen - zijn ze boos? Heb ik iets verkeerd gedaan?', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Prima, ik heb ook mijn eigen leven', scores: { secure: 1, anxious: 0, avoidant: 3, fearful: 0 } },
      { text: 'Ik schommel tussen bezorgd zijn en doen alsof het me niet uitmaakt', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 3,
    text: 'Hoe ga je om met conflicten in een relatie?',
    options: [
      { text: 'Ik bespreek het rustig en zoek samen naar een oplossing', scores: { secure: 3, anxious: 1, avoidant: 0, fearful: 0 } },
      { text: 'Ik word emotioneel en heb bevestiging nodig dat alles goed komt', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik trek me terug en heb tijd alleen nodig', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Ik voel me overweldigd en weet niet wat ik moet doen', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 4,
    text: 'Hoe afhankelijk ben je van je partner voor emotionele steun?',
    options: [
      { text: 'Ik kan op mezelf rekenen maar waardeer steun van mijn partner', scores: { secure: 3, anxious: 0, avoidant: 1, fearful: 0 } },
      { text: 'Ik heb veel bevestiging nodig dat mijn partner er voor me is', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik reken liever op mezelf dan op anderen', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Ik wil steun maar vind het moeilijk om erom te vragen', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 5,
    text: 'Wat voel je als een relatie serieuzer wordt?',
    options: [
      { text: 'Opwinding en vreugde over de toekomst samen', scores: { secure: 3, anxious: 1, avoidant: 0, fearful: 0 } },
      { text: 'Blij maar ook angstig dat het mis kan gaan', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Een beetje oncomfortabel, ik heb mijn ruimte nodig', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Tegenstrijdige gevoelens - ik wil het maar ben ook bang', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 6,
    text: 'Hoe reageer je als je partner je nodig heeft?',
    options: [
      { text: 'Ik ben er graag voor hen en bied steun', scores: { secure: 3, anxious: 1, avoidant: 0, fearful: 0 } },
      { text: 'Ik wil helpen maar maak me zorgen of ik genoeg doe', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik vind het soms overweldigend als ze te veel nodig hebben', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Ik weet niet altijd hoe ik moet reageren', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 7,
    text: 'Hoe voel je je over alleen zijn?',
    options: [
      { text: 'Ik geniet van alleen tijd maar ook van samen zijn', scores: { secure: 3, anxious: 0, avoidant: 1, fearful: 0 } },
      { text: 'Ik voel me onrustig als ik te lang alleen ben', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik heb regelmatig tijd voor mezelf nodig', scores: { secure: 1, anxious: 0, avoidant: 3, fearful: 0 } },
      { text: 'Soms wil ik alleen zijn, soms voel ik me eenzaam', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 8,
    text: 'Hoe praat je over je gevoelens met je partner?',
    options: [
      { text: 'Open en eerlijk, ik voel me veilig om te delen', scores: { secure: 3, anxious: 1, avoidant: 0, fearful: 0 } },
      { text: 'Ik deel veel, soms misschien te veel te snel', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik houd sommige dingen liever voor mezelf', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Het hangt af van hoe veilig ik me voel op dat moment', scores: { secure: 1, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 9,
    text: 'Wat denk je over vertrouwen in relaties?',
    options: [
      { text: 'Vertrouwen bouw je op en ik geloof dat de meeste mensen betrouwbaar zijn', scores: { secure: 3, anxious: 0, avoidant: 1, fearful: 0 } },
      { text: 'Ik wil vertrouwen maar ben bang voor verraad', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik vertrouw liever op mezelf dan op anderen', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Vertrouwen is moeilijk voor mij door eerdere ervaringen', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 10,
    text: 'Hoe reageer je na een relatiebreuk?',
    options: [
      { text: 'Het doet pijn maar ik weet dat ik er doorheen kom', scores: { secure: 3, anxious: 0, avoidant: 1, fearful: 0 } },
      { text: 'Ik ben er kapot van en heb lang nodig om te herstellen', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik ga snel door en focus op andere dingen', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Ik voel opluchting én verdriet tegelijk', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 11,
    text: 'Hoe sta je tegenover commitment (zich verbinden)?',
    options: [
      { text: 'Ik sta er positief tegenover met de juiste persoon', scores: { secure: 3, anxious: 1, avoidant: 0, fearful: 0 } },
      { text: 'Ik wil het heel graag, soms té graag', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik vind het beangstigend en stel het liever uit', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Ik verlang ernaar maar saboteer het soms onbewust', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
  {
    id: 12,
    text: 'Wat beschrijft jouw gedrag in relaties het beste?',
    options: [
      { text: 'Stabiel en evenwichtig, ik kan geven en ontvangen', scores: { secure: 3, anxious: 0, avoidant: 0, fearful: 0 } },
      { text: 'Ik geef veel en zoek bevestiging', scores: { secure: 0, anxious: 3, avoidant: 0, fearful: 1 } },
      { text: 'Ik houd wat afstand en waardeer onafhankelijkheid', scores: { secure: 0, anxious: 0, avoidant: 3, fearful: 1 } },
      { text: 'Mijn gedrag wisselt - soms klampend, soms afstandelijk', scores: { secure: 0, anxious: 1, avoidant: 1, fearful: 3 } },
    ]
  },
]

const styleInfo: Record<AttachmentStyle, {
  name: string
  nameEn: string
  icon: typeof Shield
  color: string
  bgColor: string
  borderColor: string
  description: string
  characteristics: string[]
  challenges: string[]
  growthTips: string[]
  inRelationships: string
  percentage: number
}> = {
  secure: {
    name: 'Veilig Gehecht',
    nameEn: 'Secure',
    icon: Shield,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Je hebt een gezonde kijk op relaties. Je voelt je comfortabel met intimiteit én onafhankelijkheid. Je kunt je partner vertrouwen en bent zelf betrouwbaar.',
    characteristics: [
      'Comfortabel met intimiteit en autonomie',
      'Effectieve communicatie over behoeften',
      'Vertrouwen in zichzelf en anderen',
      'Gezonde grenzen stellen',
      'Emotioneel stabiel in relaties'
    ],
    challenges: [
      'Soms geduld hebben met minder veilig gehechte partners',
      'De neiging om te veel verantwoordelijkheid te nemen'
    ],
    growthTips: [
      'Blijf werken aan open communicatie',
      'Wees geduldig met partners die anders gehecht zijn',
      'Behoud je gezonde grenzen',
      'Blijf investeren in je eigen groei'
    ],
    inRelationships: 'Je bouwt stabiele, bevredigende relaties op basis van wederzijds vertrouwen en respect.',
    percentage: 50
  },
  anxious: {
    name: 'Angstig Gehecht',
    nameEn: 'Anxious',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Je verlangt naar nabijheid en bent gevoelig voor signalen van afwijzing. Je hebt veel behoefte aan bevestiging en kunt je onzeker voelen in relaties.',
    characteristics: [
      'Sterk verlangen naar intimiteit en bevestiging',
      'Gevoelig voor afwijzing of verlating',
      'Neiging om je zorgen te maken over de relatie',
      'Veel emotionele expressie',
      'Zeer betrokken bij de partner'
    ],
    challenges: [
      'Overweldigende angst voor verlating',
      'Te veel bevestiging nodig hebben',
      'Moeilijk grenzen stellen',
      'Neiging tot over-analyzeren'
    ],
    growthTips: [
      'Werk aan zelfvertrouwen los van relaties',
      'Leer je eigen emoties te reguleren',
      'Communiceer je behoeften zonder beschuldigingen',
      'Ontwikkel hobby\'s en vriendschappen',
      'Overweeg therapie om patronen te doorbreken'
    ],
    inRelationships: 'Je bent een liefdevolle, toegewijde partner die soms extra geruststelling nodig heeft.',
    percentage: 20
  },
  avoidant: {
    name: 'Vermijdend Gehecht',
    nameEn: 'Avoidant',
    icon: XCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Je waardeert onafhankelijkheid en vindt het moeilijk om te dichtbij te komen. Je houdt emotionele afstand en rekent voornamelijk op jezelf.',
    characteristics: [
      'Sterke behoefte aan onafhankelijkheid',
      'Oncomfortabel met te veel intimiteit',
      'Neiging om emoties te onderdrukken',
      'Zelfredzaam en zelfstandig',
      'Trekt zich terug bij conflict'
    ],
    challenges: [
      'Moeite met emotionele intimiteit',
      'Partners kunnen zich afgewezen voelen',
      'Neiging om relaties te saboteren',
      'Moeilijk hulp vragen'
    ],
    growthTips: [
      'Oefen met het delen van gevoelens',
      'Sta toe dat anderen je helpen',
      'Werk aan het herkennen van je behoeften',
      'Blijf in moeilijke momenten in plaats van weg te gaan',
      'Overweeg therapie om emotionele openheid te ontwikkelen'
    ],
    inRelationships: 'Je bent loyaal en betrouwbaar, maar hebt ruimte nodig om je veilig te voelen.',
    percentage: 25
  },
  fearful: {
    name: 'Angstig-Vermijdend',
    nameEn: 'Fearful-Avoidant',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Je ervaart tegenstrijdige gevoelens: je wilt intimiteit maar bent er ook bang voor. Dit kan leiden tot wisselend gedrag in relaties.',
    characteristics: [
      'Tegenstrijdige gevoelens over intimiteit',
      'Wisselend gedrag (soms klampend, soms afstandelijk)',
      'Moeite met emotieregulatie',
      'Onvoorspelbaar in relaties',
      'Vaak gekoppeld aan eerdere trauma\'s'
    ],
    challenges: [
      'Chaotische relatiepatronen',
      'Moeite met vertrouwen',
      'Overweldigende emoties',
      'Neiging tot zelfdestructief gedrag'
    ],
    growthTips: [
      'Zoek professionele hulp (therapie wordt sterk aangeraden)',
      'Werk aan traumaverwerking',
      'Leer je triggers herkennen',
      'Ontwikkel een stabiel support systeem',
      'Wees geduldig met jezelf - verandering kost tijd'
    ],
    inRelationships: 'Je bent complex en diepgaand, maar hebt ondersteuning nodig om stabiele relaties te bouwen.',
    percentage: 5
  },
}

export default function AttachmentStyleQuiz() {
  const { data: session } = useSession()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<AttachmentStyle, number>>({
    secure: 0,
    anxious: 0,
    avoidant: 0,
    fearful: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  const saveResult = useCallback(async (finalScores: Record<AttachmentStyle, number>) => {
    setIsSaving(true)
    try {
      const sorted = Object.entries(finalScores).sort(([, a], [, b]) => b - a) as [AttachmentStyle, number][]
      const primary = sorted[0][0]
      const secondary = sorted[1][0]

      const response = await fetch('/api/kennisbank/tools/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolSlug: 'hechtingsstijl-quiz',
          toolType: 'ASSESSMENT',
          input: { answers: questions.length },
          output: {
            scores: finalScores,
            ranking: sorted,
            primary: {
              style: primary,
              name: styleInfo[primary].name,
              nameEn: styleInfo[primary].nameEn,
              score: sorted[0][1]
            },
            secondary: {
              style: secondary,
              name: styleInfo[secondary].name,
              score: sorted[1][1]
            }
          },
          score: sorted[0][1],
          metadata: {
            quizVersion: '1.0',
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

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex)
    const option = questions[currentQuestion].options[optionIndex]

    const newScores = { ...scores }
    Object.entries(option.scores).forEach(([style, score]) => {
      newScores[style as AttachmentStyle] += score
    })
    setScores(newScores)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedOption(null)
      } else {
        setIsComplete(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e']
        })
        saveResult(newScores)
      }
    }, 400)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScores({ secure: 0, anxious: 0, avoidant: 0, fearful: 0 })
    setIsComplete(false)
    setSelectedOption(null)
    setShareToken(null)
    setShowDisclaimer(true)
  }

  const getResults = () => {
    return Object.entries(scores).sort(([, a], [, b]) => b - a) as [AttachmentStyle, number][]
  }

  const getPrimaryStyle = (): AttachmentStyle => getResults()[0][0]
  const getSecondaryStyle = (): AttachmentStyle => getResults()[1][0]

  const copyShareLink = async () => {
    const url = shareToken
      ? `${window.location.origin}/kennisbank/tools/result/${shareToken}`
      : window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Disclaimer screen
  if (showDisclaimer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Belangrijk om te weten</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Dit is een <strong>educatieve zelftest</strong>, geen klinische diagnose</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Hechtingsstijlen zijn een spectrum - de meeste mensen zijn een mix</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Je hechtingsstijl kan veranderen door therapie en persoonlijke groei</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Bij zorgen, raadpleeg een professional</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Wat zijn hechtingsstijlen?</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Hechtingsstijlen beschrijven hoe we ons emotioneel verbinden met anderen.
            Ze worden gevormd in onze kindertijd maar kunnen veranderen.
            Begrip van je hechtingsstijl helpt bij het bouwen van gezondere relaties.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(styleInfo).map(([key, info]) => {
              const Icon = info.icon
              return (
                <div key={key} className={`${info.bgColor} ${info.borderColor} border rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${info.color}`} />
                    <span className={`font-medium ${info.color}`}>{info.name}</span>
                  </div>
                  <span className="text-gray-600">~{info.percentage}% van mensen</span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setShowDisclaimer(false)}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          Start de Quiz
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    )
  }

  if (isComplete) {
    const results = getResults()
    const primary = getPrimaryStyle()
    const secondary = getSecondaryStyle()
    const primaryInfo = styleInfo[primary]
    const secondaryInfo = styleInfo[secondary]
    const PrimaryIcon = primaryInfo.icon
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)

    const shareUrl = shareToken
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/kennisbank/tools/result/${shareToken}`
      : typeof window !== 'undefined' ? window.location.href : ''
    const shareText = `Mijn hechtingsstijl is ${primaryInfo.name}! Ontdek jouw hechtingsstijl:`

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Primary Result */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${primaryInfo.bgColor} rounded-2xl p-6 border-2 ${primaryInfo.borderColor} relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <PrimaryIcon className="w-full h-full" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-600">Jouw Dominante Hechtingsstijl</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl ${primaryInfo.bgColor} flex items-center justify-center border-2 border-white shadow-lg`}>
                <PrimaryIcon className={`w-8 h-8 ${primaryInfo.color}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${primaryInfo.color}`}>
                  {primaryInfo.name}
                </h2>
                <p className="text-gray-600">{Math.round((results[0][1] / totalScore) * 100)}% match</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {primaryInfo.description}
            </p>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Jouw Profiel</h3>
          </div>
          <div className="space-y-4">
            {results.map(([style, score], index) => {
              const info = styleInfo[style]
              const Icon = info.icon
              const percentage = Math.round((score / totalScore) * 100)

              return (
                <motion.div
                  key={style}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${info.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${info.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{info.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        style === 'secure' ? 'bg-emerald-500' :
                        style === 'anxious' ? 'bg-rose-500' :
                        style === 'avoidant' ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Characteristics */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Kenmerken van {primaryInfo.name}</h3>
          <ul className="space-y-2">
            {primaryInfo.characteristics.map((char, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className={`w-4 h-4 ${primaryInfo.color} mt-0.5 flex-shrink-0`} />
                <span>{char}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Growth Tips */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">Tips voor Groei</h3>
          </div>
          <ul className="space-y-2">
            {primaryInfo.growthTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* In Relationships */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-rose-50 rounded-xl p-6 border border-rose-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-gray-900">In Relaties</h3>
          </div>
          <p className="text-gray-700">{primaryInfo.inRelationships}</p>
        </motion.div>

        {/* Professional Help Notice */}
        {(primary === 'fearful' || primary === 'anxious') && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-blue-50 rounded-xl p-6 border border-blue-100"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Overweeg Professionele Hulp</h3>
                <p className="text-sm text-blue-800">
                  Therapie kan zeer effectief zijn om hechtingspatronen te veranderen.
                  Een relatietherapeut of psycholoog kan je helpen om gezondere relaties op te bouwen.
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
            {isSaving && <span className="text-sm text-gray-400">Opslaan...</span>}
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
            <button
              onClick={copyShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Gekopieerd!' : 'Kopieer Link'}</span>
            </button>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetQuiz}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Opnieuw doen
          </button>
          <a
            href="/kennisbank/relaties/hechtingsstijlen"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            Meer over Hechtingsstijlen
          </a>
        </div>
      </motion.div>
    )
  }

  // Quiz Questions
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
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
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
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedOption !== null}
                  whileHover={{ scale: selectedOption === null ? 1.01 : 1 }}
                  whileTap={{ scale: selectedOption === null ? 0.99 : 1 }}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } disabled:cursor-not-allowed`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-700 flex-1">{option.text}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
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

      <p className="text-center text-sm text-gray-500">
        Kies het antwoord dat het beste bij je past
      </p>
    </div>
  )
}
