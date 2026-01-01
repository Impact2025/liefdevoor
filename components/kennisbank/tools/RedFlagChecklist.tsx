'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Shield,
  Heart,
  MessageCircle,
  User,
  DollarSign,
  MapPin
} from 'lucide-react'

interface RedFlag {
  id: string
  text: string
  category: string
  severity: 'high' | 'medium' | 'low'
  explanation: string
}

const redFlags: RedFlag[] = [
  // Communication Red Flags
  {
    id: 'fast-love',
    text: 'Zegt heel snel "Ik hou van je" of praat over trouwen',
    category: 'Communicatie',
    severity: 'high',
    explanation: 'Love bombing is een veelgebruikte tactiek bij oplichters en manipulators.',
  },
  {
    id: 'pressure-meet',
    text: 'Dringt aan op snel afspreken ondanks jouw twijfels',
    category: 'Communicatie',
    severity: 'medium',
    explanation: 'Gezonde relaties respecteren grenzen en tempo van beide partijen.',
  },
  {
    id: 'guilt-trip',
    text: 'Maakt je schuldig als je niet direct reageert',
    category: 'Communicatie',
    severity: 'medium',
    explanation: 'Dit is een vorm van emotionele manipulatie en controlerend gedrag.',
  },
  {
    id: 'avoids-calls',
    text: 'Weigert te videobellen of belt altijd met camera uit',
    category: 'Communicatie',
    severity: 'high',
    explanation: 'Dit kan duiden op catfishing of dat iemand iets verbergt.',
  },
  {
    id: 'inconsistent-stories',
    text: 'Vertelt tegenstrijdige verhalen over zichzelf',
    category: 'Communicatie',
    severity: 'high',
    explanation: 'Inconsistenties kunnen wijzen op leugens of een verzonnen identiteit.',
  },

  // Behavior Red Flags
  {
    id: 'controls-contacts',
    text: 'Wil weten met wie je praat en checkt je telefoon',
    category: 'Gedrag',
    severity: 'high',
    explanation: 'Controlerend gedrag is een belangrijke waarschuwing voor een ongezonde relatie.',
  },
  {
    id: 'isolates',
    text: 'Probeert je te isoleren van vrienden en familie',
    category: 'Gedrag',
    severity: 'high',
    explanation: 'Isolatie is een tactiek die vaak voorkomt bij misbruik.',
  },
  {
    id: 'mood-swings',
    text: 'Extreem wisselende stemmingen (heel lief, dan ineens boos)',
    category: 'Gedrag',
    severity: 'medium',
    explanation: 'Dit patroon kan wijzen op manipulatie of emotionele instabiliteit.',
  },
  {
    id: 'no-respect-boundaries',
    text: 'Negeert of minimaliseert jouw grenzen',
    category: 'Gedrag',
    severity: 'high',
    explanation: 'Respect voor grenzen is essentieel in elke gezonde relatie.',
  },
  {
    id: 'blames-others',
    text: 'Geeft altijd anderen de schuld, neemt geen verantwoordelijkheid',
    category: 'Gedrag',
    severity: 'medium',
    explanation: 'Dit patroon kan wijzen op narcistische trekken of emotionele onvolwassenheid.',
  },

  // Financial Red Flags
  {
    id: 'asks-money',
    text: 'Vraagt om geld (voor wat voor reden dan ook)',
    category: 'Financieel',
    severity: 'high',
    explanation: 'Vraag NOOIT om geld is een absolute regel bij online daten.',
  },
  {
    id: 'financial-emergency',
    text: 'Heeft steeds financiële "noodgevallen"',
    category: 'Financieel',
    severity: 'high',
    explanation: 'Dit is een klassiek scam-patroon.',
  },
  {
    id: 'crypto-investment',
    text: 'Wil dat je investeert in crypto of een trading platform',
    category: 'Financieel',
    severity: 'high',
    explanation: 'Dit is pig butchering: een groeiende vorm van dating fraude.',
  },
  {
    id: 'expensive-lifestyle',
    text: 'Pronkt met dure spullen maar heeft altijd geldproblemen',
    category: 'Financieel',
    severity: 'medium',
    explanation: 'Inconsistentie tussen levensstijl en financiële situatie is verdacht.',
  },

  // Profile Red Flags
  {
    id: 'too-perfect-photos',
    text: 'Foto\'s lijken te professioneel of als model',
    category: 'Profiel',
    severity: 'medium',
    explanation: 'Oplichters gebruiken vaak gestolen foto\'s van modellen of influencers.',
  },
  {
    id: 'few-photos',
    text: 'Heeft maar 1-2 foto\'s en weigert meer te sturen',
    category: 'Profiel',
    severity: 'medium',
    explanation: 'Dit kan wijzen op catfishing of een gestolen identiteit.',
  },
  {
    id: 'vague-bio',
    text: 'Profiel is vaag of heeft geen echte informatie',
    category: 'Profiel',
    severity: 'low',
    explanation: 'Een gebrek aan informatie kan onschuldig zijn, maar verdient aandacht.',
  },
  {
    id: 'claims-rich',
    text: 'Beweert heel rijk, succesvol of beroemd te zijn',
    category: 'Profiel',
    severity: 'medium',
    explanation: 'Opschepperij in profielen is vaak overdreven of gelogen.',
  },

  // Location Red Flags
  {
    id: 'far-away',
    text: 'Woont ver weg en kan nooit afspreken',
    category: 'Locatie',
    severity: 'medium',
    explanation: 'Lange-afstandsscams zijn een veelvoorkomende tactiek.',
  },
  {
    id: 'military-overseas',
    text: 'Zegt in het leger te zitten of op een olieplatform te werken',
    category: 'Locatie',
    severity: 'high',
    explanation: 'Dit zijn de meest voorkomende verzonnen beroepen bij scams.',
  },
  {
    id: 'always-traveling',
    text: 'Is altijd "op reis" en kan nooit videobellen',
    category: 'Locatie',
    severity: 'medium',
    explanation: 'Constante excuses voor geen persoonlijk contact zijn verdacht.',
  },
]

