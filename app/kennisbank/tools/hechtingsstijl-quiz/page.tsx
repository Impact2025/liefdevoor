import { Metadata } from 'next'
import AttachmentStyleQuiz from '@/components/kennisbank/tools/AttachmentStyleQuiz'
import { KennisbankBreadcrumb } from '@/components/kennisbank'
import { Shield, Clock, Users, Brain } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hechtingsstijl Quiz | Ontdek Jouw Relatiepatronen | Liefde voor Iedereen',
  description: 'Ontdek jouw hechtingsstijl met deze wetenschappelijk onderbouwde quiz. Leer hoe je je hecht in relaties en krijg tips voor gezondere verbindingen.',
  keywords: ['hechtingsstijl', 'attachment style', 'relatiepatronen', 'veilig gehecht', 'angstig gehecht', 'vermijdend gehecht', 'relatie quiz'],
  openGraph: {
    title: 'Hechtingsstijl Quiz | Ontdek Jouw Relatiepatronen',
    description: 'Ontdek jouw hechtingsstijl en leer hoe je gezondere relaties kunt opbouwen.',
    type: 'website',
  }
}

const features = [
  {
    icon: Brain,
    title: 'Wetenschappelijk',
    description: 'Gebaseerd op hechtingstheorie'
  },
  {
    icon: Clock,
    title: '3-5 minuten',
    description: '12 vragen'
  },
  {
    icon: Users,
    title: '4 Stijlen',
    description: 'Veilig, angstig, vermijdend, angstig-vermijdend'
  },
  {
    icon: Shield,
    title: 'Privacy',
    description: 'Anoniem mogelijk'
  }
]

export default function HechtingsstijlQuizPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <KennisbankBreadcrumb
            items={[
              { label: 'Kennisbank', href: '/kennisbank' },
              { label: 'Tools', href: '/kennisbank/tools' },
              { label: 'Hechtingsstijl Quiz' }
            ]}
          />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Hechtingsstijl Quiz
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ontdek hoe jij je hecht in romantische relaties en krijg inzicht in je relatiepatronen.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-200 text-center"
            >
              <feature.icon className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Quiz Component */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <AttachmentStyleQuiz />
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Wat zijn hechtingsstijlen?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Hechtingsstijlen zijn patronen in hoe we emotionele banden vormen met anderen.
              Ze ontwikkelen zich in de kindertijd maar kunnen veranderen door bewustwording,
              therapie en gezonde relaties. Er zijn vier hoofdstijlen: veilig, angstig,
              vermijdend en angstig-vermijdend.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Waarom is dit belangrijk?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Begrip van je hechtingsstijl helpt je om:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Je relatiepatronen te herkennen</li>
              <li>• Beter te communiceren met partners</li>
              <li>• Gezondere keuzes te maken in de liefde</li>
              <li>• Gericht te werken aan persoonlijke groei</li>
            </ul>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Gerelateerde Tools</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/kennisbank/tools/liefdetaal-quiz"
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-rose-200 transition-colors">
                <span className="text-xl">💬</span>
              </div>
              <h4 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                Liefdetaal Quiz
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Ontdek hoe jij liefde geeft en ontvangt
              </p>
            </a>

            <a
              href="/kennisbank/tools/compatibility-quiz"
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                <span className="text-xl">💑</span>
              </div>
              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Compatibiliteit Quiz
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Test jullie relatie-compatibiliteit
              </p>
            </a>

            <a
              href="/kennisbank/tools/dating-readiness"
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <span className="text-xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                Dating Readiness
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Ben je klaar om te daten?
              </p>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
