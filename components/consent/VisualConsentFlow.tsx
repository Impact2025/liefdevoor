'use client'

/**
 * VisualConsentFlow - Complete visuele consent flow voor LVB
 *
 * "Comic Contract" methode:
 * - WAT: Welke gegevens worden verzameld
 * - WAAROM: Waarvoor worden ze gebruikt
 * - WIE: Wie kan deze gegevens zien
 *
 * Met grote Ja/Nee knoppen
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Heart, Lock, Check, X, Volume2 } from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { VisualConsentBlock } from './VisualConsentBlock'
import { GuidanceButton } from '@/components/ui/GuidanceButton'

interface VisualConsentFlowProps {
  onAccept: () => void
  onDecline: () => void
  type?: 'registration' | 'terms' | 'privacy' | 'photo'
  isLoading?: boolean
}

// Consent configurations
const consentConfigs = {
  registration: {
    title: 'Voordat je begint',
    subtitle: 'We leggen uit wat we met je gegevens doen',
    audioIntro: 'Voordat je begint willen we je uitleggen wat we met je gegevens doen. Luister goed naar de uitleg van elk blok.',
    blocks: [
      {
        type: 'what' as const,
        icon: '📝',
        title: 'Je naam en foto',
        description: 'Je naam, foto en wat je over jezelf vertelt',
        audioText: 'WAT we verzamelen: Je naam, je foto en wat je over jezelf vertelt. Dit is zodat andere mensen weten wie je bent.',
      },
      {
        type: 'why' as const,
        icon: '❤️',
        title: 'Om liefde te vinden',
        description: 'We gebruiken dit om je te helpen iemand te vinden',
        audioText: 'WAAROM we dit nodig hebben: We gebruiken je gegevens om je te helpen iemand te vinden die bij je past.',
      },
      {
        type: 'who' as const,
        icon: '🔒',
        title: 'Alleen leden',
        description: 'Alleen andere leden kunnen dit zien, niemand anders',
        audioText: 'WIE dit kan zien: Alleen andere leden van Liefde Voor Iedereen kunnen dit zien. We verkopen je gegevens nooit aan anderen.',
      },
    ],
    acceptText: 'Ja, ik snap het!',
    declineText: 'Nee, ik wil dit niet',
  },
  terms: {
    title: 'Onze afspraken',
    subtitle: 'Dit zijn de regels waar we ons aan houden',
    audioIntro: 'Dit zijn de regels van Liefde Voor Iedereen. Luister goed wat we afspreken.',
    blocks: [
      {
        type: 'what' as const,
        icon: '📋',
        title: 'De regels',
        description: 'We zijn aardig voor elkaar en respectvol',
        audioText: 'Wat wij afspreken: We zijn aardig voor elkaar. Geen gemene berichten, geen pesten.',
      },
      {
        type: 'why' as const,
        icon: '🛡️',
        title: 'Jouw veiligheid',
        description: 'Deze regels zijn er om iedereen veilig te houden',
        audioText: 'Waarom deze regels: Deze regels zijn er om jou en alle andere gebruikers veilig te houden.',
      },
      {
        type: 'who' as const,
        icon: '👮',
        title: 'Wij passen op',
        description: 'Als iemand zich niet aan de regels houdt, grijpen wij in',
        audioText: 'Wij passen op: Als iemand gemeen doet of zich niet aan de regels houdt, dan helpen wij jou en pakken we het aan.',
      },
    ],
    acceptText: 'Ik ga akkoord!',
    declineText: 'Ik ga niet akkoord',
  },
  privacy: {
    title: 'Jouw privacy',
    subtitle: 'Hoe we met je gegevens omgaan',
    audioIntro: 'Dit gaat over jouw privacy. Hoe we met je gegevens omgaan.',
    blocks: [
      {
        type: 'what' as const,
        icon: '💾',
        title: 'We bewaren dit',
        description: 'Je naam, email, en wat je deelt op je profiel',
        audioText: 'Wat we bewaren: Je naam, je email adres, en alles wat je op je profiel zet.',
      },
      {
        type: 'why' as const,
        icon: '🔐',
        title: 'Veilig opgeslagen',
        description: 'Je gegevens staan veilig op een beveiligde plek',
        audioText: 'Hoe we het bewaren: Je gegevens staan veilig opgeslagen. Niemand kan erbij zonder toestemming.',
      },
      {
        type: 'who' as const,
        icon: '🚫',
        title: 'Niet verkopen',
        description: 'We verkopen je gegevens NOOIT aan anderen',
        audioText: 'Belangrijk: We verkopen je gegevens NOOIT aan anderen. Nooit. Je gegevens zijn van jou.',
      },
    ],
    acceptText: 'Ik begrijp het',
    declineText: 'Ik begrijp het niet',
  },
  photo: {
    title: 'Je foto delen',
    subtitle: 'Wie kan jouw foto zien?',
    audioIntro: 'Hier leggen we uit wie jouw foto kan zien.',
    blocks: [
      {
        type: 'what' as const,
        icon: '📸',
        title: 'Je profielfoto',
        description: 'De foto die je upload als profielfoto',
        audioText: 'Dit gaat over je profielfoto. De foto die je upload zodat anderen weten hoe je eruit ziet.',
      },
      {
        type: 'why' as const,
        icon: '👀',
        title: 'Anderen zien dit',
        description: 'Mensen kunnen je foto zien als ze je profiel bekijken',
        audioText: 'Waarom: Andere leden zien je foto als ze je profiel bekijken. Zo weten ze wie je bent.',
      },
      {
        type: 'who' as const,
        icon: '🔒',
        title: 'Alleen leden',
        description: 'Alleen ingelogde leden kunnen je foto zien',
        audioText: 'Wie: Alleen mensen die lid zijn van Liefde Voor Iedereen en ingelogd zijn kunnen je foto zien.',
      },
    ],
    acceptText: 'Ja, dit is goed',
    declineText: 'Nee, liever niet',
  },
}

export function VisualConsentFlow({
  onAccept,
  onDecline,
  type = 'registration',
  isLoading = false,
}: VisualConsentFlowProps) {
  const { speakForced, isLVBMode } = useAccessibility()
  const [hasListened, setHasListened] = useState(false)
  const config = consentConfigs[type]

  // Auto-play intro in LVB mode
  useEffect(() => {
    if (isLVBMode && !hasListened) {
      const timer = setTimeout(() => {
        speakForced(config.audioIntro)
        setHasListened(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLVBMode, hasListened, config.audioIntro, speakForced])

  const handlePlayAll = () => {
    const fullText = `${config.audioIntro} ${config.blocks.map(b => b.audioText).join(' ')}`
    speakForced(fullText)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {config.title}
        </h2>
        <p className="text-xl text-slate-600">
          {config.subtitle}
        </p>

        {/* Listen all button for LVB */}
        {isLVBMode && (
          <button
            onClick={handlePlayAll}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-semibold hover:bg-purple-200 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
            Luister alles
          </button>
        )}
      </motion.div>

      {/* Consent blocks */}
      <div className="space-y-6 mb-10">
        <AnimatePresence mode="wait">
          {config.blocks.map((block, index) => (
            <motion.div
              key={block.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <VisualConsentBlock
                type={block.type}
                icon={block.icon}
                title={block.title}
                description={block.description}
                audioText={block.audioText}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        {/* Accept button (primary action) */}
        <GuidanceButton
          label={config.acceptText}
          icon={<Check className="w-8 h-8" />}
          audioText={`Klik hier om akkoord te gaan. Dit betekent dat je begrijpt wat we hebben uitgelegd.`}
          onClick={onAccept}
          variant="success"
          size="xlarge"
          loading={isLoading}
        />

        {/* Decline button */}
        <GuidanceButton
          label={config.declineText}
          icon={<X className="w-6 h-6" />}
          audioText={`Klik hier als je niet akkoord gaat of als je het niet begrijpt. Je kunt altijd hulp vragen.`}
          onClick={onDecline}
          variant="secondary"
          size="large"
          disabled={isLoading}
        />
      </motion.div>

      {/* Help text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-slate-500 mt-6"
      >
        💡 Begrijp je iets niet? Vraag hulp aan je begeleider.
      </motion.p>
    </div>
  )
}

export default VisualConsentFlow
