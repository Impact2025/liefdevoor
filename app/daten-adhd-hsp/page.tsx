import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight, ShieldCheck, Clock, Layers } from 'lucide-react'
import { FaqAccordion } from './FaqAccordion'

const BASE_URL = 'https://www.liefdevooriedereen.nl'

export const metadata: Metadata = {
  title: 'Daten met ADHD & HSP | Neurodiversiteit Dating | Liefde Voor Iedereen',
  description: 'Daten met ADHD of als HSP hoogsensitief persoon. Vind dating zonder oordeel over impulsiviteit of gevoeligheid. Neurodiversiteit is hier de norm. Gratis aanmelden.',
  keywords: [
    'daten met adhd',
    'hsp dating',
    'hoogsensitief daten',
    'neurodiversiteit dating',
    'adhd relatie tips',
    'daten als hsp',
    'dating neurodiversiteit',
    'hsp relatie',
    'adhd dating tips',
    'hoogsensitief in de liefde',
    'partner met adhd',
    'daten adhd hsp',
    'neurodiversiteit en relaties',
    'adhd en relaties',
    'hsp partner vinden',
    'datingsite neurodiversiteit',
  ],
  openGraph: {
    title: 'Daten met ADHD & HSP | Liefde Voor Iedereen',
    description: 'Daten met ADHD of als hoogsensitief persoon zonder oordeel. Vind iemand die jouw energie en gevoeligheid waardeert.',
    url: `${BASE_URL}/daten-adhd-hsp`,
    siteName: 'Liefde Voor Iedereen',
    locale: 'nl_NL',
    type: 'website',
    images: [{ url: `${BASE_URL}/api/og?title=Daten%20met%20ADHD%20%26%20HSP&description=Neurodiversiteit%20dating%20zonder%20oordeel`, width: 1200, height: 630, alt: 'Daten met ADHD en HSP' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daten met ADHD & HSP | Liefde Voor Iedereen',
    description: 'Daten met ADHD of als hoogsensitief persoon zonder oordeel.',
  },
  alternates: { canonical: `${BASE_URL}/daten-adhd-hsp` },
  robots: { index: true, follow: true },
}

const faqItems = [
  {
    question: 'Hoe date je succesvol als je ADHD hebt?',
    answer: 'Wees open over je ADHD — je hoeft het niet te verbergen. Kies actieve eerste dates zodat je energie kwijt kunt. Geef eerlijk aan dat je soms vergeet te antwoorden; dat is geen onverschilligheid. Op Liefde Voor Iedereen vind je mensen die dit begrijpen.',
  },
  {
    question: 'Wat is een HSP en hoe beïnvloedt het daten?',
    answer: 'HSP staat voor Hoogsensitief Persoon. Ongeveer 15 tot 20 procent van de bevolking verwerkt prikkels dieper en voelt emoties intenser. Bij daten betekent dit dat je snel overweldigd raakt door oppervlakkige gesprekken of lawaaierige omgevingen. Jij zoekt diepte en echtheid — en die vind je hier.',
  },
  {
    question: 'Komen ADHD en HSP vaak samen voor?',
    answer: 'Ja, vaker dan mensen denken. Veel mensen met ADHD zijn ook hoogsensitief. De combinatie kan intens zijn: hoge energie én diepe gevoeligheid. Op ons platform vind je partners die beide kanten kennen.',
  },
  {
    question: 'Moet ik mijn ADHD of HSP meteen vertellen?',
    answer: 'Dat is jouw keuze, er is geen goed of fout moment. Veel mensen kiezen ervoor om het te noemen na een paar gesprekken, wanneer er een klik is. Op ons platform zijn veel mensen zelf neurodivers — je hoeft je niet te verklaren.',
  },
  {
    question: 'Wat voor partner past bij iemand met ADHD?',
    answer: 'Mensen met ADHD hebben vaak baat bij een partner die geduldig is, structuur biedt zonder controlerend te zijn, en die spontaniteit waardeert. Iemand die niet snel beledigd is als je iets vergeet, en die direct communiceert.',
  },
  {
    question: 'En wat voor partner past bij een HSP?',
    answer: 'HSPs floreren naast partners die emotioneel beschikbaar zijn, rustige dates waarderen en eerlijk communiceren. Iemand die jouw gevoeligheid als kracht ziet, niet als zwakte.',
  },
  {
    question: 'Hoe ga ik om met de overweldiging van online daten als HSP?',
    answer: 'Stel grenzen: beantwoord berichten op jouw tempo. Plan vaste momenten voor de app in plaats van continu beschikbaar te zijn. Kies voor één gesprek tegelijk. Bij ons kun je zelf het tempo bepalen — geen druk, geen pushmeldingen die je achtervolgen.',
  },
  {
    question: 'Is Liefde Voor Iedereen gratis?',
    answer: 'Aanmelden en profielen bekijken is volledig gratis. Voor berichten versturen heb je een betaald account nodig. We bieden betaalbare abonnementen zonder verborgen kosten.',
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
      description: 'Daten met ADHD of als hoogsensitief persoon zonder oordeel.',
      inLanguage: 'nl-NL',
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
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
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

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/images/LiefdevoorIedereen_logo.png"
                  alt="Liefde Voor Iedereen"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="text-lg font-semibold text-white">Liefde Voor Iedereen</span>
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors"
              >
                Inloggen
              </Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative flex items-center min-h-[85vh] overflow-hidden bg-slate-900">
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, #6366f1 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #0ea5e9 0%, transparent 50%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 w-full">
            <div className="max-w-2xl">
              <nav aria-label="Broodkruimelpad" className="mb-8">
                <ol className="flex items-center gap-2 text-sm text-white/50">
                  <li><Link href="/" className="hover:text-white/80 transition-colors">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white/70">Daten met ADHD &amp; HSP</li>
                </ol>
              </nav>

              <p className="text-indigo-300 text-sm font-semibold tracking-widest uppercase mb-4">
                Neurodiversiteit &amp; dating
              </p>

              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Daten met ADHD<br />of als HSP
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-xl">
                Te impulsief, te gevoelig — dat bestaat niet hier.
                Vind iemand die jou begrijpt zoals je bent.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register?source=adhd-hsp"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Gratis aanmelden
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#voor-jou"
                  className="inline-flex items-center justify-center px-7 py-4 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-colors"
                >
                  Meer lezen
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── VOOR JOU ── */}
        <section id="voor-jou" className="py-28 bg-white" aria-labelledby="voor-jou-heading">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="max-w-xl mb-16">
              <h2 id="voor-jou-heading" className="text-3xl font-bold text-slate-900 mb-4">
                Of je nu ADHD hebt, HSP bent — of allebei
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Beide eigenschappen worden hier begrepen. Niet weggewuifd, niet gecorrigeerd.
              </p>
            </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "HowTo",
                  name: "Zo date je succesvol met ADHD of als HSP",
                  description: "Stappenplan voor neurodiverse daters om fijne en veilige dates te hebben.",
                  step: [
                    { "@type": "HowToStep", position: 1, name: "Kies het juiste platform", text: "Kies een platform dat neurodiversiteit begrijpt. Liefde Voor Iedereen is ontworpen voor ADHD- en HSP-daters." },
                    { "@type": "HowToStep", position: 2, name: "Stel een eerlijk profiel op", text: "Schrijf wie je bent. Vermeld je ADHD of HSP als het goed voelt. Eerlijkheid trekt de juiste mensen aan." },
                    { "@type": "HowToStep", position: 3, name: "Bepaal je eigen tempo", text: "Jij bepaalt wanneer je reageert. HSP: vaste momenten. ADHD: gebruik hyperfocus voor goede gesprekken." },
                    { "@type": "HowToStep", position: 4, name: "Kies een passende date", text: "Rustig café voor HSP, actieve wandeling voor ADHD. Vermijd overprikkelende plekken." },
                    { "@type": "HowToStep", position: 5, name: "Communiceer duidelijk", text: "Wees eerlijk. ADHD: directe communicatie. HSP: diepgang en rust. Een goede match begrijpt dit." },
                  ],
                }),
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="border border-slate-200 rounded-2xl p-8">
                <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-amber-400 rounded-full" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Als je ADHD hebt</h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  Vol energie, diepe passies, soms impulsief — en weleens vergeten te antwoorden.
                  Dat is wie jij bent. Er zijn mensen die daarop vallen.
                </p>
                <ul className="space-y-2 text-slate-600">
                  {[
                    'Spontaniteit wordt gewaardeerd, niet veroordeeld',
                    'Geen passief-agressieve reacties als je vergeet te antwoorden',
                    'Directe communicatie is de norm hier',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="border border-slate-200 rounded-2xl p-8">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Als je HSP bent</h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  Je voelt alles intens, hebt diepte nodig in gesprekken en raakt snel
                  overweldigd door oppervlakkigheid. Jouw gevoeligheid is geen zwakte.
                </p>
                <ul className="space-y-2 text-slate-600">
                  {[
                    'Jij bepaalt het tempo — geen app die je pusht',
                    'Diepgang boven smalltalk, altijd',
                    'Rustige, echte connecties als uitgangspunt',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="mt-6 border border-slate-200 rounded-2xl p-8 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">ADHD en HSP samen</h3>
              <p className="text-slate-500 leading-relaxed max-w-2xl">
                Veel mensen met ADHD zijn ook hoogsensitief. Hoge energie én diepe gevoeligheid
                tegelijkertijd — dat is intensief. Op ons platform vind je mensen die dit kennen
                vanuit eigen ervaring.
              </p>
            </div>
          </div>
        </section>

        {/* ── PLATFORM ── */}
        <section className="py-28 bg-slate-50 border-y border-slate-100" aria-labelledby="platform-heading">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="max-w-xl mb-16">
              <h2 id="platform-heading" className="text-3xl font-bold text-slate-900 mb-4">
                Hoe ons platform werkt voor jou
              </h2>
              <p className="text-lg text-slate-500">
                Bewust anders gebouwd dan andere dating apps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />,
                  bg: 'bg-emerald-50 border-emerald-200',
                  title: 'Geverifieerde profielen',
                  desc: 'Alle profielen worden handmatig gecontroleerd. Geen nepaccounts, geen energieverspilling aan mensen die niet echt zijn.',
                },
                {
                  icon: <Clock className="w-5 h-5 text-indigo-600" aria-hidden="true" />,
                  bg: 'bg-indigo-50 border-indigo-200',
                  title: 'Jij bepaalt het tempo',
                  desc: 'Geen tijdsdruk om te antwoorden, geen algoritme dat je pusht. Actief als je er zin in hebt, rust als je het nodig hebt.',
                },
                {
                  icon: <Layers className="w-5 h-5 text-amber-600" aria-hidden="true" />,
                  bg: 'bg-amber-50 border-amber-200',
                  title: 'Diepgang centraal',
                  desc: 'Profielen met echte vragen over wie je bent. Vind iemand die kijkt naar je persoonlijkheid, niet alleen je foto.',
                },
              ].map((f) => (
                <article key={f.title} className="bg-white border border-slate-200 rounded-2xl p-7">
                  <div className={`w-9 h-9 border rounded-lg flex items-center justify-center mb-5 ${f.bg}`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-28 bg-white" aria-labelledby="reviews-heading">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="max-w-xl mb-16">
              <h2 id="reviews-heading" className="text-3xl font-bold text-slate-900 mb-4">
                Ervaringen van ADHD- en HSP-daters
              </h2>
              <p className="text-lg text-slate-500">Echte verhalen van mensen zoals jij</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: 'Op andere apps werd mijn enthousiasme als te veel gezien. Hier is mijn energie juist een pluspunt. Ik heb eindelijk iemand gevonden die van mijn spontaniteit geniet.',
                  name: 'Lisa, 28',
                  label: 'ADHD',
                  city: 'Amsterdam',
                },
                {
                  quote: 'Als HSP was online daten altijd overweldigend. Nu kan ik op mijn eigen tempo antwoorden en zoek ik mensen die diepgang waarderen. Dat maakt alles anders.',
                  name: 'Sanne, 31',
                  label: 'HSP',
                  city: 'Utrecht',
                },
                {
                  quote: 'Ik heb zowel ADHD als HSP. Hier vond ik iemand die beide begrijpt. We vullen elkaar perfect aan.',
                  name: 'Daan, 34',
                  label: 'ADHD + HSP',
                  city: 'Eindhoven',
                },
              ].map((t) => (
                <article key={t.name} className="border border-slate-200 rounded-2xl p-7">
                  <blockquote className="text-slate-600 leading-relaxed mb-6 text-sm">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.city}</div>
                    </div>
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                      {t.label}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-28 bg-slate-50 border-t border-slate-100" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="mb-16">
              <h2 id="faq-heading" className="text-3xl font-bold text-slate-900 mb-4">
                Veelgestelde vragen
              </h2>
              <p className="text-lg text-slate-500">
                Over daten met ADHD, HSP en neurodiversiteit
              </p>
            </div>
            <FaqAccordion items={faqItems} />
            <div className="mt-10">
              <Link
                href="/support/faq"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
              >
                Alle veelgestelde vragen
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── GERELATEERD ── */}
        <section className="py-20 bg-white border-t border-slate-100" aria-labelledby="meer-info-heading">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 id="meer-info-heading" className="text-xl font-semibold text-slate-900 mb-8">
              Meer over neurodiversiteit en dating
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { href: '/dating-met-autisme', title: 'Dating met Autisme', desc: 'Daten als autist of met een autistische partner.' },
                { href: '/kennisbank', title: 'Kennisbank', desc: 'Gidsen over relaties, communicatie en neurodiversiteit.' },
                { href: '/veilig-daten-lvb', title: 'Veilig Daten (LVB)', desc: 'Daten met een licht verstandelijke beperking.' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group p-5 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="font-medium text-slate-900 group-hover:text-indigo-700 transition-colors mb-1 text-sm">{l.title}</div>
                  <div className="text-slate-400 text-sm">{l.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 bg-slate-900" aria-labelledby="cta-heading">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-4xl font-bold text-white mb-5">
              Klaar om iemand te vinden die jou begrijpt?
            </h2>
            <p className="text-lg text-slate-400 mb-10">
              Aanmelden is gratis. Jij bepaalt het tempo — altijd.
            </p>
            <Link
              href="/register?source=adhd-hsp"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors"
            >
              Gratis aanmelden
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-slate-500 text-sm">
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-slate-600" aria-hidden="true" /><span>Geen creditcard</span></div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-slate-600" aria-hidden="true" /><span>Nederlands bedrijf</span></div>
              <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-slate-600" aria-hidden="true" /><span>AVG compliant</span></div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-slate-950 text-white py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/images/LiefdevoorIedereen_logo.png" alt="Liefde Voor Iedereen" width={24} height={24} className="object-contain" />
                  <span className="font-semibold">Liefde Voor Iedereen</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Dating voor neurodiverse singles. Iedereen welkom.
                </p>
              </div>
              <nav aria-label="Communities">
                <h3 className="text-sm font-semibold mb-4 text-slate-300">Communities</h3>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link href="/daten-adhd-hsp" className="hover:text-white transition-colors">Daten ADHD &amp; HSP</Link></li>
                  <li><Link href="/dating-met-autisme" className="hover:text-white transition-colors">Dating met Autisme</Link></li>
                  <li><Link href="/veilig-daten-lvb" className="hover:text-white transition-colors">Veilig Daten (LVB)</Link></li>
                  <li><Link href="/dating-met-beperking" className="hover:text-white transition-colors">Dating met Beperking</Link></li>
                </ul>
              </nav>
              <nav aria-label="Informatie">
                <h3 className="text-sm font-semibold mb-4 text-slate-300">Informatie</h3>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link href="/kennisbank" className="hover:text-white transition-colors">Kennisbank</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/support/faq" className="hover:text-white transition-colors">Veelgestelde vragen</Link></li>
                  <li><Link href="/prijzen" className="hover:text-white transition-colors">Prijzen</Link></li>
                </ul>
              </nav>
              <nav aria-label="Juridisch">
                <h3 className="text-sm font-semibold mb-4 text-slate-300">Juridisch</h3>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Algemene voorwaarden</Link></li>
                  <li><Link href="/cookies" className="hover:text-white transition-colors">Cookiebeleid</Link></li>
                </ul>
              </nav>
            </div>
            <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-600">
              <p>&copy; {new Date().getFullYear()} Liefde Voor Iedereen. Alle rechten voorbehouden.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
