import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Heart, Users, MessageCircle, Check, Star, ArrowRight, Phone, AlertTriangle, Smile, Clock, BadgeCheck } from 'lucide-react'
import { FaqAccordion } from './FaqAccordion'

const BASE_URL = 'https://www.liefdevooriedereen.nl'

export const metadata: Metadata = {
  title: 'Veilig Daten met LVB | Datingsite voor Mensen met een Licht Verstandelijke Beperking',
  description: 'Veilig daten met LVB op Liefde Voor Iedereen. Grote knoppen, simpele tekst en hulp van je begeleider. Alle profielen worden gecontroleerd. Gratis aanmelden.',
  keywords: [
    'veilig daten lvb',
    'dating lvb',
    'daten met licht verstandelijke beperking',
    'lvb dating app',
    'dating begeleiding lvb',
    'veilig online daten lvb',
    'datingsite lvb',
    'daten met beperking',
    'lvb vrienden maken',
    'daten met begeleiding',
  ],
  openGraph: {
    title: 'Veilig Daten met LVB | Liefde Voor Iedereen',
    description: 'De veiligste datingsite voor mensen met LVB. Simpele knoppen, duidelijke tekst en begeleiding wanneer je dat wilt. Gratis aanmelden.',
    url: `${BASE_URL}/veilig-daten-lvb`,
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/og-lvb.jpg`,
        width: 1200,
        height: 630,
        alt: 'Veilig Daten met LVB - Liefde Voor Iedereen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veilig Daten met LVB | Liefde Voor Iedereen',
    description: 'De veiligste datingsite voor mensen met LVB. Simpele knoppen en begeleiding wanneer je dat wilt.',
  },
  alternates: {
    canonical: `${BASE_URL}/veilig-daten-lvb`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const faqItems = [
  {
    question: 'Is veilig daten met LVB echt mogelijk?',
    answer: 'Ja, absoluut! Liefde Voor Iedereen is speciaal gebouwd voor veilig daten. Alle profielen worden handmatig gecontroleerd. Je begeleider mag je helpen. En de app is makkelijk te gebruiken, ook als lezen of typen lastig is.',
  },
  {
    question: 'Mag mijn begeleider meekijken of helpen?',
    answer: 'Ja, dat mag altijd. Je begeleider, gezinsvoogd of vertrouwenspersoon mag je helpen met aanmelden, berichten versturen en afspraken maken. Jij bepaalt wie je vertrouwt.',
  },
  {
    question: 'Hoe weet ik of iemand echt is en geen nepprofiel?',
    answer: 'Wij controleren elk profiel. Zie je een blauw vinkje naast een naam? Dan weten we zeker dat die persoon echt is. Zonder vinkje beoordelen we het profiel nog. Bij twijfel: rapporteer het gewoon. We kijken er meteen naar.',
  },
  {
    question: 'Is Liefde Voor Iedereen gratis voor mensen met LVB?',
    answer: 'Aanmelden en profielen bekijken is volledig gratis. Voor berichten versturen heb je een betaald account nodig. We hebben speciale, voordelige abonnementen. Vraag je begeleider om te helpen als je vragen hebt over de kosten.',
  },
  {
    question: 'Wat als iemand gemeen of vervelend doet?',
    answer: 'Dat accepteren we niet. Je kunt iemand altijd blokkeren met één druk op de knop. Of rapporteer hem of haar via de rode knop. Ons team reageert binnen 24 uur. Voel jij je niet veilig? Bel dan 112 of praat met je begeleider.',
  },
  {
    question: 'Kan ik ook vrienden zoeken in plaats van een relatie?',
    answer: 'Ja! Je kunt kiezen wat je zoekt: vriendschap, de liefde, of allebei. Veel mensen met LVB vinden het fijn om eerst vrienden te maken. Dat mag hier gewoon.',
  },
  {
    question: 'Hoe simpel is de app echt?',
    answer: 'Heel simpel. Grote knoppen, weinig tekst en duidelijke plaatjes. Je kunt ook spraakberichten sturen in plaats van typen. En als je iets niet begrijpt, is er uitleg bij elke stap.',
  },
  {
    question: 'Hoe maak ik een eerste afspraak als ik dat spannend vind?',
    answer: 'Maak altijd een eerste afspraak op een drukke, openbare plek, zoals een café of winkelcentrum. Vertel je begeleider waar je heen gaat. Ga nooit mee naar iemands huis als je diegene nog niet goed kent. Vertrouw op je gevoel.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/veilig-daten-lvb`,
      url: `${BASE_URL}/veilig-daten-lvb`,
      name: 'Veilig Daten met LVB | Liefde Voor Iedereen',
      description: 'Veilig daten met LVB op Liefde Voor Iedereen. Grote knoppen, simpele tekst en hulp van je begeleider.',
      inLanguage: 'nl-NL',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      breadcrumb: { '@id': `${BASE_URL}/veilig-daten-lvb#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/veilig-daten-lvb#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Veilig Daten LVB', item: `${BASE_URL}/veilig-daten-lvb` },
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Liefde Voor Iedereen',
      url: BASE_URL,
      logo: `${BASE_URL}/images/LiefdevoorIedereen_logo.png`,
      sameAs: [],
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

export default function VeiligDatenLVBPage() {
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
            style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)' }}
            aria-hidden="true"
          />
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-32">
            <div className="max-w-3xl text-white">

              {/* Breadcrumb (invisible to users, good for SEO) */}
              <nav aria-label="Broodkruimelpad" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-white/70">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white font-medium">Veilig Daten LVB</li>
                </ol>
              </nav>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                <span className="text-lg font-medium">Veilig & Geverifieerd</span>
              </div>

              {/* H1 — primaire keyword prominent */}
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Veilig Daten met LVB
                <span className="block text-emerald-200 mt-2">makkelijk en veilig</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl">
                Daten met een licht verstandelijke beperking hoeft niet ingewikkeld te zijn.
                Grote knoppen, eenvoudige tekst en hulp wanneer jij dat wilt.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?source=lvb"
                  className="group px-8 py-5 bg-white text-emerald-700 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Heart className="w-6 h-6" aria-hidden="true" />
                  Gratis Aanmelden
                </Link>
                <Link
                  href="#hoe-werkt-het"
                  className="px-8 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xl font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Meer lezen
                </Link>
              </div>

              {/* Micro social proof */}
              <div className="mt-10 flex flex-wrap gap-6 text-white/80 text-base">
                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-300" aria-hidden="true" /><span>Gratis aanmelden</span></div>
                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-300" aria-hidden="true" /><span>Begeleider mag helpen</span></div>
                <div className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-300" aria-hidden="true" /><span>Alle profielen gecontroleerd</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BALK ── */}
        <section className="py-10 bg-stone-50 border-y border-slate-200" aria-label="Platformstatistieken">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Al 15+ jaar', sub: 'ervaring in inclusief daten' },
                { label: '100% Veilig', sub: 'handmatige profielcontrole' },
                { label: 'Simpele app', sub: 'grote knoppen & duidelijke tekst' },
                { label: 'Begeleiding OK', sub: 'vertrouwenspersoon mag meekijken' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">{s.label}</div>
                  <div className="text-sm md:text-base text-slate-500 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WAAROM SECTIE ── */}
        <section id="voordelen" className="py-24 bg-white" aria-labelledby="voordelen-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="voordelen-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Waarom daten met LVB hier anders is
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                We begrijpen dat andere datingapps soms ingewikkeld of onveilig voelen.
                Dat is bij ons anders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldCheck className="w-8 h-8" aria-hidden="true" />,
                  color: 'bg-emerald-100 text-emerald-700',
                  title: 'Extra Veilig voor LVB',
                  desc: 'Elk profiel wordt handmatig gecontroleerd. Nepprofielen worden meteen verwijderd. Je ziet altijd een blauw vinkje bij echte mensen.',
                },
                {
                  icon: <Smile className="w-8 h-8" aria-hidden="true" />,
                  color: 'bg-sky-100 text-sky-700',
                  title: 'Makkelijk te Gebruiken',
                  desc: 'Grote knoppen, korte zinnen en duidelijke plaatjes. Je kunt ook spraakberichten sturen in plaats van typen. Geen gedoe.',
                },
                {
                  icon: <Users className="w-8 h-8" aria-hidden="true" />,
                  color: 'bg-violet-100 text-violet-700',
                  title: 'Begeleider Welkom',
                  desc: 'Je begeleider, coach of vertrouwenspersoon mag je helpen. Bij aanmelden, berichten sturen en afspraken maken. Jij bepaalt wie je vertrouwt.',
                },
              ].map((f) => (
                <article key={f.title} className="bg-stone-50 p-8 rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow">
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

        {/* ── HOE WERKT HET ── */}
        <section id="hoe-werkt-het" className="py-24 bg-stone-50" aria-labelledby="hoe-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="hoe-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Hoe werkt veilig daten met LVB?
              </h2>
              <p className="text-xl text-slate-600">
                In 4 stappen naar je eerste contact — zo makkelijk is het
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-8" role="list">
              {[
                {
                  step: '1',
                  title: 'Maak een profiel',
                  desc: 'Schrijf een paar woorden over jezelf. Je begeleider mag helpen. Voeg een foto toe — dat is niet verplicht.',
                  color: 'bg-emerald-500',
                },
                {
                  step: '2',
                  title: 'Zoek mensen die bij jou passen',
                  desc: 'Zie je iemand leuk? Stuur een hartje. Of stuur een berichtje of spraakbericht. Heel simpel.',
                  color: 'bg-teal-500',
                },
                {
                  step: '3',
                  title: 'Chat en leer elkaar kennen',
                  desc: 'Praat eerst lang via berichten voordat je afspreekt. Je voelt vanzelf of iemand aardig is.',
                  color: 'bg-sky-500',
                },
                {
                  step: '4',
                  title: 'Spreek af op een veilige plek',
                  desc: 'Ontmoet iemand altijd op een drukke plek, zoals een café. Vertel je begeleider altijd waar je naartoe gaat.',
                  color: 'bg-violet-500',
                },
              ].map((s) => (
                <li key={s.step} className="flex items-start gap-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className={`${s.color} text-white text-2xl font-black w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── VEILIGHEIDSTIPS ── */}
        <section className="py-24 bg-white" aria-labelledby="veiligheid-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="veiligheid-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Veiligheidstips voor daten met LVB
              </h2>
              <p className="text-xl text-slate-600">
                Deze tips helpen je om veilig te daten, zowel online als offline
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900">Online veiligheid</h3>
                </div>
                <ul className="space-y-3 text-emerald-800 text-lg">
                  {[
                    'Deel nooit je adres of telefoonnummer meteen',
                    'Stuur nooit geld naar iemand die je nog niet kent',
                    'Vraag altijd om een nieuw foto als je twijfelt of iemand echt is',
                    'Laat je begeleider meelezen als je twijfelt',
                    'Bij een blauw vinkje is het profiel gecontroleerd',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-sky-700" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-sky-900">Eerste afspraak</h3>
                </div>
                <ul className="space-y-3 text-sky-800 text-lg">
                  {[
                    'Spreek af op een drukke, openbare plek',
                    'Vertel je begeleider altijd waar je naartoe gaat',
                    'Regel je eigen vervoer (ga niet mee in iemands auto)',
                    'Neem een eigen telefoon mee',
                    'Als iets niet goed voelt: ga gewoon weg',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Rode vlaggen */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
                <h3 className="text-xl font-bold text-red-900">Let op! Dit zijn rode vlaggen</h3>
              </div>
              <p className="text-red-800 mb-4 text-lg">Stop het contact als iemand dit doet:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'Vraagt om geld of cadeaubonnen',
                  'Wil snel afspreken voordat je hem/haar echt kent',
                  'Vraagt om foto\'s die je niet wilt sturen',
                  'Wordt boos als je niet meteen antwoordt',
                  'Wil het gesprek verplaatsen naar WhatsApp',
                  'Vertelt tegenstrijdige verhalen',
                ].map((flag) => (
                  <li key={flag} className="flex items-start gap-2 text-red-800 text-base">
                    <span className="text-red-600 font-bold mt-0.5">✕</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── VOOR WIE ── */}
        <section className="py-24 bg-stone-50" aria-labelledby="voor-wie-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="voor-wie-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Voor wie is Liefde Voor Iedereen?
              </h2>
              <p className="text-xl text-slate-600">
                Onze datingsite is gemaakt voor mensen met LVB en hun naasten
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  emoji: '💙',
                  title: 'Mensen met LVB',
                  desc: 'Heb jij een licht verstandelijke beperking? Dan is dit platform speciaal voor jou gebouwd. Alles is makkelijk, veilig en duidelijk.',
                },
                {
                  emoji: '👥',
                  title: 'Begeleiders & coaches',
                  desc: 'Werk jij met mensen met LVB? Je kunt hen begeleiden bij het daten. Alles is transparant en veilig opgezet.',
                },
                {
                  emoji: '❤️',
                  title: 'Ouders & familie',
                  desc: 'Is je kind of familielid op zoek naar liefde of vriendschap? Hier kunnen ze dat veilig doen, ook als ze hulp nodig hebben.',
                },
              ].map((g) => (
                <article key={g.title} className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <div className="text-5xl mb-4" role="img" aria-label={g.title}>{g.emoji}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{g.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">{g.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 bg-white" aria-labelledby="reviews-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="reviews-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Wat zeggen mensen met LVB?
              </h2>
              <p className="text-xl text-slate-600">Echte ervaringen van echte gebruikers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: 'De grote knoppen en duidelijke tekst helpen mij enorm. Ik voel me hier veilig en word niet gepusht.',
                  name: 'Kevin',
                  age: 25,
                  city: 'Tilburg',
                },
                {
                  quote: 'Mijn begeleider heeft mij geholpen met aanmelden. Nu chat ik zelf al een tijdje met een leuke jongen!',
                  name: 'Laura',
                  age: 22,
                  city: 'Utrecht',
                },
                {
                  quote: 'Eindelijk een datingsite die begrijpt dat ik het soms wat rustiger aan wil doen. Geen stress, gewoon leuk praten.',
                  name: 'Tim',
                  age: 28,
                  city: 'Eindhoven',
                },
              ].map((t) => (
                <article key={t.name} className="bg-stone-50 rounded-2xl p-8 border border-slate-200">
                  <div className="flex items-center gap-1 mb-5" aria-label="5 sterren">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 text-lg leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{t.name}, {t.age}</div>
                      <div className="text-slate-500">{t.city}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 bg-stone-50" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Veelgestelde vragen over veilig daten met LVB
              </h2>
              <p className="text-xl text-slate-600">
                Heb je een vraag? Hier vind je de antwoorden
              </p>
            </div>
            <FaqAccordion items={faqItems} />
            <div className="mt-10 text-center">
              <p className="text-slate-600 text-lg mb-4">Staat jouw vraag er niet bij?</p>
              <Link
                href="/support/faq"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
              >
                Bekijk alle vragen
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── NOODCONTACTEN ── */}
        <section className="py-16 bg-white border-t border-slate-200" aria-labelledby="hulp-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 id="hulp-heading" className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Hulp nodig? Bel deze nummers
              </h2>
              <p className="text-slate-600 text-lg">Je hoeft er nooit alleen voor te staan</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Politie (spoed)', number: '112', desc: 'Bij directe dreiging', color: 'bg-red-600' },
                { name: 'Politie (niet-spoed)', number: '0900-8844', desc: 'Voor aangifte of advies', color: 'bg-slate-600' },
                { name: 'Slachtofferhulp', number: '0900-0101', desc: 'Emotionele ondersteuning', color: 'bg-blue-600' },
              ].map((c) => (
                <div key={c.name} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-sm text-slate-500">{c.desc}</div>
                  </div>
                  <a
                    href={`tel:${c.number.replace(/-/g, '')}`}
                    className={`${c.color} text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity text-sm`}
                    aria-label={`Bel ${c.name}: ${c.number}`}
                  >
                    {c.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INTERNE LINKS / GERELATEERDE CONTENT ── */}
        <section className="py-16 bg-stone-50 border-t border-slate-200" aria-labelledby="meer-info-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="meer-info-heading" className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Meer informatie over daten met LVB
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  href: '/kennisbank',
                  title: 'Kennisbank',
                  desc: 'Uitgebreide gidsen en tips over veilig daten met een beperking.',
                  icon: <MessageCircle className="w-6 h-6" aria-hidden="true" />,
                },
                {
                  href: '/dating-met-beperking',
                  title: 'Dating met beperking',
                  desc: 'Informatie voor mensen met een fysieke of cognitieve beperking.',
                  icon: <Heart className="w-6 h-6" aria-hidden="true" />,
                },
                {
                  href: '/professionals',
                  title: 'Voor professionals',
                  desc: 'Begeleiders, coaches en zorgverleners: zo kunt u cliënten ondersteunen.',
                  icon: <BadgeCheck className="w-6 h-6" aria-hidden="true" />,
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                    {l.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">{l.title}</h3>
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
          style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">
              Klaar om veilig te daten?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Aanmelden is gratis en duurt maar 2 minuten.
              Je begeleider mag er bij zijn.
            </p>
            <Link
              href="/register?source=lvb"
              className="inline-flex items-center gap-3 bg-white text-emerald-700 text-xl font-bold py-5 px-12 rounded-2xl hover:bg-stone-50 transition-colors shadow-lg"
            >
              Gratis Aanmelden
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/80 text-base">
              <div className="flex items-center gap-2"><Check className="w-4 h-4" aria-hidden="true" /><span>Geen creditcard nodig</span></div>
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
                  Veilig daten voor iedereen, ook mensen met LVB. 100% Nederlands.
                </p>
              </div>
              <nav aria-label="Communities">
                <h3 className="font-bold mb-4">Communities</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="/veilig-daten-lvb" className="hover:text-white transition-colors">Veilig Daten (LVB)</Link></li>
                  <li><Link href="/dating-met-autisme" className="hover:text-white transition-colors">Dating met Autisme</Link></li>
                  <li><Link href="/dating-met-beperking" className="hover:text-white transition-colors">Dating met Beperking</Link></li>
                  <li><Link href="/dating-voor-slechtzienden" className="hover:text-white transition-colors">Dating voor Slechtzienden</Link></li>
                </ul>
              </nav>
              <nav aria-label="Informatie">
                <h3 className="font-bold mb-4">Informatie</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="/kennisbank" className="hover:text-white transition-colors">Kennisbank</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/professionals" className="hover:text-white transition-colors">Voor professionals</Link></li>
                  <li><Link href="/support/faq" className="hover:text-white transition-colors">Veelgestelde vragen</Link></li>
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
