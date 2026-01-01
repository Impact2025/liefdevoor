'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Heart,
  Coffee,
  Music,
  Camera,
  Plane,
  Book,
  Dumbbell,
  Utensils,
  Gamepad,
  Palette
} from 'lucide-react'

interface Interest {
  id: string
  label: string
  icon: typeof Heart
}

const interests: Interest[] = [
  { id: 'travel', label: 'Reizen', icon: Plane },
  { id: 'music', label: 'Muziek', icon: Music },
  { id: 'food', label: 'Eten & Koken', icon: Utensils },
  { id: 'fitness', label: 'Sport & Fitness', icon: Dumbbell },
  { id: 'photography', label: 'Fotografie', icon: Camera },
  { id: 'reading', label: 'Lezen', icon: Book },
  { id: 'gaming', label: 'Gaming', icon: Gamepad },
  { id: 'art', label: 'Kunst & Creativiteit', icon: Palette },
  { id: 'coffee', label: 'Koffie & Uitgaan', icon: Coffee },
]

type ToneType = 'playful' | 'sincere' | 'curious' | 'witty'

const tones: { id: ToneType; label: string; description: string }[] = [
  { id: 'playful', label: 'Speels', description: 'Luchtig en grappig' },
  { id: 'sincere', label: 'Oprecht', description: 'Eerlijk en direct' },
  { id: 'curious', label: 'Nieuwsgierig', description: 'Vragen stellend' },
  { id: 'witty', label: 'Gevat', description: 'Slim en origineel' },
]

