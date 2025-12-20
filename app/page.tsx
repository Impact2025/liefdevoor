'use client'

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Users, MessageCircle, Bell, Check, Star, Sparkles, Lock, ArrowRight } from "lucide-react";
import { useSession, signOut } from 'next-auth/react'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session) {
      fetchUnreadCount()
      setupNotificationStream()
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [session])

  const eventSourceRef = useRef<EventSource | null>(null)

  const setupNotificationStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    eventSourceRef.current = new EventSource('/api/notifications/stream')

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setUnreadCount(data.unreadCount)
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSourceRef.current.onerror = (error) => {
      console.error('SSE error:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  // Dashboard voor ingelogde gebruikers
  if (session) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
              <Heart className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Welkom terug, <span className="text-primary-500">{session.user?.name || 'Gebruiker'}</span>
            </h1>
            <p className="text-lg text-slate-500">
              Ontdek vandaag nog nieuwe matches
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Link
              href="/discover"
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all text-center"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Heart className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Ontdekken</h3>
              <p className="text-sm text-slate-500">Vind nieuwe matches</p>
            </Link>

            <Link
              href="/matches"
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all text-center"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <MessageCircle className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Matches</h3>
              <p className="text-sm text-slate-500">Chat met matches</p>
            </Link>

            <Link
              href="/notifications"
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all text-center relative"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-200 transition-colors relative">
                <Bell className="w-7 h-7 text-primary-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Meldingen</h3>
              <p className="text-sm text-slate-500">Bekijk updates</p>
            </Link>

            <Link
              href="/profile"
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all text-center"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Users className="w-7 h-7 text-primary-500" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Profiel</h3>
              <p className="text-sm text-slate-500">Bewerk profiel</p>
            </Link>
          </div>

          <div className="text-center">
            <button
              onClick={() => signOut()}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Landing page voor bezoekers
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/LiefdevoorIedereen_logo.png"
                alt="Liefde Voor Iedereen"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-xl font-bold text-white">Liefde Voor Iedereen</span>
            </div>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-medium rounded-full hover:bg-white/20 transition-colors"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/LiefdevoorLiedereen_datingsite.png"
            alt="Een gelukkig koppel dat lacht in een café"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center center" }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <ShieldCheck className="w-5 h-5 text-trust-400" />
              <span className="text-sm font-medium tracking-wide">Veilig & Geverifieerd daten</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Vind liefde <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">
                zonder gedoe.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-xl md:text-2xl text-slate-200 mb-10 leading-relaxed max-w-lg">
              Het datingplatform waar eerlijkheid wint. Met slimme hulp voor je profiel en focus op echte connecties.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="group px-8 py-4 bg-stone-500 hover:bg-primary-600 text-white text-lg font-bold rounded-2xl shadow-lg shadow-primary-900/30 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <Heart className="w-5 h-5 fill-current" />
                Gratis Starten
              </Link>

              <Link
                href="/prijzen"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-lg font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                Bekijk abonnementen
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center gap-4 text-sm text-slate-300 font-medium">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
                ].map((src, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden">
                    <Image
                      src={src}
                      alt=""
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
              <p>Al <strong className="text-white">10.000+</strong> matches gemaakt</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Upgraded */}
      <section className="py-16 bg-stone-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black text-slate-800 mb-2">50K+</div>
              <div className="text-slate-600 font-medium">Actieve leden</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-slate-800 mb-2">10K+</div>
              <div className="text-slate-600 font-medium">Succesvolle matches</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-slate-800 mb-2 flex items-center justify-center gap-1">
                4.9 <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-slate-600 font-medium">Beoordeling</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-slate-800 mb-2">100%</div>
              <div className="text-slate-600 font-medium">Nederlands</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Upgraded with visuals */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Waarom kiezen voor ons?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We maken daten veilig, eerlijk en leuk voor iedereen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-stone-50 to-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-trust-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-trust-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Geverifieerde profielen</h3>
              <p className="text-slate-600 leading-relaxed">
                Elk profiel wordt gecontroleerd. Geen nep-accounts, alleen echte mensen die serieus op zoek zijn.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-stone-50 to-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Slimme matching</h3>
              <p className="text-slate-600 leading-relaxed">
                Onze technologie leert wat je leuk vindt en toont je mensen die echt bij je passen.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-stone-50 to-white p-8 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Jouw privacy voorop</h3>
              <p className="text-slate-600 leading-relaxed">
                Jij bepaalt wat je deelt. We verkopen nooit je gegevens en je kunt altijd alles verwijderen.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works - Bento Grid */}
      <HowItWorksSection />

      {/* Testimonials - With Photos */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Succesverhalen
            </h2>
            <p className="text-xl text-slate-600">
              Lees hoe anderen de liefde vonden
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Na jaren van twijfelen heb ik eindelijk de stap gezet. Binnen 3 maanden vond ik mijn huidige partner. We zijn nu 2 jaar samen!",
                name: "Sarah & Mark",
                location: "Amsterdam",
                image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=400&fit=crop"
              },
              {
                quote: "De kwaliteit van de profielen is echt veel beter dan andere apps. Eindelijk serieuze mensen die ook echt op zoek zijn naar een relatie.",
                name: "Thomas & Lisa",
                location: "Rotterdam",
                image: "https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?w=400&h=400&fit=crop"
              },
              {
                quote: "Wat ik fijn vind is dat de site echt focust op veiligheid. Je voelt je gerespecteerd en serieus genomen als lid.",
                name: "Emma & David",
                location: "Utrecht",
                image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-stone-50 rounded-3xl overflow-hidden"
              >
                <div className="aspect-square relative">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Klaar om de liefde te vinden?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Sluit je aan bij duizenden singles die hun match al vonden. Gratis aanmelden duurt maar 2 minuten.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-white text-primary-600 text-lg font-bold py-4 px-10 rounded-2xl hover:bg-stone-50 transition-colors shadow-lg"
            >
              Start nu gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {["SSL Beveiligd", "AVG Compliant", "Nederlands bedrijf", "24/7 Support"].map((badge, i) => (
              <div key={i} className="flex items-center space-x-2 text-slate-500">
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-2 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/LiefdevoorIedereen_logo.png"
                  alt="Liefde Voor Iedereen"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-lg font-bold">Liefde Voor Iedereen</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Het dating platform waar echte connecties ontstaan. Veilig, betrouwbaar en 100% Nederlands.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/discover" className="hover:text-white transition-colors">Ontdekken</Link></li>
                <li><Link href="/matches" className="hover:text-white transition-colors">Matches</Link></li>
                <li><Link href="/prijzen" className="hover:text-white transition-colors">Abonnementen</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Informatie</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Over ons</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Juridisch</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Algemene voorwaarden</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookiebeleid</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Liefde Voor Iedereen. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
