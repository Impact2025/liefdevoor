'use client'

import Image from "next/image";
import Link from "next/link";
import { Heart, ShieldCheck, Smile, Bell } from "lucide-react";
import { useSession, signOut } from 'next-auth/react'
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

  if (session) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mb-6 bg-white p-4 rounded-full shadow-sm inline-block">
              <Heart className="w-12 h-12 text-primary fill-current" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Welkom, <span className="text-primary">{session.user?.name || 'Gebruiker'}</span>!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Je bent succesvol ingelogd bij Liefde Voor Iedereen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link
              href="/discover"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-lg mb-2">Ontdekken</h3>
              <p className="text-gray-600">Vind nieuwe matches</p>
            </Link>

            <Link
              href="/matches"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold">💬</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Matches</h3>
              <p className="text-gray-600">Chat met je matches</p>
            </Link>

            <Link
              href="/notifications"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center relative"
            >
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center relative">
                <Bell className="w-4 h-4 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">Meldingen</h3>
              <p className="text-gray-600">Bekijk je meldingen</p>
            </Link>

            <Link
              href="/profile"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold">👤</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Profiel</h3>
              <p className="text-gray-600">Bewerk je profiel</p>
            </Link>
          </div>

          <div className="text-center">
            <button
              onClick={() => signOut()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary fill-current" />
              <span className="text-xl font-bold text-gray-900">Liefde Voor Iedereen</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors">Blog</Link>
              <Link href="/discover" className="text-gray-600 hover:text-primary transition-colors">Ontdekken</Link>
              <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-hover transition-colors">
                Inloggen
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Vind je <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">ware liefde</span> in een veilige omgeving
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                  Ontdek betekenisvolle connecties met mensen die bij je passen. Ons AI-powered platform maakt dating makkelijker, leuker en veiliger dan ooit.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
                >
                  Start je liefdesverhaal
                </Link>
                <Link
                  href="/blog"
                  className="border-2 border-gray-300 text-gray-700 text-lg font-semibold py-4 px-8 rounded-full hover:border-primary hover:text-primary transition-colors text-center"
                >
                  Lees onze verhalen
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-gray-600">Gelukkige stellen</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-gray-600">Actieve leden</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.9★</div>
                  <div className="text-sm text-gray-600">Gebruikersrating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Image
                  src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&q=80&w=800"
                  alt="Gelukkig stel op date"
                  width={600}
                  height={800}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 transform rotate-6 hover:rotate-0 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">100% Veilig</div>
                    <div className="text-sm text-gray-600">Geverifieerde profielen</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 transform -rotate-6 hover:rotate-0 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🤖</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">AI Matching</div>
                    <div className="text-sm text-gray-600">Slimme suggesties</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Waarom kiezen voor Liefde Voor Iedereen?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combineren moderne technologie met echte menselijke connecties voor de beste dating ervaring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">100% Veilig</h3>
              <p className="text-gray-600">
                Geavanceerde verificatie systemen en AI-gedreven moderatie houden onze community veilig.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Slim Matching</h3>
              <p className="text-gray-600">
                Onze AI analyseert compatibiliteit, interesses en gedrag voor de beste matches.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Betekenisvolle Gesprekken</h3>
              <p className="text-gray-600">
                AI-gedreven icebreakers en conversation starters maken het makkelijker om te connecteren.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Wat onze gebruikers zeggen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Dankzij de AI icebreakers heb ik eindelijk de moed gehad om mijn crush aan te spreken. We zijn nu 6 maanden samen!"
              </p>
              <div className="font-semibold text-gray-900">Sarah, 28</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Het locatie-based matching is geweldig. Ik ontmoet alleen mensen in mijn buurt die dezelfde interesses delen."
              </p>
              <div className="font-semibold text-gray-900">Mike, 32</div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Eindelijk een dating app die serieus is over veiligheid. De verificatie en moderatie zijn top!"
              </p>
              <div className="font-semibold text-gray-900">Emma, 25</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Klaar om je soulmate te vinden?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Sluit je aan bij duizenden singles die hun liefde gevonden hebben op ons platform.
          </p>
          <Link
            href="/register"
            className="bg-white text-primary text-xl font-bold py-4 px-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block"
          >
            Start Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-primary fill-current" />
                <span className="text-lg font-bold">Liefde Voor Iedereen</span>
              </div>
              <p className="text-gray-400">
                Het meest vertrouwde dating platform van Nederland en België.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/discover" className="hover:text-white transition-colors">Ontdekken</Link></li>
                <li><Link href="/matches" className="hover:text-white transition-colors">Matches</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Profiel</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Bedrijf</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Over ons</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ondersteuning</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Voorwaarden</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Liefde Voor Iedereen. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