// Pre-made icebreakers based on interests and tone
const icebreakers: Record<string, Record<ToneType, string[]>> = {
  travel: {
    playful: [
      "Als je morgen een vliegticket kreeg naar een willekeurige bestemming, waar hoop je dan dat het vliegtuig landt? ✈️",
      "Je profiel doet me denken aan iemand die interessante reisverhalen heeft. Wat is je meest bizarre reisavontuur?",
      "Op een schaal van 'all-inclusive resort' tot 'backpacken door de jungle' – wat voor reiziger ben jij? 🎒",
    ],
    sincere: [
      "Ik zag dat je van reizen houdt! Wat is de plek die de meeste indruk op je heeft gemaakt?",
      "Welke bestemming staat nog bovenaan je bucket list?",
      "Ik ben altijd nieuwsgierig naar reisverhalen. Welke reis heeft je het meest veranderd?",
    ],
    curious: [
      "Wat is je favoriete manier om een nieuwe stad te ontdekken? Plannen of je laten verrassen?",
      "Ik vraag me af: ben je meer een stadsmens of ga je liever de natuur in tijdens het reizen?",
      "Reis je liever alleen of met gezelschap? Ik ben benieuwd naar je reden!",
    ],
    witty: [
      "Ze zeggen dat reizen de geest verrijkt. Hoeveel 'geestelijke rijkdom' heb jij al verzameld? 🧳",
      "Als je een frequent flyer programma hebt, ben je dan ook frequent interessant? (Je profiel suggereert van wel)",
      "Volgens je profiel reis je graag. Grote vraag: window seat of gangpad?",
    ],
  },
  music: {
    playful: [
      "Snel: welk nummer zou er spelen als je je leven een soundtrack zou geven? 🎵",
      "Als je muziek moest maken, zou je dan rock, jazz of stiekem K-pop kiezen?",
      "Festival of intiem optreden in een kroeg – waar vind ik jou? 🎸",
    ],
    sincere: [
      "Muziek kan zoveel emoties oproepen. Welk nummer raakt jou het meest?",
      "Ik zag dat je van muziek houdt. Wat voor rol speelt muziek in je dagelijks leven?",
      "Heb je een artiest die je live zou willen zien, maar nog niet hebt kunnen bezoeken?",
    ],
    curious: [
      "Ik ben nieuwsgierig: speel je zelf een instrument of geniet je vooral van luisteren?",
      "Wat was het laatste concert dat je hebt bezocht?",
      "Hoe ontdek jij nieuwe muziek? Spotify algoritmes of aanbevelingen van vrienden?",
    ],
    witty: [
      "Als jouw muziekssmaak een wijn was, zou het dan een complexe rode zijn of een verfrissende rosé?",
      "Belangrijke vraag: guilty pleasure liedjes die je alleen zingt als niemand kijkt?",
      "Ze zeggen dat muziekssmaak veel over iemand zegt. Wat vertelt die van jou? 🎼",
    ],
  },
  food: {
    playful: [
      "Pizza discussie: ananas erop, ja of nee? Dit bepaalt of we kunnen matchen 🍕",
      "Als je één gerecht de rest van je leven mocht eten, welke zou dat zijn?",
      "Op een schaal van instant noodles tot vijfgangendiner – hoe is je kookniveau? 👨‍🍳",
    ],
    sincere: [
      "Ik zag dat je van eten houdt! Wat is jouw comfort food na een lange dag?",
      "Heb je een favoriet restaurant dat je aan iedereen zou aanraden?",
      "Koken of bestellen – wat heeft je voorkeur op een doordeweekse avond?",
    ],
    curious: [
      "Wat is het meest bijzondere gerecht dat je ooit hebt geprobeerd?",
      "Ben je avontuurlijk met eten of blijf je liever bij wat je kent?",
      "Als je een land zou kiezen puur op basis van de keuken, waar ga je naartoe?",
    ],
    witty: [
      "Ik probeer te bepalen of je een 'maakt niet uit waar we eten' of een 'ik weet precies wat ik wil' persoon bent",
      "Ze zeggen dat de weg naar het hart door de maag gaat. Wat is jouw shortcut? 🍝",
      "Als je een gerecht was, zou je dan een betrouwbare pasta zijn of een verrassende fusion?",
    ],
  },
  fitness: {
    playful: [
      "Ben je team 6 uur 's ochtends hardlopen of team 'snooze vijf keer'? 🏃",
      "Als sporten een Tinder profiel had, zou jij dan swipen? Links of rechts?",
      "Gym, buitensport, of yoga in je woonkamer – wat is jouw style?",
    ],
    sincere: [
      "Sport lijkt belangrijk voor je. Wat motiveert je om actief te blijven?",
      "Heb je een fitnessdoel waar je naartoe werkt?",
      "Wat is je favoriete manier om te bewegen?",
    ],
    curious: [
      "Train je liever alleen of met anderen?",
      "Heb je ooit een sport geprobeerd die je totaal verraste?",
      "Wat geeft je meer energie: cardio of krachttraining?",
    ],
    witty: [
      "Ik zie dat je actief bent. Hoop dat je ook de energie hebt voor eindeloze gesprekken! 💪",
      "Als eerste date naar de sportschool zou gaan, zou dat dan een red flag zijn of een green flag?",
      "Ze zeggen 'no pain, no gain'. Geldt dat ook voor dating?",
    ],
  },
  photography: {
    playful: [
      "Als je leven een Instagram feed was, zou het dan aesthetic of chaotisch zijn? 📸",
      "Team 'perfecte foto' of team 'eerste poging is goed genoeg'?",
      "Filters: ja of nee? Dit is belangrijk 😄",
    ],
    sincere: [
      "Ik zag dat je van fotografie houdt. Wat fotografeer je het liefst?",
      "Heb je een foto die je het meest trots op bent?",
      "Wat trekt je aan in fotografie?",
    ],
    curious: [
      "Smartphone of camera – wat heeft je voorkeur voor het vastleggen van momenten?",
      "Wat is je favoriete onderwerp om te fotograferen?",
      "Heb je een fotograaf die je inspireert?",
    ],
    witty: [
      "Als je een lens was, zou je dan een wide-angle (alles meekrijgen) of een telelens (focus op details) zijn?",
      "De belangrijke vraag: hoeveel onbewerkte foto's staan er op je telefoon? 📱",
      "Ze zeggen een foto zegt meer dan duizend woorden. Wat zegt jouw profielfoto?",
    ],
  },
  reading: {
    playful: [
      "Als je een boek was, zou je dan een pageturner zijn of een slow burn? 📚",
      "Team fysiek boek of team e-reader? Dit is een dealbreaker 😄",
      "Hoeveel boeken liggen er 'nog te lezen' op je nachtkastje?",
    ],
    sincere: [
      "Ik zag dat je van lezen houdt. Welk boek heeft de meeste impact op je gehad?",
      "Wat lees je momenteel?",
      "Heb je een favoriete auteur die je zou aanraden?",
    ],
    curious: [
      "Fictie of non-fictie – wat trekt je meer?",
      "Hoe kies je je volgende boek? Recensies, aanbevelingen, of gewoon de cover?",
      "Lees je één boek tegelijk of meerdere door elkaar?",
    ],
    witty: [
      "Als je dating leven een boekgenre was, zou het dan romantiek, thriller of misschien komedie zijn?",
      "Ik hoop dat je net zo interessant bent als je boekensmaak suggereert 📖",
      "Ze zeggen 'don't judge a book by its cover', maar profielen mogen we toch beoordelen?",
    ],
  },
  gaming: {
    playful: [
      "Co-op of versus – hoe competitief ben je? 🎮",
      "Als we zouden gamen op een eerste date, zou je me laten winnen of genadeloos verslaan?",
      "Console, PC of mobile gamer? Dit bepaalt alles 😄",
    ],
    sincere: [
      "Ik zag dat je gamet. Welk spel speelt de grootste rol in je leven?",
      "Wat trekt je aan in gaming?",
      "Heb je een game die je altijd weer opnieuw speelt?",
    ],
    curious: [
      "Single player voor het verhaal of multiplayer voor de chaos?",
      "Wat is je all-time favorite game en waarom?",
      "Speel je competitief of meer casual?",
    ],
    witty: [
      "Als dating een game was, zou ik dan punten scoren met dit bericht? 🕹️",
      "Ze zeggen 'all's fair in love and war'. Geldt dat ook voor Mario Kart?",
      "Belangrijke vraag: save scummer of iron man mode door het leven?",
    ],
  },
  art: {
    playful: [
      "Als je een kunststroming was, zou je dan impressionisme (zachte lijnen) of expressionisme (intense emotie) zijn? 🎨",
      "Museum date: ja of te cliché?",
      "Modern art: 'dit snap ik' of 'mijn neefje van 5 kan dit ook'?",
    ],
    sincere: [
      "Ik zag dat je creatief bent. Welke kunstvorm spreekt je het meest aan?",
      "Maak je zelf kunst of ben je meer een bewonderaar?",
      "Is er een kunstwerk dat je echt heeft geraakt?",
    ],
    curious: [
      "Waar haal jij je creatieve inspiratie vandaan?",
      "Heb je een favoriete kunstenaar of periode?",
      "Als je één kunstwerk mocht bezitten, welke zou dat zijn?",
    ],
    witty: [
      "Als ons gesprek een schilderij was, hoop ik op een meesterwerk en niet op abstract expressionisme 🖼️",
      "Ze zeggen schoonheid zit in het oog van de aanschouwer. Wat zie jij?",
      "Belangrijk: Picasso's blauwe periode of roze periode?",
    ],
  },
  coffee: {
    playful: [
      "Zwarte koffie of iets met zoveel siroop dat het eigenlijk dessert is? ☕",
      "Als je een koffie was, zou je dan een sterke espresso zijn of een gezellige latte?",
      "Ochtendmens of avondmens? (Je koffie-intake zegt waarschijnlijk genoeg 😄)",
    ],
    sincere: [
      "Koffie of thee persoon? Ik ben nieuwsgierig!",
      "Heb je een favoriete koffietent in de stad?",
      "Wat is jouw perfecte zondag? (Koffie hoort er vast bij)",
    ],
    curious: [
      "Drink je koffie voor de smaak of voor de cafeïne?",
      "Thuiswerken met goede koffie of naar een café voor de sfeer?",
      "Hoe drink jij het liefst je koffie?",
    ],
    witty: [
      "Ze zeggen dat je iemand kunt leren kennen aan hun koffiebestelling. Wat is de jouwe?",
      "Als we koffie gaan drinken, moet ik je dan waarschuwen dat ik erover kan doorgaan? ☕",
      "Eerste date bij een hippe koffietent of gewoon bij de AH to go? Eerlijke antwoorden 😄",
    ],
  },
}

