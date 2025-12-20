/**
 * Over Ons Page - Minimalistisch & Professioneel
 *
 * De geschiedenis en missie van Liefde Voor Iedereen
 */

import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  Shield,
  Users,
  Sparkles,
  Target,
  Award,
  ArrowRight,
  CheckCircle2,
  Brain,
  Lightbulb,
  Globe
} from 'lucide-react'

export const metadata = {
  title: 'Over Ons - Liefde Voor Iedereen',
  description: '15 jaar ervaring in online dating. Van G-Date.nl naar Liefde Voor Iedereen - een platform waar toegankelijkheid de norm is voor iedereen.',
}

export default function OverOnsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-pink-50 to-stone-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-trust-100 rounded-full blur-3xl opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary-200 mb-6">
                <Heart className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-900">15 jaar ervaring sinds 2009</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Een nieuwe generatie dating
              </h1>

              <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                Sinds 2009 helpen wij singles om elkaar te vinden. Wat begon als G-Date.nl, later OogvoorLiefde.nl, is nu geëvolueerd naar <span className="font-semibold text-primary-700">Liefde Voor Iedereen</span>.
              </p>

              <p className="text-lg text-slate-600 mb-10">
                Een geavanceerd datingplatform dat voortbouwt op vijftien jaar ervaring, de innovaties van DatingAssistent.nl en de inzichten van duizenden succesvolle matches.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                  Gratis account aanmaken
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/prijzen"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors border-2 border-slate-200"
                >
                  Bekijk tarieven
                </Link>
              </div>
            </div>

            {/* Image Placeholder */}
            <div className="relative">
              <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-2xl bg-white">
                {/* Placeholder voor foto - vervang dit later met echte foto */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-trust-100 flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-20 h-20 text-primary-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Hero foto komt hier</p>
                  </div>
                </div>
                {/* Uncomment wanneer je foto hebt:
                <Image
                  src="/images/about-hero.jpg"
                  alt="Liefde Voor Iedereen"
                  fill
                  className="object-cover"
                  priority
                />
                */}
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">1000+</p>
                    <p className="text-sm text-slate-600">Succesvolle matches</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onze Oorsprong */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Onze oorsprong
            </h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full" />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              De directe aanleiding voor de oprichting was de eenzaamheid waar veel mensen over vertelden. <span className="font-semibold text-slate-900">Vincent van Munster</span>, onze oprichter, kwam dit tegen tijdens vrijwilligerswerk in 2009 bij een vakantie voor mensen met een lichamelijke beperking. Hij zag dat online dating destijds niet voor iedereen even toegankelijk was en nam het initiatief om daar verandering in te brengen.
            </p>

            <p className="text-lg text-slate-700 leading-relaxed">
              Wat volgde was een reis van 15 jaar waarin we uitgroeiden tot de grootste datingsite voor singles met een beperking in Nederland. Maar we leerden ook iets belangrijks: <span className="font-semibold text-primary-700">goede toegankelijkheid maakt dating beter voor iedereen</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Platform Voor Iedereen */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Een platform voor iedereen,<br />
              <span className="text-primary-600">echt voor iedereen</span>
            </h2>
            <p className="text-xl text-slate-700 leading-relaxed">
              "Liefde Voor Iedereen" is geen slogan maar onze kernfilosofie. We hebben geleerd dat features die oorspronkelijk werden ontworpen voor toegankelijkheid, zoals duidelijke navigatie, begrijpelijke taal, grote knoppen en stapsgewijze processen, uiteindelijk alle gebruikers ten goede komen.
            </p>
          </div>

          {/* Voor wie zijn we */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Voor wie zijn we?
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Heart,
                  text: 'Mensen die boven oppervlakkigheid staan en op zoek zijn naar echte connecties'
                },
                {
                  icon: Shield,
                  text: 'Singles die waarde hechten aan veiligheid en transparantie'
                },
                {
                  icon: Lightbulb,
                  text: 'Iedereen die een datingervaring wil zonder onnodige complexiteit'
                },
                {
                  icon: Users,
                  text: 'Mensen met én zonder beperking die gewoon iemand zoeken om van te houden'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-slate-700 leading-relaxed flex-1">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wat Ons Uniek Maakt */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Wat ons uniek maakt
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              15 jaar ervaring vertaald in moderne features
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Feature 1: Adaptieve UX */}
            <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl p-8 border border-primary-100">
              <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                🎯 Adaptieve gebruikerservaring
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Niet iedereen heeft dezelfde behoeften. Daarom bieden we drie modi aan: de <span className="font-semibold">eenvoudige modus</span>, <span className="font-semibold">standaard modus</span> en <span className="font-semibold">geavanceerde modus</span>. Je kiest wat bij jou past zonder gedoe of stigma.
              </p>
            </div>

            {/* Feature 2: AI Assistent */}
            <div className="bg-gradient-to-br from-trust-50 to-teal-50 rounded-2xl p-8 border border-trust-100">
              <div className="w-14 h-14 bg-trust-700 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                🤖 AI-gedreven datingassistent
              </h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Voortbouwend op de technologie van DatingAssistent.nl helpt onze slimme assistent je bij:
              </p>
              <ul className="space-y-2">
                {[
                  'Het maken van een authentiek profiel',
                  'Gesprekstarters die passen bij jouw stijl',
                  'Herkennen van verdacht gedrag zoals romance scammers',
                  'Tips voor succesvolle eerste dates'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-trust-700 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3: Veiligheid */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border border-amber-100">
              <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                🛡️ Veiligheid voorop
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Met 15 jaar ervaring weten we dat veiligheid niet optioneel is. Daarom werken we met <span className="font-semibold">AI-powered scam detectie</span>, <span className="font-semibold">meerdere verificatielagen</span> en een <span className="font-semibold">transparant rapportagesysteem</span>.
              </p>
            </div>

            {/* Feature 4: Menselijke Touch */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-100">
              <div className="w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                ❤️ Menselijke touch
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Technologie is geweldig maar dating blijft mensenwerk. Wij bieden <span className="font-semibold">persoonlijke klantenservice zonder bots</span> en hebben een team dat begrijpt dat achter elk profiel een mens zit met dromen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missie & Waarden */}
      <section className="py-20 lg:py-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Missie */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Onze Missie</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Waarom we doen wat we doen
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Op een veilige en professionele manier singles die op zoek zijn naar een serieuze relatie of vriendschap met elkaar in contact brengen.
              </p>
              <p className="text-slate-400 mt-4">
                Deze missie stond in 2009 centraal en staat dat nog steeds. Onze aanpak is echter geëvolueerd van een speciale datingsite naar een premium platform waar toegankelijkheid de norm is voor iedereen.
              </p>
            </div>

            {/* Waarden */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Onze Waarden</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Waar we voor staan
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Kwaliteit boven kwantiteit',
                    description: 'Wij focussen op gebruikers die op zoek zijn naar iets echts.'
                  },
                  {
                    title: 'Inclusiviteit zonder labels',
                    description: 'Je bent niet je beperking of je leeftijd. Je bent jezelf.'
                  },
                  {
                    title: 'Transparantie',
                    description: 'Geen verborgen kosten of onduidelijke voorwaarden.'
                  },
                  {
                    title: 'Innovatie met empathie',
                    description: 'De nieuwste techniek van DatingAssistent.nl wordt ingezet met respect voor de mens.'
                  }
                ].map((value, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">{value.title}:</p>
                      <p className="text-slate-400 text-sm">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lokaal Platform */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 mb-6">
            <Globe className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-slate-900">Made in Nederland</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Van Nederland en België,<br />voor Nederland en België
          </h2>

          <p className="text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
            We zijn trots Nederlandstalig. Onze algoritmes begrijpen lokale postcodes, onze service spreekt je taal en onze community is lokaal en herkenbaar.
          </p>
        </div>
      </section>

      {/* Het Team */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Het team
            </h2>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 md:p-12 border border-slate-200">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Photo placeholder */}
              <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-trust-100 rounded-2xl flex-shrink-0 flex items-center justify-center">
                <User className="w-16 h-16 text-primary-400" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Vincent van Munster
                </h3>
                <p className="text-primary-600 font-medium mb-4">Oprichter</p>
                <p className="text-slate-700 leading-relaxed">
                  Met 15 jaar ervaring sinds die eerste vakantie in 2009 combineert Vincent technische expertise met een persoonlijke missie om ervoor te zorgen dat iedereen liefde kan vinden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Succesverhalen */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-50 via-pink-50 to-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary-200 mb-6">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-900">Succesverhalen</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Duizenden singles vonden elkaar
            </h2>
            <p className="text-xl text-slate-700">
              Sinds 2009 hebben duizenden singles elkaar gevonden.<br />
              Elk verhaal bewijst dat liefde geen grenzen kent.
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 text-primary-500 fill-primary-500" />
              ))}
            </div>
            <blockquote className="text-xl text-slate-700 leading-relaxed mb-6 italic">
              "Ik hoop dat meer singles hier de partner van hun leven gaan vinden."
            </blockquote>
            <p className="font-semibold text-slate-900">– Arthur</p>
            <p className="text-sm text-slate-500">Gebruiker sinds 2019</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Sluit je bij ons aan
          </h2>
          <p className="text-xl text-slate-300 mb-4 leading-relaxed">
            Of je nu nieuw bent of een ervaren swiper:<br />
            Liefde Voor Iedereen is gemaakt voor jou.
          </p>
          <p className="text-2xl font-bold text-primary-400 mb-10">
            Want liefde is voor iedereen. Ook voor jou.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Maak gratis een account aan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/prijzen"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20"
            >
              Bekijk onze tarieven
            </Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <Link href="/success-stories" className="hover:text-white transition-colors">
              → Lees meer succesverhalen
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              → Veelgestelde vragen
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              → Neem contact op
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function User({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}
