import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Zap, Heart, Users, MessageCircle, Check, Star, ArrowRight,
  ShieldCheck, Clock, Sparkles, Brain, Wind, BadgeCheck, AlertTriangle
} from 'lucide-react'
import { FaqAccordion } from './FaqAccordion'

const BASE_URL = 'https://www.liefdevooriedereen.nl'

export const metadata: Metadata = {
  title: 'Daten met ADHD & HSP | Dating voor Hoogsensitieve & ADHD Singles',
  description: 'Daten met ADHD of HSP op Liefde Voor Iedereen. Geen oordeel over impulsiviteit of gevoeligheid. Vind iemand die jou begrijpt. Gratis aanmelden.',
  keywords: [
    'daten adhd hsp',
    'dating met adhd',
    'hsp dating',
    'dating hoogsensitief',
    'adhd relatie',
    'daten als hsp',
    'dating neurodiversiteit',
    'hsp partner vinden',
    'adhd dating tips',
    'hoogsensitief daten',
    'dating adhd hoogsensitief',
    'relatie adhd hsp',
  ],
  openGraph: {
    title: 'Daten met ADHD & HSP | Liefde Voor Iedereen',
    description: 'Daten met ADHD of als hoogsensitief persoon zonder oordeel. Vind iemand die jouw energie en gevoeligheid waardeert. Gratis aanmelden.',
    url: `${BASE_URL}/daten-adhd-hsp`,
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/og-adhd-hsp.jpg`,
        width: 1200,
        height: 630,
        alt: 'Daten met ADHD en HSP - Liefde Voor Iedereen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daten met ADHD & HSP | Liefde Voor Iedereen',
    description: 'Daten met ADHD of als hoogsensitief persoon zonder oordeel. Vind iemand die jou écht begrijpt.',
  },
  alternates: {
    canonical: `${BASE_URL}/daten-adhd-hsp`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const faqItems = [
  {
    question: 'Hoe date je succesvol als je ADHD hebt?',
    answer: 'Wees open over je ADHD — je hoeft het niet te verbergen. Kies korte, actieve eerste dates (wandeling, minigolf) zodat je je energie kwijt kunt. Geef eerlijk aan dat je soms vergeet te antwoorden; dat is geen onverschilligheid. Op Liefde Voor Iedereen vind je mensen die dit begrijpen en waarderen.',
  },
  {
    question: 'Wat is een HSP en hoe beïnvloedt het daten?',
    answer: 'HSP staat voor Hoogsensitief Persoon. Ongeveer 15-20% van de bevolking is hoogsensitief: je verwerkt prikkels dieper en voelt emoties intenser. Bij daten betekent dit dat je snel overweldigd raakt door oppervlakkige gesprekken of lawaaierige bars. Jij zoekt diepte, echtheid en een veilige verbinding — en die vind je hier.',
  },
  {
    question: 'Komen ADHD en HSP vaak samen voor?',
    answer: 'Ja, dat is vaker het geval dan mensen denken. Veel mensen met ADHD zijn ook hoogsensitief. De combinatie kan intens zijn: hoge energie én diepe gevoeligheid. Op ons platform vind je partners die beide kanten begrijpen en niet oordelen.',
  },
  {
    question: 'Moet ik mijn ADHD of HSP meteen vertellen bij het daten?',
    answer: 'Dat is jouw keuze en er is geen goed of fout moment. Veel mensen met ADHD of HSP kiezen ervoor om het na een paar gesprekken te noemen, wanneer er een klik is. Op ons platform zijn veel mensen zelf neurodivers of kennen ze het goed — je hoeft je niet te schamen.',
  },
  {
    question: 'Wat voor soort partner past bij iemand met ADHD?',
    answer: 'Er is geen één-antwoord, maar mensen met ADHD hebben vaak baat bij een partner die geduldig is, structuur biedt zonder controlerend te zijn, en die de spontaniteit waardeert. Iemand die communicatief is en niet snel beledigd als je iets vergeet. Wij helpen je zulke mensen te vinden.',
  },
  {
    question: 'En wat voor partner past bij een HSP?',
    answer: 'HSPs floreren naast partners die emotioneel beschikbaar zijn, rustige dates waarderen, geen haast hebben en eerlijk communiceren. Iemand die jouw gevoeligheid als kracht ziet, niet als zwakte. Op ons platform zijn veel singles die diepgang boven oppervlakkigheid verkiezen.',
  },
  {
    question: 'Hoe ga ik om met de overwhelm van online daten als HSP?',
    answer: 'Stel grenzen: beantwoord berichten op jouw tempo, niet op dat van de app. Plan vaste "dating-momenten" in je week zodat het niet continu door je hoofd speelt. Kies voor één gesprek tegelijk in plaats van twintig tegelijk. Bij ons kun je zelf het tempo bepalen — geen druk, geen spamberichten.',
  },
  {
    question: 'Is Liefde Voor Iedereen gratis voor mensen met ADHD of HSP?',
    answer: 'Aanmelden en profielen bekijken is volledig gratis. Voor berichten versturen heb je een betaald account nodig. We bieden betaalbare abonnementen zonder verborgen kosten. Probeer het gewoon — je kunt altijd stoppen.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/daten-adhd-hsp`,
      url: `${BASE_URL}/daten-adhd-hsp`,
      name: 'Daten met ADHD & HSP | Liefde Voor Iedereen',
      description: 'Daten met ADHD of als hoogsensitief persoon zonder oordeel. Vind iemand die jouw energie en gevoeligheid waardeert.',
      inLanguage: 'nl-NL',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/daten-adhd-hsp#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/daten-adhd-hsp#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Daten ADHD & HSP', item: `${BASE_URL}/daten-adhd-hsp` },
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Liefde Voor Iedereen',
      url: BASE_URL,
      logo: `${BASE_URL}/images/LiefdevoorIedereen_logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'Dutch',
        email: 'support@liefdevooriedereen.nl',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ],
}

export default function DatenAdhdHspPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/images/LiefdevoorIedereen_logo.png"
                  alt="Liefde Voor Iedereen - datingsite"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="text-xl font-bold text-white">Liefde Voor Iedereen</span>
              </Link>
              <Link
                href="/login"
                className="px-6 py-2.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-full hover:bg-white/30 transition-colors"
              >
                Inloggen
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden">
          <div
            className="absolute inset-0 z-0"
            style={{ background: 'linear-gradient(135deg, #d97706 0%, #dc2626 45%, #7c3aed 100%)' }}
            aria-hidden="true"
          />
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-32">
            <div className="max-w-3xl text-white">

              {/* Breadcrumb */}
              <nav aria-label="Broodkruimelpad" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-white/70">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white font-medium">Daten ADHD &amp; HSP</li>
                </ol>
              </nav>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/30 backdrop-blur-sm border border-amber-300/40">
                  <Zap className="w-4 h-4 text-amber-200" aria-hidden="true" />
                  <span className="text-sm font-medium">ADHD-vriendelijk</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/30 backdrop-blur-sm border border-violet-300/40">
                  <Wind className="w-4 h-4 text-violet-200" aria-hidden="true" />
                  <span className="text-sm font-medium">HSP-veilig</span>
                </div>
              </div>

              {/* H1 */}
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Daten met ADHD & HSP
                <span className="block text-amber-200 mt-2">zonder oordeel</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl">
                Te impulsief of juist te gevoelig? Dat bestaat niet hier.
                Vind iemand die jouw energie, diepgang en spontaniteit écht waardeert.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?source=adhd-hsp"
                  className="group px-8 py-5 bg-white text-amber-700 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Heart className="w-6 h-6" aria-hidden="true" />
                  Gratis Aanmelden
                </Link>
                <Link
                  href="#voordelen"
                  className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xl font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Meer lezen
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-white/80 text-base">
                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-amber-300" aria-hidden="true" /><span>Geen oordeel over impulsiviteit</span></div>
                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-amber-300" aria-hidden="true" /><span>Rustig tempo mogelijk</span></div>
                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-amber-300" aria-hidden="true" /><span>Diepgaande verbindingen</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-10 bg-stone-50 border-y border-slate-200" aria-label="Platformstatistieken">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: '15-20%', sub: 'van de mensen is HSP' },
                { label: '5-7%', sub: 'heeft ADHD in Nederland' },
                { label: '100%', sub: 'oordeel-vrije community' },
                { label: 'Diepgang', sub: 'boven oppervlakkigheid' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">{s.label}</div>
                  <div className="text-sm md:text-base text-slate-500 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TWEE KANTEN: ADHD vs HSP ── */}
        <section className="py-24 bg-white" aria-labelledby="wie-jij-bent-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="wie-jij-bent-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Of je nu ADHD hebt, HSP bent — of allebei
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Beide eigenschappen worden hier begrepen en gewaardeerd, niet weggewuifd of 'gecorrigeerd'.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* ADHD kaart */}
              <article className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-10">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-amber-600" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Als je ADHD hebt</h3>
                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                  Je bent vol energie, hebt diepe passies, vergeet weleens te antwoorden en kunt hyperfocussen op iemand
                  die je leuk vindt. Dat is wie jij bent — en er zijn mensen die daarvoor vallen.
                </p>
                <ul className="space-y-3">
                  {[
                    'Spontane berichten zijn welkom, ook om middernacht',
                    'Vergeten te antwoorden? Hier begrijpen mensen dat',
                    'Je energie is een superkracht, geen probleem',
                    'Korte, actieve dates worden gewaardeerd',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </article>

              {/* HSP kaart */}
              <article className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-3xl p-10">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                  <Wind className="w-8 h-8 text-violet-600" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Als je HSP bent</h3>
                <p className="text-slate-700 text-lg leading-relaxed mb-6">
                  Je voelt alles intens, hebt diepe gesprekken nodig en raakt snel overweldigd door oppervlakkigheid
                  of drukke omgevingen. Jouw gevoeligheid is geen zwakte — het is je grootste kracht in relaties.
                </p>
                <ul className="space-y-3">
                  {[
                    'Rustig tempo — geen druk om snel te antwoorden',
                    'Diepgang en eerlijkheid boven smalltalk',
                    'Jij bepaalt wanneer en hoe je afspreekt',
                    'Gevoeligheid wordt hier als kracht gezien',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            {/* Overlap banner */}
            <div className="bg-gradient-to-r from-amber-500 to-violet-600 rounded-2xl p-8 text-white text-center">
              <Brain className="w-10 h-10 mx-auto mb-4 opacity-90" aria-hidden="true" />
              <h3 className="text-2xl font-bold mb-3">ADHD + HSP: de combinatie</h3>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Veel mensen met ADHD zijn ook hoogsensitief. Hoge energie én diepe gevoeligheid — dat klinkt tegenstrijdig,
                maar maakt je juist bijzonder. Op ons platform vind je andere mensen die dit begrijpen vanuit eigen ervaring.
              </p>
            </div>
          </div>
        </section>

        {/* ── PLATFORM VOORDELEN ── */}
        <section id="voordelen" className="py-24 bg-stone-50" aria-labelledby="voordelen-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="voordelen-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Waarom Liefde Voor Iedereen voor ADHD & HSP singles?
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                We zijn anders dan gewone dating apps — bewust zo gebouwd
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldCheck className="w-8 h-8" aria-hidden="true" />,
                  color: 'bg-emerald-100 text-emerald-700',
                  title: 'Geverifieerde Profielen',
                  desc: 'Geen nepprofielen, geen catfishing. Alle profielen worden gecontroleerd. Geen energieverspilling aan mensen die niet echt zijn.',
                },
                {
                  icon: <Clock className="w-8 h-8" aria-hidden="true" />,
                  color: 'bg-amber-100 text-amber-700',
                  title: 'Jij Bepaalt het Tempo',
                  desc: 'Geen algoritme dat je pusht. Geen "je hebt X uur om te antwoorden". Rust als je het nodig hebt, actief zijn als je er zin in hebt.',
                },
                {
                  icon: <Sparkles className="w-8 h-8" aria-hidden="true" />,
                  color: 'bg-violet-100 text-violet-700',
                  title: 'Diepgang Centraal',
                  desc: 'Profielen met echte vragen over wie je bent. Geen lege selfies. Vind iemand die kijkt naar jouw persoonlijkheid, niet alleen je foto.',
                },
              ].map((f) => (
                <article key={f.title} className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-6`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── DATINGTIPS PER GROEP ── */}
        <section className="py-24 bg-white" aria-labelledby="tips-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="tips-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Praktische dating tips voor ADHD & HSP
              </h2>
              <p className="text-xl text-slate-600">Zo maak je het beste van online daten</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ADHD tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">Dating tips bij ADHD</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Kies actieve eerste dates: wandelen, bowlen, een museum — minder stilzitten',
                    'Zet herinneringen in je telefoon voor afspraken en berichten beantwoorden',
                    'Wees eerlijk: "Ik kan soms vergeten te antwoorden, dat betekent niet dat ik niet geïnteresseerd ben"',
                    'Hyperfocus op een nieuwe match is normaal — geef jezelf ook ruimte',
                    'Korte berichten sturen is prima — je hoeft geen essays te schrijven',
                    'Vergeet niet: jouw spontaniteit en passie zijn ontzettend aantrekkelijk',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-amber-800 text-base">
                      <Check className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* HSP tips */}
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <Wind className="w-5 h-5 text-violet-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-violet-900">Dating tips als HSP</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Plan rustige eerste dates: een koffietentje, een boekwinkel, een park',
                    'Stel je limieten in: maximaal X gesprekken tegelijk voeren',
                    'Vertrouw je intuïtie — als iets niet klopt, klopt het niet',
                    'Neem na een date altijd tijd voor jezelf om te verwerken',
                    'Je hoeft niet direct te beslissen of iemand iets voor je is',
                    'Communiceer over jouw behoeften — de juiste persoon zal dit respecteren',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-violet-800 text-base">
                      <Check className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rode vlaggen */}
            <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
                <h3 className="text-xl font-bold text-red-900">Let op: rode vlaggen bij ADHD &amp; HSP dating</h3>
              </div>
              <p className="text-red-800 mb-4 text-lg">Stop het contact als iemand:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Je ADHD of HSP bagatelliseert ("je doet zo moeilijk")',
                  'Druk uitoefent op je om sneller te antwoorden',
                  'Jouw gevoeligheid als zwakte ziet',
                  'Negatief reageert als je grenzen aangeeft',
                  'Je overweldigt met berichten en dan plotseling stopt',
                  'Zegt dat je je moet aanpassen aan hem/haar',
                ].map((flag) => (
                  <li key={flag} className="flex items-start gap-2 text-red-800 text-base">
                    <span className="text-red-600 font-bold mt-0.5 flex-shrink-0">✕</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 bg-stone-50" aria-labelledby="reviews-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="reviews-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Wat zeggen ADHD & HSP daters?
              </h2>
              <p className="text-xl text-slate-600">Echte ervaringen van mensen zoals jij</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: 'Op andere apps werd mijn enthousiasme als "te veel" gezien. Hier is mijn energie juist een pluspunt. Ik heb eindelijk iemand gevonden die van mijn spontaniteit geniet.',
                  name: 'Lisa',
                  label: 'ADHD',
                  age: 28,
                  city: 'Amsterdam',
                  color: 'bg-amber-500',
                },
                {
                  quote: 'Als HSP was online daten altijd overweldigend. Nu kan ik op mijn eigen tempo antwoorden en zoek ik mensen die diepgang waarderen. Dat maakt alles anders.',
                  name: 'Sanne',
                  label: 'HSP',
                  age: 31,
                  city: 'Utrecht',
                  color: 'bg-violet-500',
                },
                {
                  quote: 'Ik heb zowel ADHD als HSP. Dat is intensief. Maar hier vond ik iemand die beide begrijpt — hij heeft zelf ook ADHD. We vullen elkaar perfect aan.',
                  name: 'Daan',
                  label: 'ADHD + HSP',
                  age: 34,
                  city: 'Eindhoven',
                  color: 'bg-rose-500',
                },
              ].map((t) => (
                <article key={t.name} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-1 mb-5" aria-label="5 sterren">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 text-lg leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{t.name}, {t.age}</div>
                      <div className="text-slate-500">{t.city} · <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">{t.label}</span></div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 bg-white" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Veelgestelde vragen over daten met ADHD en HSP
              </h2>
              <p className="text-xl text-slate-600">
                Alles wat je wilt weten over daten als ADHD- of HSP-er
              </p>
            </div>
            <FaqAccordion items={faqItems} />
            <div className="mt-10 text-center">
              <p className="text-slate-600 text-lg mb-4">Staat jouw vraag er niet bij?</p>
              <Link
                href="/support/faq"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors"
              >
                Bekijk alle vragen
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── GERELATEERDE CONTENT ── */}
        <section className="py-16 bg-stone-50 border-t border-slate-200" aria-labelledby="meer-info-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="meer-info-heading" className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Meer lezen over neurodiversiteit en dating
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  href: '/dating-met-autisme',
                  title: 'Dating met Autisme',
                  desc: 'Daten als autist of met een autistische partner — tips en een veilig platform.',
                  icon: <Brain className="w-6 h-6" aria-hidden="true" />,
                  color: 'bg-blue-100 text-blue-700 group-hover:bg-blue-200',
                },
                {
                  href: '/kennisbank',
                  title: 'Kennisbank',
                  desc: 'Uitgebreide gidsen over relaties, communicatie en neurodiversiteit.',
                  icon: <MessageCircle className="w-6 h-6" aria-hidden="true" />,
                  color: 'bg-amber-100 text-amber-700 group-hover:bg-amber-200',
                },
                {
                  href: '/dating-met-beperking',
                  title: 'Dating met beperking',
                  desc: 'Informatie voor mensen met een beperking die op zoek zijn naar liefde.',
                  icon: <Heart className="w-6 h-6" aria-hidden="true" />,
                  color: 'bg-rose-100 text-rose-700 group-hover:bg-rose-200',
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className={`w-12 h-12 ${l.color} rounded-xl flex items-center justify-center flex-shrink-0 transition-colors`}>
                    {l.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-amber-700 transition-colors">{l.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{l.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="py-24"
          style={{ background: 'linear-gradient(135deg, #d97706 0%, #7c3aed 100%)' }}
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">
              Klaar om iemand te vinden die jou begrijpt?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Aanmelden is gratis. Geen creditcard nodig.
              Jij bepaalt het tempo — altijd.
            </p>
            <Link
              href="/register?source=adhd-hsp"
              className="inline-flex items-center gap-3 bg-white text-amber-700 text-xl font-bold py-5 px-12 rounded-2xl hover:bg-stone-50 transition-colors shadow-lg"
            >
              Gratis Aanmelden
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/80 text-base">
              <div className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /><span>Geen druk of haast</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /><span>100% Nederlands bedrijf</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /><span>AVG compliant</span></div>
            </div>
          </div>
        </section>

        {/* ── TRUST BADGES ── */}
        <section className="py-10 bg-white border-t border-slate-200" aria-label="Keurmerken en certificaten">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {['SSL Beveiligd', 'AVG Compliant', 'Nederlands bedrijf', '24/7 Support'].map((badge) => (
                <div key={badge} className="flex items-center space-x-2 text-slate-500">
                  <Check className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  <span className="font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center space-x-2 mb-5">
                  <Image
                    src="/images/LiefdevoorIedereen_logo.png"
                    alt="Liefde Voor Iedereen"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span className="text-lg font-bold">Liefde Voor Iedereen</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Dating voor neurodiverse singles. ADHD, HSP en meer — iedereen is welkom.
                </p>
              </div>
              <nav aria-label="Communities">
                <h3 className="font-bold mb-4">Communities</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="/daten-adhd-hsp" className="hover:text-white transition-colors">Daten ADHD &amp; HSP</Link></li>
                  <li><Link href="/dating-met-autisme" className="hover:text-white transition-colors">Dating met Autisme</Link></li>
                  <li><Link href="/veilig-daten-lvb" className="hover:text-white transition-colors">Veilig Daten (LVB)</Link></li>
                  <li><Link href="/dating-met-beperking" className="hover:text-white transition-colors">Dating met Beperking</Link></li>
                </ul>
              </nav>
              <nav aria-label="Informatie">
                <h3 className="font-bold mb-4">Informatie</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="/kennisbank" className="hover:text-white transition-colors">Kennisbank</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/support/faq" className="hover:text-white transition-colors">Veelgestelde vragen</Link></li>
                  <li><Link href="/prijzen" className="hover:text-white transition-colors">Prijzen</Link></li>
                </ul>
              </nav>
              <nav aria-label="Juridisch">
                <h3 className="font-bold mb-4">Juridisch</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Algemene voorwaarden</Link></li>
                  <li><Link href="/cookies" className="hover:text-white transition-colors">Cookiebeleid</Link></li>
                </ul>
              </nav>
            </div>
            <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} Liefde Voor Iedereen. Alle rechten voorbehouden.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