// Generic icebreakers for when no specific interest is selected
const genericIcebreakers: Record<ToneType, string[]> = {
  playful: [
    "Als je een superkracht mocht kiezen, welke zou dat zijn en waarom? 🦸",
    "Stel: je krijgt morgen vrij. Wat doe je met die dag?",
    "Als je leven een film was, welk genre zou het zijn? 🎬",
    "Twee truths en een leugen – jij begint!",
  ],
  sincere: [
    "Hey! Ik vond je profiel interessant. Wat houdt je op dit moment het meest bezig?",
    "Ik ben benieuwd: wat is het leukste dat je deze week hebt gedaan?",
    "Wat doe je het liefst in je vrije tijd?",
    "Waar word jij blij van?",
  ],
  curious: [
    "Als je één vraag mocht stellen aan wie dan ook (levend of dood), wie en wat?",
    "Wat is iets dat weinig mensen over je weten?",
    "Waar ben je op dit moment het meest nieuwsgierig naar?",
    "Als je één ding aan je leven zou kunnen veranderen, wat zou dat zijn?",
  ],
  witty: [
    "Ze zeggen 'Hey' is een saaie opener. Dus hier ben ik, niet met 'hey'. Gedachten?",
    "Ik probeer een originele opener te bedenken, maar je profiel leidde me af 😄",
    "Op een schaal van 'leest nooit berichten' tot 'reageert meteen' – waar sta jij?",
    "Dit is mijn poging om geen 'hey' te sturen. Hoe doe ik het?",
  ],
}

