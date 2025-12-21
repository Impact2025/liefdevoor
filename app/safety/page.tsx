/**
 * Safety Center - Wereldklasse Safety Resources
 *
 * Comprehensive safety tips, guides, and resources for users
 */

'use client'

import { Shield, AlertTriangle, Lock, Eye, Heart, Phone, MessageCircle, Ban, Flag } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SafetyCenterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Veiligheidscentrum</h1>
          </div>
          <p className="text-rose-100 text-lg">
            Jouw veiligheid is onze hoogste prioriteit. Lees onze tips en richtlijnen.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ActionCard
              icon={<Flag />}
              title="Rapporteer een gebruiker"
              description="Meld ongepast gedrag"
              color="orange"
            />
            <ActionCard
              icon={<Ban />}
              title="Blokkeer een gebruiker"
              description="Stop contact permanent"
              color="red"
            />
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Veiligheidstips</h2>
          <div className="space-y-4">
            <SafetyTip
              icon={<Eye />}
              title="Bescherm je privacy"
              tips={[
                'Deel nooit je volledige naam, adres of werkplek',
                'Gebruik geen herkenbare achtergronden in foto\'s',
                'Wees voorzichtig met het delen van persoonlijke details',
              ]}
            />
            <SafetyTip
              icon={<MessageCircle />}
              title="Online gesprekken"
              tips={[
                'Chat eerst uitgebreid voordat je afspreekt',
                'Vertrouw je gevoel - als iets niet klopt, stop het contact',
                'Stuur nooit geld of financiële informatie',
              ]}
            />
            <SafetyTip
              icon={<Heart />}
              title="Eerste afspraak"
              tips={[
                'Spreek af op een openbare plek',
                'Vertel een vriend(in) waar je bent',
                'Regel je eigen vervoer',
                'Blijf nuchter en alert',
              ]}
            />
            <SafetyTip
              icon={<Lock />}
              title="Account beveiliging"
              tips={[
                'Gebruik een sterk, uniek wachtwoord',
                'Schakel verificatie in voor extra veiligheid',
                'Log uit op gedeelde apparaten',
              ]}
            />
          </div>
        </div>

        {/* Red Flags */}
        <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Rode Vlaggen - Pas Op!</h2>
          </div>
          <ul className="space-y-2 text-red-800">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Vraagt om geld, cadeaubonnen of financiële hulp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Wil snel van het platform af naar WhatsApp/Telegram</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Profiel foto's lijken professioneel of stockfoto's</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Inconsistente verhalen of ontwijkende antwoorden</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Pusht voor ontmoeting op afgelegen locatie</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Agressief, controlerend of respectloos gedrag</span>
            </li>
          </ul>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Noodcontacten</h2>
          </div>
          <div className="space-y-3">
            <EmergencyContact
              name="Politie (spoed)"
              number="112"
              description="Bij directe dreiging of gevaar"
            />
            <EmergencyContact
              name="Politie (niet-spoed)"
              number="0900-8844"
              description="Voor aangifte of advies"
            />
            <EmergencyContact
              name="Slachtofferhulp"
              number="0900-0101"
              description="Emotionele ondersteuning"
            />
            <EmergencyContact
              name="Korrelatie"
              number="088-0220000"
              description="Bij seksueel geweld"
            />
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gedragsregels</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">
              Onze community waardeert respect, eerlijkheid en vriendelijkheid. Gedrag dat niet wordt getolereerd:
            </p>
            <ul className="text-gray-700 space-y-2 mt-3">
              <li>Intimidatie, bedreigingen of lastigvallen</li>
              <li>Haatzaaien of discriminatie</li>
              <li>Seksueel ongepast gedrag</li>
              <li>Spam, scams of oplichting</li>
              <li>Neppe profielen of identiteitsdiefstal</li>
              <li>Minderjarigen op het platform</li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>Overtredingen worden serieus genomen</strong> en kunnen leiden tot schorsing of permanente verwijdering van het platform.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
          >
            Terug
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'orange' | 'red'
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    red: 'bg-red-100 text-red-600 border-red-200',
  }

  return (
    <button className={`flex items-start gap-3 p-4 rounded-xl border-2 hover:shadow-md transition-all ${colorClasses[color]}`}>
      <div className="mt-0.5">{icon}</div>
      <div className="text-left">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  )
}

function SafetyTip({ icon, title, tips }: {
  icon: React.ReactNode
  title: string
  tips: string[]
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 flex-shrink-0 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <ul className="space-y-1">
          {tips.map((tip, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-rose-500 font-bold mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function EmergencyContact({ name, number, description }: {
  name: string
  number: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
      <div>
        <h3 className="font-bold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <a
        href={`tel:${number}`}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
      >
        {number}
      </a>
    </div>
  )
}
