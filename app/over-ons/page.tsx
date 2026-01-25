/**
 * Over Ons Page - Wereldklasse LVB-Vriendelijke Versie
 *
 * Dating zonder spelletjes. Voor iedereen.
 * Met het verhaal van Remco Slop die Vincent inspireerde.
 */

import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  Shield,
  Users,
  Bot,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
  Quote,
  Eye,
  AlertTriangle,
  Lock,
  Trash2,
  Download,
  Building2,
  Mail,
  Phone,
  Play,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Search
} from 'lucide-react'
import { FAQAccordion } from './faq-accordion'
import { FeatureAccordion } from './feature-accordion'

export const metadata: Metadata = {
  title: 'Over Ons - Dating Zonder Spelletjes Voor Iedereen | Liefde Voor Iedereen',
  description: 'Sinds 2009 helpen we mensen elkaar vinden. Veilig, eerlijk, zonder gedoe. Voor iedereen in Nederland en België. Probeer 2 maanden gratis Premium.',
  openGraph: {
    title: 'Over Ons - Dating Zonder Spelletjes Voor Iedereen',
    description: 'Sinds 2009 helpen we mensen elkaar vinden. Veilig, eerlijk, zonder gedoe.',
  }
}

export default function OverOnsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HERO SECTIE ==================== */}
      <section className="relative bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white overflow-hidden">
        {/* Decoratieve elementen */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Dating zonder spelletjes.
                <br />
                <span className="text-rose-100">Voor iedereen in Nederland en België.</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-rose-100 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Sinds 2009 helpen we mensen elkaar vinden.
                <br />
                Veilig. Eerlijk. Zonder gedoe.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  href="/register?promo=2maanden"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Probeer 2 maanden gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#verhaal"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 text-white text-lg font-semibold rounded-2xl transition-all backdrop-blur-sm border border-white/30"
                >
                  Lees ons verhaal
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-rose-100 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>1.500+ actieve leden</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>1.000+ koppels sinds 2009</span>
                </div>
              </div>
            </div>

            {/* Hero Image - Hands Connection */}
            <div className="relative hidden lg:block">
              <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hands-connection.jpg"
                  alt="Verbinding - twee handen die elkaar vasthouden"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Caption */}
              <p className="text-center mt-4 text-rose-200 text-sm italic">
                Verbinding zonder grenzen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTIE 1: WAT MAAKT ONS ANDERS ==================== */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Waarom mensen voor ons kiezen
            </h2>
            <p className="text-xl text-slate-600">
              We zijn anders dan andere datingsites.
              <br />
              Lees hieronder waarom.
            </p>
          </div>

          {/* Feature Accordions */}
          <FeatureAccordion />
        </div>
      </section>

      {/* ==================== SECTIE 2: HOE HET BEGON - VINCENT'S VERHAAL ==================== */}
      <section id="verhaal" className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Waarom ik dit doe
            </h2>
          </div>

          {/* Vincent Introduction */}
          <div className="grid md:grid-cols-[200px_1fr] gap-8 mb-16 items-start">
            <div className="text-center md:text-left">
              <div className="w-40 h-40 mx-auto md:mx-0 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                {/* Vincent's foto placeholder */}
                <div className="text-center">
                  <Heart className="w-16 h-16 text-rose-400" />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">Vincent van Munster</p>
              <p className="text-slate-600">Oprichter sinds 2009</p>
            </div>
            <div>
              <p className="text-xl text-slate-700 leading-relaxed mb-4">
                Sinds 2009 werk ik aan dating.
              </p>
              <p className="text-xl text-slate-700 leading-relaxed mb-4">
                Maar het echte verhaal begint eerder.
              </p>
              <p className="text-xl text-slate-700 leading-relaxed">
                In 2009 ontmoette ik iemand die alles veranderde.
              </p>
            </div>
          </div>

          {/* Remco's Story */}
          <div className="bg-gradient-to-br from-slate-50 to-stone-50 rounded-3xl p-8 md:p-12 mb-12">
            <div className="grid md:grid-cols-[250px_1fr] gap-8 items-start">
              {/* Remco's Foto */}
              <div className="relative">
                <div className="aspect-[4/5] relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/remco-slop.jpg"
                    alt="Remco Slop (1968-2015) - Medeoprichter Stichting WW Toegankelijk"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-center mt-4 text-slate-600 font-medium">Remco Slop (1968-2015)</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  De persoon die alles veranderde
                </h3>

                <div className="space-y-4 text-lg text-slate-700 leading-relaxed">
                  <p>In 2009 ging ik op reis.</p>
                  <p>Daar ontmoette ik Remco Slop.</p>
                  <p>Remco was zwaar spastisch.</p>
                  <p>Hij was gay.</p>
                  <p className="font-semibold text-slate-900">Maar vooral: hij was een fantastisch mens.</p>
                </div>

                <div className="mt-6 space-y-4 text-lg text-slate-700 leading-relaxed">
                  <p>
                    Remco was medeoprichter van{' '}
                    <a
                      href="https://stichtingwwtoegankelijk.nl/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:text-rose-700 underline"
                    >
                      Stichting WW Toegankelijk
                    </a>.
                  </p>
                  <p>Jarenlang was hij actief als vrijwilliger.</p>
                  <p>Elk jaar ging hij naar Gambia.</p>
                  <p>Daar hielp hij bij projecten voor kinderen.</p>
                  <p>Die kinderen hadden zijn bijzondere aandacht.</p>
                  <p>Tot het laatste moment bleef hij zich inzetten voor anderen.</p>
                </div>

                <div className="mt-6 p-4 bg-slate-100 rounded-xl">
                  <p className="text-slate-600 italic">
                    Op 20 oktober 2015 is Remco overleden.
                    <br />
                    Zijn gedachtegoed leeft voort in alles wat wij doen.
                  </p>
                </div>

                <div className="mt-8 p-6 bg-white rounded-2xl border-2 border-rose-200">
                  <p className="text-lg text-slate-700 leading-relaxed">
                    <span className="font-bold text-rose-600">Remco leerde me iets belangrijks:</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                      <span className="text-slate-700">Iedereen heeft een beperking.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                      <span className="text-slate-700">Iedereen heeft ook een talent.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                      <span className="text-slate-700">En iedereen verdient liefde.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Box */}
          <div className="relative bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white mb-12">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-white/20" />
            <blockquote className="relative text-2xl md:text-3xl font-bold text-center leading-relaxed mb-6">
              "Iedereen heeft een beperking.
              <br />
              Iedereen heeft een talent.
              <br />
              Iedereen verdient liefde."
            </blockquote>
            <p className="text-center text-rose-100">
              — Remco Slop (1968 - 2015)
            </p>
          </div>

          {/* Wat Remco me leerde */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Wat Remco me leerde</h3>
              <div className="space-y-3 text-lg text-slate-700">
                <p>Remco had passie.</p>
                <p>Remco was eerlijk.</p>
                <p>Remco had zoveel energie.</p>
                <p>Ondanks zijn beperking hielp hij anderen.</p>
                <p>In Nederland. In Gambia. Overal.</p>
                <p className="pt-4">Hij liet me zien:</p>
                <p className="font-semibold text-slate-900">Het gaat niet om wat je níet kunt.</p>
                <p className="font-semibold text-slate-900">Het gaat om wie je bent.</p>
                <p className="pt-4">Dankzij Remco besloot ik:</p>
                <p className="text-rose-600 font-semibold">Ik ga geluksmomenten creëren.</p>
                <p className="text-rose-600 font-semibold">Voor iedereen die liefde zoekt.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Van idee naar platform</h3>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-rose-600">2009: G-Date.nl</p>
                  <p className="text-slate-700">Mijn eerste datingsite.</p>
                  <p className="text-slate-700">Ik wilde een plek maken waar iedereen welkom is.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">De afgelopen 15 jaar:</p>
                  <ul className="text-slate-700 space-y-1">
                    <li>• Meer dan 10.000 oplichters gestopt</li>
                    <li>• De trucs van scammers geleerd</li>
                    <li>• Duizenden mensen geholpen</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-emerald-600">2019: OogvoorLiefde.nl</p>
                  <p className="text-slate-700">Speciaal voor mensen met een beperking.</p>
                  <p className="text-slate-700">Want grenzen? Die bestaan alleen in je hoofd.</p>
                </div>
                <div>
                  <p className="font-bold text-rose-600">2026: Liefde Voor Iedereen</p>
                  <p className="text-slate-700">De naam zegt het al.</p>
                  <p className="text-slate-700 font-semibold">Voor iedereen. Zonder uitzondering.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Persoonlijke Missie Box */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 md:p-12 border-2 border-rose-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Mijn belofte aan jou</h3>
            <div className="space-y-4 text-lg text-slate-700">
              <p>Ik ken de wereld van online dating.</p>
              <p>Ik ken de gevaren.</p>
              <p>Ik ken de eenzaamheid die mensen voelen.</p>
              <p className="pt-4">Daarom maak ik deze site elke dag beter.</p>
              <p>Veiliger. Eerlijker.</p>
              <p className="pt-4 font-bold text-rose-600 text-xl">
                Want ik geloof nog steeds in Remco's woorden:
              </p>
              <p className="font-bold text-rose-600 text-xl">Iedereen verdient liefde.</p>
              <p className="font-bold text-rose-600 text-xl">Ook jij.</p>
            </div>
            <p className="mt-8 text-slate-900 font-semibold">— Vincent</p>
          </div>
        </div>
      </section>

      {/* ==================== SECTIE 3: VEILIGHEID ==================== */}
      <section id="veiligheid" className="py-20 lg:py-28 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Zo beschermen we jou
            </h2>
            <p className="text-xl text-slate-300">
              Romance oplichters zijn overal.
              <br />
              Zij stelen geld en breken harten.
              <br />
              Wij stoppen hen.
            </p>
          </div>

          {/* 3 Kolommen */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Kolom 1: Slimme computer */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Slimme computer</h3>
              <p className="text-slate-300 mb-4">Onze AI controleert:</p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Elk profiel binnen 24 uur
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Alle foto's (geen gestolen foto's)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Verdachte berichten
                </li>
              </ul>
              <p className="mt-4 text-slate-400 text-sm">
                De computer leert elke dag bij.
                <br />
                Hij wordt steeds slimmer.
              </p>
            </div>

            {/* Kolom 2: Menselijke controle */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Menselijke controle</h3>
              <p className="text-slate-300 mb-4">Vincent en zijn team:</p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Kijken naar verdachte profielen
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Lezen meldingen van gebruikers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Reageren snel (binnen 30 min)
                </li>
              </ul>
              <p className="mt-4 text-slate-400 text-sm">
                Niet alles kan een computer zien.
                <br />
                Daarom kijken ook echte mensen mee.
              </p>
            </div>

            {/* Kolom 3: Jij helpt ook */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Jij helpt ook</h3>
              <p className="text-slate-300 mb-4">Zie je iets verdachts?</p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Klik op de HELP knop
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  We onderzoeken het meteen
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Je helpt anderen ook
                </li>
              </ul>
              <p className="mt-4 text-slate-400 text-sm">
                Samen maken we de site veilig.
              </p>
            </div>
          </div>

          {/* Rode vlaggen box */}
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl p-8 md:p-12 border border-red-500/30">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-2xl font-bold">Herken oplichting: 3 rode vlaggen</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="font-bold text-red-400 mb-2">1. Te snel "ik hou van jou"</p>
                <p className="text-slate-300">
                  Binnen 1 week zegt iemand "ik hou van je"?
                  <br />
                  Dat is niet normaal.
                </p>
              </div>
              <div>
                <p className="font-bold text-red-400 mb-2">2. Vraagt om geld</p>
                <p className="text-slate-300">
                  Echte liefde vraagt nooit om geld.
                  <br />
                  Nooit.
                </p>
              </div>
              <div>
                <p className="font-bold text-red-400 mb-2">3. Geen videogesprek</p>
                <p className="text-slate-300">
                  Wil iemand niet videobellen?
                  <br />
                  Dan is er iets niet goed.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/safety"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Lees onze complete gids tegen oplichting
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTIE 4: TESTIMONIALS ==================== */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Wat onze leden zeggen
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-lg text-slate-700 mb-6 leading-relaxed">
                "Ik was bang om te daten.
                <br />
                Nu heb ik mijn grote liefde gevonden."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-rose-600 font-bold">J</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Jorrit, 28 jaar</p>
                  <p className="text-sm text-slate-500">Lid sinds 2023</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-lg text-slate-700 mb-6 leading-relaxed">
                "Fijn dat alles zo duidelijk is.
                <br />
                Geen moeilijke woorden.
                <br />
                Ik snapte het meteen."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">M</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Maria, 52 jaar</p>
                  <p className="text-sm text-slate-500">Lid sinds 2024</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-lg text-slate-700 mb-6 leading-relaxed">
                "Eindelijk een site zonder spelletjes.
                <br />
                Iedereen hier zoekt echt een relatie."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">A</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ahmed, 34 jaar</p>
                  <p className="text-sm text-slate-500">Lid sinds 2025</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
            >
              Lees meer verhalen op ons blog
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== SECTIE 5: VOOR ZORGORGANISATIES ==================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Voor professionals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Voor zorgorganisaties en begeleiders
            </h2>
            <p className="text-xl text-slate-600">
              Werk je met mensen met een beperking?
              <br />
              We hebben speciale mogelijkheden voor jouw organisatie.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Wat we bieden */}
            <div className="bg-slate-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Wat we bieden</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Groepslicenties met korting</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Dashboard voor begeleiders</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Privacy gewaarborgd (begeleiders zien geen berichten)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Training voor je team</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Persoonlijk contactpersoon</span>
                </li>
              </ul>
            </div>

            {/* Waarom kiezen */}
            <div className="bg-slate-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Waarom organisaties kiezen voor ons</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">AVG-proof volgens strengste regels</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">15 jaar ervaring in de sector</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Begeleiders kunnen ondersteunen zonder privacy te schenden</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">Educatieve modules ingebouwd</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border-2 border-blue-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Interesse voor jouw organisatie?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/professionals/aanmelden"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Plan een gratis demo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/professionals"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors border-2 border-slate-200"
              >
                Meer informatie voor professionals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTIE 6: PRIVACY ==================== */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Jouw privacy is belangrijk
            </h2>
            <p className="text-xl text-slate-600">
              We leggen het in gewone taal uit.
              <br />
              Zodat iedereen het snapt.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Privacy 1 */}
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Jouw gegevens zijn van jou</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dit bewaren we: je naam, e-mail, foto's, berichten.
                <br />
                <br />
                Niemand anders ziet dit.
                <br />
                Alleen jij. En de mensen met wie je chat.
              </p>
            </div>

            {/* Privacy 2 */}
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Hoe we het beschermen</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Alles is versleuteld.
                <br />
                We verkopen nooit jouw gegevens.
                <br />
                We geven ze niet aan anderen.
                <br />
                <br />
                Jouw gegevens blijven privé.
              </p>
            </div>

            {/* Privacy 3 */}
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Download className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Wat je kunt zien</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Je kunt altijd:
                <br />
                • Zien wat we van jou weten
                <br />
                • Je gegevens downloaden
                <br />
                • Je gegevens laten verwijderen
                <br />
                <br />
                Jij bepaalt.
              </p>
            </div>

            {/* Privacy 4 */}
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Je account verwijderen</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Wil je stoppen?
                <br />
                • Klik op "Account verwijderen"
                <br />
                • Alles wordt binnen 30 dagen gewist
                <br />
                <br />
                Geen gedoe. Geen verborgen regels.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
            >
              Bekijk onze privacyverklaring (in gewone taal)
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== SECTIE 7: PRIJZEN ==================== */}
      <section id="prijzen" className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Eerlijke prijzen
            </h2>
            <p className="text-xl text-slate-600">
              Geen verborgen kosten. Geen trucjes.
              <br />
              Dit zijn de echte prijzen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Gratis */}
            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gratis</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">€0</span>
                <span className="text-slate-600"> per maand</span>
              </div>
              <p className="text-slate-600 mb-6">Je krijgt:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Profiel maken
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Foto's uploaden
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Profielen bekijken
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  5 berichten per dag
                </li>
              </ul>
              <p className="text-sm text-slate-500 mb-6">Voor wie: Proberen zonder risico</p>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Gratis aanmelden
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-8 text-white relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-bold rounded-full">
                POPULAIR
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">€11,95</span>
                <span className="text-rose-100"> per maand</span>
              </div>
              <p className="text-rose-100 mb-6">Alles van Gratis, plus:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-300" />
                  Onbeperkt berichten
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-300" />
                  Zie wie je profiel bekijkt
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-300" />
                  Geavanceerde zoekfilters
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-300" />
                  AI DatingAssistent
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-300" />
                  Geen advertenties
                </li>
              </ul>
              <div className="bg-white/20 rounded-xl p-3 mb-6 text-center">
                <p className="font-bold">De eerste 2 maanden gratis!</p>
              </div>
              <Link
                href="/register?promo=2maanden"
                className="block w-full py-3 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
              >
                Start 2 maanden gratis
              </Link>
            </div>

            {/* Gold */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-8 border-2 border-amber-200">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gold</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">€19,95</span>
                <span className="text-slate-600"> per maand</span>
              </div>
              <p className="text-slate-600 mb-6">Alles van Premium, plus:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-amber-500" />
                  Profiel extra zichtbaar
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-amber-500" />
                  Zie wie met je wil matchen
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-amber-500" />
                  Uitgebreide AI hulp
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-amber-500" />
                  Prioriteit klantenservice
                </li>
              </ul>
              <p className="text-sm text-slate-500 mb-6">Voor wie: Serieus op zoek</p>
              <Link
                href="/prijzen"
                className="block w-full py-3 text-center bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
              >
                Kies Gold
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8">
            Je kunt altijd stoppen. Geen gedoe. Geld terug binnen 30 dagen als je niet tevreden bent.
          </p>
        </div>
      </section>

      {/* ==================== SECTIE 8: FAQ ==================== */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Vragen die anderen ook stellen
            </h2>
          </div>

          <FAQAccordion />

          <div className="text-center mt-10 space-y-4">
            <Link
              href="/support/faq"
              className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
            >
              Bekijk alle veelgestelde vragen
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-slate-600">
              Of{' '}
              <Link href="/support" className="text-rose-600 hover:underline">
                stuur ons een bericht
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ==================== SECTIE 9: LAATSTE CTA ==================== */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-rose-100 mb-10 leading-relaxed">
            Doe vandaag nog mee.
            <br />
            Probeer 2 maanden gratis Premium.
            <br />
            Geen betaalgegevens nodig.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register?promo=2maanden"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start 2 maanden gratis
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              href="#hoe-het-werkt"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/20 hover:bg-white/30 text-white text-xl font-semibold rounded-2xl transition-all backdrop-blur-sm border border-white/30"
            >
              Bekijk eerst hoe het werkt
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-rose-100">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-300" />
              <span>Geen betaalgegevens nodig</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-300" />
              <span>2 maanden gratis Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-300" />
              <span>Stop wanneer je wilt</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-300" />
              <span>Al 1.500+ tevreden leden</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER INFO ==================== */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-bold">Liefde Voor Iedereen</p>
              <p className="text-slate-400">Dating zonder spelletjes. Veilig. Eerlijk. Voor iedereen.</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="mailto:support@liefdevooriedereen.nl" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                <span>support@liefdevooriedereen.nl</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