export default function IcebreakerGenerator() {
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)
  const [selectedTone, setSelectedTone] = useState<ToneType>('playful')
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateIcebreakers = () => {
    let messages: string[]

    if (selectedInterest && icebreakers[selectedInterest]) {
      messages = [...icebreakers[selectedInterest][selectedTone]]
    } else {
      messages = [...genericIcebreakers[selectedTone]]
    }

    // Shuffle
    messages.sort(() => Math.random() - 0.5)
    setGeneratedMessages(messages.slice(0, 3))
    setCopiedIndex(null)
  }

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const refreshMessages = () => {
    generateIcebreakers()
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Select Interest */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          1. Kies een interesse van hun profiel (optioneel)
        </label>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => {
            const Icon = interest.icon
            const isSelected = selectedInterest === interest.id

            return (
              <button
                key={interest.id}
                onClick={() =>
                  setSelectedInterest(isSelected ? null : interest.id)
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {interest.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Select Tone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          2. Kies je toon
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`p-3 rounded-lg text-sm text-center transition-all ${
                selectedTone === tone.id
                  ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <span className="font-medium block">{tone.label}</span>
              <span className="text-xs text-gray-500">{tone.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateIcebreakers}
        className="w-full flex items-center justify-center gap-2 py-4 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
      >
        <Sparkles className="w-5 h-5" />
        Genereer Openingszinnen
      </button>

      {/* Generated Messages */}
      {generatedMessages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Suggesties</h3>
            <button
              onClick={refreshMessages}
              className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
            >
              <RefreshCw className="w-4 h-4" />
              Vernieuw
            </button>
          </div>

          {generatedMessages.map((message, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 border border-gray-200"
            >
              <p className="text-gray-800 mb-3">{message}</p>
              <button
                onClick={() => copyToClipboard(message, index)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  copiedIndex === index
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-4 h-4" />
                    Gekopieerd!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Kopieer
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Tips voor je Eerste Bericht
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Personaliseer het bericht naar hun profiel</li>
          <li>• Stel een vraag om een gesprek te starten</li>
          <li>• Houd het luchtig en niet te lang</li>
          <li>• Wees jezelf - authenticiteit werkt het beste</li>
        </ul>
      </div>
    </div>
  )
}