const categoryIcons: Record<string, typeof AlertTriangle> = {
  Communicatie: MessageCircle,
  Gedrag: User,
  Financieel: DollarSign,
  Profiel: Heart,
  Locatie: MapPin,
}

export default function RedFlagChecklist() {
  const [checkedFlags, setCheckedFlags] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Communicatie']))
  const [showResults, setShowResults] = useState(false)

  const toggleFlag = (id: string) => {
    const newChecked = new Set(checkedFlags)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedFlags(newChecked)
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const resetChecklist = () => {
    setCheckedFlags(new Set())
    setShowResults(false)
  }

  const calculateScore = () => {
    let score = 0
    checkedFlags.forEach((id) => {
      const flag = redFlags.find((f) => f.id === id)
      if (flag) {
        switch (flag.severity) {
          case 'high':
            score += 15
            break
          case 'medium':
            score += 8
            break
          case 'low':
            score += 3
            break
        }
      }
    })
    return Math.min(100, score)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 50) return { level: 'high', text: 'Hoog Risico', color: 'red' }
    if (score >= 25) return { level: 'medium', text: 'Gemiddeld Risico', color: 'amber' }
    if (score > 0) return { level: 'low', text: 'Licht Risico', color: 'yellow' }
    return { level: 'none', text: 'Geen Risico Gedetecteerd', color: 'green' }
  }

  const categories = Array.from(new Set(redFlags.map((f) => f.category)))

  if (showResults) {
    const score = calculateScore()
    const risk = getRiskLevel(score)
    const checkedFlagsArray = redFlags.filter((f) => checkedFlags.has(f.id))
    const highSeverityCount = checkedFlagsArray.filter((f) => f.severity === 'high').length

    return (
      <div className="space-y-6">
        {/* Result Header */}
        <div
          className={`rounded-2xl p-6 border-2 ${
            risk.color === 'red'
              ? 'bg-red-50 border-red-200'
              : risk.color === 'amber'
              ? 'bg-amber-50 border-amber-200'
              : risk.color === 'yellow'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                risk.color === 'red'
                  ? 'bg-red-100'
                  : risk.color === 'amber'
                  ? 'bg-amber-100'
                  : risk.color === 'yellow'
                  ? 'bg-yellow-100'
                  : 'bg-green-100'
              }`}
            >
              {risk.level === 'none' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : risk.level === 'low' ? (
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              ) : (
                <AlertTriangle
                  className={`w-8 h-8 ${risk.color === 'red' ? 'text-red-600' : 'text-amber-600'}`}
                />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-bold ${
                  risk.color === 'red'
                    ? 'text-red-700'
                    : risk.color === 'amber'
                    ? 'text-amber-700'
                    : risk.color === 'yellow'
                    ? 'text-yellow-700'
                    : 'text-green-700'
                }`}
              >
                {risk.text}
              </h3>
              <p className="text-gray-600 mt-1">
                {checkedFlags.size} van {redFlags.length} rode vlaggen aangevinkt
                {highSeverityCount > 0 && (
                  <span className="text-red-600 font-medium">
                    {' '}
                    ({highSeverityCount} ernstig)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Checked Flags Summary */}
        {checkedFlagsArray.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Geselecteerde Waarschuwingen</h4>
            <div className="space-y-3">
              {checkedFlagsArray.map((flag) => (
                <div
                  key={flag.id}
                  className={`p-3 rounded-lg ${
                    flag.severity === 'high'
                      ? 'bg-red-50'
                      : flag.severity === 'medium'
                      ? 'bg-amber-50'
                      : 'bg-yellow-50'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      flag.severity === 'high'
                        ? 'text-red-800'
                        : flag.severity === 'medium'
                        ? 'text-amber-800'
                        : 'text-yellow-800'
                    }`}
                  >
                    {flag.text}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{flag.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advice */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advies
          </h4>
          {risk.level === 'high' && (
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Overweeg serieus om dit contact te verbreken</li>
              <li>• Deel NOOIT geld, bankgegevens of persoonlijke documenten</li>
              <li>• Vertel een vriend of familielid over deze situatie</li>
              <li>• Meld dit profiel bij het dating platform</li>
            </ul>
          )}
          {risk.level === 'medium' && (
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Wees extra voorzichtig en neem de tijd</li>
              <li>• Vraag om een videogesprek om de identiteit te verifiëren</li>
              <li>• Deel geen financiële of zeer persoonlijke informatie</li>
              <li>• Praat met vrienden of familie over deze persoon</li>
            </ul>
          )}
          {(risk.level === 'low' || risk.level === 'none') && (
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Blijf alert, maar dit lijkt een gezondere situatie</li>
              <li>• Blijf op je intuïtie vertrouwen</li>
              <li>• Bouw geleidelijk vertrouwen op</li>
              <li>• Kom deze checklist opnieuw bekijken als er iets verandert</li>
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetChecklist}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Opnieuw Invullen
          </button>
          <button
            onClick={() => setShowResults(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Aanpassen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p>
          Vink alle punten aan die van toepassing zijn op de persoon die je online hebt ontmoet.
          Hoe meer punten je aanvinkt, hoe groter het risico.
        </p>
      </div>

      {/* Categories */}
      {categories.map((category) => {
        const categoryFlags = redFlags.filter((f) => f.category === category)
        const checkedCount = categoryFlags.filter((f) => checkedFlags.has(f.id)).length
        const isExpanded = expandedCategories.has(category)
        const CategoryIcon = categoryIcons[category] || AlertTriangle

        return (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <span className="flex items-center gap-3">
                <CategoryIcon className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-900">{category}</span>
                {checkedCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    {checkedCount}
                  </span>
                )}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100">
                {categoryFlags.map((flag) => (
                  <label
                    key={flag.id}
                    className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                      checkedFlags.has(flag.id) ? 'bg-red-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedFlags.has(flag.id)}
                      onChange={() => toggleFlag(flag.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900">{flag.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            flag.severity === 'high'
                              ? 'bg-red-100 text-red-700'
                              : flag.severity === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {flag.severity === 'high'
                            ? 'Ernstig'
                            : flag.severity === 'medium'
                            ? 'Gemiddeld'
                            : 'Licht'}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Submit Button */}
      <button
        onClick={() => setShowResults(true)}
        className="w-full flex items-center justify-center gap-2 py-4 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700"
      >
        <Shield className="w-5 h-5" />
        Bekijk Resultaat ({checkedFlags.size} geselecteerd)
      </button>
    </div>
  )
}
