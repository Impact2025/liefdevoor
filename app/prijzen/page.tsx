/**
 * Prijzen Page - WERELDKLASSE EDITION
 *
 * Premium subscription pricing met moderne glassmorphism design,
 * 3D hover effecten, animaties en crystal-clear value proposition
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Check,
  Shield,
  Star,
  MessageCircle,
  Sparkles,
  Crown,
  Zap,
  Eye,
  Volume2,
  CheckCircle2,
  TrendingUp,
  MapPin,
  EyeOff,
  Gift,
  ArrowRight,
  X,
  Info,
  ChevronDown,
  Users,
  Award,
  Lock
} from 'lucide-react'
import { SUBSCRIPTION_PLANS, CREDIT_PACKS, formatPrice } from '@/lib/pricing'
import CheckoutModal from '@/components/checkout/CheckoutModal'

interface CheckoutData {
  type: 'subscription' | 'credits'
  planId?: string
  planName?: string
  planPrice?: number
  planPeriod?: string
  credits?: number
}

export default function PrijzenPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly')
  const [showFAQ, setShowFAQ] = useState(false)

  // Fetch current subscription on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!session?.user) {
        setIsLoadingSubscription(false)
        return
      }

      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setCurrentPlan(data.plan)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscription()
  }, [session])

  const handleSubscriptionSelect = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) return

    // Prevent selecting current plan
    if (planId === currentPlan) {
      return
    }

    // Redirect to login if not authenticated
    if (!session?.user) {
      router.push('/login?redirect=/prijzen')
      return
    }

    setCheckoutData({
      type: 'subscription',
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      planPeriod: plan.periodLabel,
    })
  }

  const handleCreditSelect = (packId: string) => {
    const pack = CREDIT_PACKS.find(p => p.id === packId)
    if (!pack) return

    if (!session?.user) {
      router.push('/login?redirect=/prijzen')
      return
    }

    setCheckoutData({
      type: 'credits',
      credits: pack.credits,
      planPrice: pack.price,
      planName: `${pack.credits} Superbericht${pack.credits === 1 ? '' : 'en'}`,
    })
  }

  // Enhanced plan configuration with icons
  const planConfigs = {
    FREE: {
      gradient: 'from-gray-50 via-gray-100 to-gray-50',
      borderGradient: 'from-gray-300 to-gray-400',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      glowColor: 'rgba(107, 114, 128, 0.3)',
      icon: Heart,
    },
    PLUS: {
      gradient: 'from-teal-50 via-cyan-50 to-teal-50',
      borderGradient: 'from-teal-400 via-cyan-400 to-teal-400',
      iconBg: 'bg-gradient-to-br from-teal-400 to-cyan-500',
      iconColor: 'text-white',
      glowColor: 'rgba(20, 184, 166, 0.4)',
      icon: Sparkles,
      popular: true,
    },
    COMPLETE: {
      gradient: 'from-purple-50 via-pink-50 to-purple-50',
      borderGradient: 'from-purple-500 via-pink-500 to-purple-500',
      iconBg: 'bg-gradient-to-br from-purple-600 to-pink-600',
      iconColor: 'text-white',
      glowColor: 'rgba(168, 85, 247, 0.5)',
      icon: Crown,
      recommended: true,
    },
  }

  // Feature lists with icons
  const planFeatures = {
    FREE: [
      { icon: Heart, text: 'Profiel aanmaken', highlighted: false },
      { icon: Heart, text: '10 likes per dag', highlighted: false },
      { icon: MessageCircle, text: '1 chat per dag starten', highlighted: false },
      { icon: Eye, text: 'Basis zoekfilters', highlighted: false },
    ],
    PLUS: [
      { icon: Heart, text: 'Onbeperkt likes', highlighted: true },
      { icon: MessageCircle, text: 'Onbeperkt chatten', highlighted: true },
      { icon: Eye, text: 'Zie wie jou leuk vindt', highlighted: true },
      { icon: Volume2, text: 'Audioberichten sturen', highlighted: true },
      { icon: CheckCircle2, text: 'Leesbevestigingen', highlighted: true },
      { icon: Shield, text: 'Geen advertenties', highlighted: true },
    ],
    COMPLETE: [
      { icon: Check, text: 'Alles van Liefde Plus', highlighted: true },
      { icon: Gift, text: '3 Superberichten per maand', highlighted: true },
      { icon: Zap, text: 'Profiel boost (1x/maand)', highlighted: true },
      { icon: TrendingUp, text: 'Prioriteit in zoeken', highlighted: true },
      { icon: Sparkles, text: 'Geavanceerde filters', highlighted: true },
      { icon: MapPin, text: 'Passport (swipe overal)', highlighted: true },
      { icon: EyeOff, text: 'Incognito modus', highlighted: true },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 lg:ml-64 lg:pt-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header - Hidden on desktop */}
      <header className="lg:hidden bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-xl font-semibold text-gray-900">Liefde Voor Iedereen</span>
            </Link>
            {session ? (
              <Link
                href="/discover"
                className="text-primary font-medium hover:underline"
              >
                Terug naar app
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-primary text-white font-medium rounded-full hover:bg-rose-hover transition-colors"
              >
                Inloggen
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-900">Vind sneller je match</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Kies het plan dat
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
              bij jou past
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upgrade voor meer features, betere matches en{' '}
            <span className="font-semibold text-gray-900">onbeperkte mogelijkheden</span>
          </p>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>10.000+ actieve gebruikers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>4.8/5 gemiddelde beoordeling</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>100% veilig betalen</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const config = planConfigs[plan.id as keyof typeof planConfigs]
            const features = planFeatures[plan.id as keyof typeof planFeatures]
            const isCurrentPlan = plan.id === currentPlan
            const Icon = config.icon

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="relative"
              >
                {/* Popular/Recommended Badge */}
                {'popular' in config && config.popular && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                  >
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Star className="w-4 h-4 fill-white" />
                      Meest gekozen
                    </div>
                  </motion.div>
                )}

                {'recommended' in config && config.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Beste waarde
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Huidig plan
                    </div>
                  </div>
                )}

                {/* Card */}
                <motion.div
                  whileHover={{
                    y: (('popular' in config && config.popular) || ('recommended' in config && config.recommended)) ? -12 : -8,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  className={`relative h-full bg-gradient-to-br ${config.gradient} rounded-3xl overflow-hidden ${
                    (('popular' in config && config.popular) || ('recommended' in config && config.recommended)) ? 'md:scale-105' : ''
                  }`}
                  style={{
                    boxShadow: `0 20px 60px -15px ${config.glowColor}`,
                  }}
                >
                  {/* Glassmorphism Border */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${config.borderGradient} opacity-20 blur-sm`} />
                  <div className="absolute inset-[2px] rounded-3xl bg-white/90 backdrop-blur-xl" />

                  {/* Content */}
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 ${config.iconBg} rounded-2xl shadow-lg`}>
                        <Icon className={`w-8 h-8 ${config.iconColor}`} />
                      </div>
                    </div>

                    {/* Plan Name */}
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                      {plan.name}
                    </h2>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{plan.periodLabel}</p>

                      {plan.savings && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="mt-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {plan.savings}
                        </motion.div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      {features.map((feature, idx) => {
                        const FeatureIcon = feature.icon
                        return (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="flex items-start gap-3"
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              feature.highlighted
                                ? 'bg-gradient-to-br from-teal-100 to-cyan-100'
                                : 'bg-gray-100'
                            }`}>
                              <FeatureIcon className={`w-3.5 h-3.5 ${
                                feature.highlighted ? 'text-teal-700' : 'text-gray-500'
                              }`} />
                            </div>
                            <span className={`text-sm leading-relaxed ${
                              feature.highlighted ? 'text-gray-900 font-medium' : 'text-gray-600'
                            }`}>
                              {feature.text}
                            </span>
                          </motion.li>
                        )
                      })}
                    </ul>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubscriptionSelect(plan.id)}
                      disabled={isCurrentPlan || isLoadingSubscription}
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                        isCurrentPlan
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 cursor-not-allowed'
                          : isLoadingSubscription
                          ? 'bg-gray-200 text-gray-400 cursor-wait'
                          : plan.id === 'FREE'
                          ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                          : plan.id === 'PLUS'
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      {isLoadingSubscription
                        ? 'Laden...'
                        : isCurrentPlan
                        ? (
                          <>
                            <Check className="w-5 h-5" />
                            Actief
                          </>
                        )
                        : (
                          <>
                            {plan.id === 'FREE' ? 'Gratis beginnen' : 'Upgrade nu'}
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                    </motion.button>

                    {!session && plan.id !== 'FREE' && (
                      <p className="text-xs text-center text-gray-500 mt-3">
                        Geen account? Maak er gratis één aan
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Superberichten Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200/50 shadow-2xl mb-20"
        >
          <div className="text-center mb-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-pink-100 rounded-3xl mb-6"
            >
              <MessageCircle className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Superberichten
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Val meteen op! Stuur een bericht naar iemand die je leuk vindt, ook zonder match.
              Jouw bericht komt <span className="font-semibold text-gray-900">bovenaan te staan</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {CREDIT_PACKS.map((pack, index) => (
              <motion.button
                key={pack.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => handleCreditSelect(pack.id)}
                className="relative group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-3xl p-8 hover:border-primary hover:shadow-2xl transition-all"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />

                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:shadow-2xl transition-shadow">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {pack.credits} {pack.credits === 1 ? 'Superbericht' : 'Superberichten'}
                  </h3>

                  <p className="text-3xl font-black bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent mb-4">
                    {formatPrice(pack.price)}
                  </p>

                  <p className="text-sm text-gray-600 mb-6">
                    {pack.label}
                  </p>

                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-pink-600 text-white font-semibold rounded-xl group-hover:from-primary/90 group-hover:to-pink-600/90 transition-all shadow-lg">
                    Kopen
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Safety Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 flex items-start gap-4 max-w-2xl mx-auto"
          >
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 font-semibold mb-1">Jouw veiligheid voorop</p>
              <p className="text-blue-700 text-sm leading-relaxed">
                Om je te beschermen kun je maximaal €20 per dag uitgeven aan Superberichten.
                Geen gedoe, geen verrassingen.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Trust & Guarantees */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl font-black text-gray-900 mb-12">
            Waarom duizenden singles voor ons kiezen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Veilig betalen',
                description: 'SSL-versleutelde betalingen via iDEAL, creditcard en meer',
                color: 'from-green-400 to-emerald-500',
              },
              {
                icon: Award,
                title: 'Geen verborgen kosten',
                description: 'Wat je ziet is wat je betaalt. Crystal clear pricing.',
                color: 'from-blue-400 to-cyan-500',
              },
              {
                icon: Heart,
                title: 'Altijd opzegbaar',
                description: 'Stop wanneer je wilt. Geen lange contracten of gedoe.',
                color: 'from-primary to-pink-500',
              },
              {
                icon: Lock,
                title: 'Privacy gegarandeerd',
                description: 'Jouw gegevens zijn 100% veilig en blijven privé',
                color: 'from-purple-400 to-pink-500',
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 text-center leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200/50 shadow-2xl"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Veelgestelde vragen
            </h2>
            <p className="text-gray-600">
              Alles wat je moet weten over onze abonnementen
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: 'Hoe werkt een Superbericht?',
                a: 'Met een Superbericht kun je iemand direct een bericht sturen, ook als jullie nog geen match zijn. De ontvanger ziet jouw bericht bovenaan en krijgt een speciale melding. Perfect om op te vallen!',
              },
              {
                q: 'Kan ik mijn abonnement opzeggen?',
                a: 'Ja, altijd! Je kunt op elk moment opzeggen via je instellingen. Je houdt toegang tot je premium features tot het einde van de betaalperiode. Geen vervelende vragen, gewoon klikken en klaar.',
              },
              {
                q: 'Wat is het verschil tussen Liefde Plus en Liefde Compleet?',
                a: 'Liefde Compleet bevat alles van Liefde Plus, plus extra\'s: 3 gratis Superberichten per maand, een profiel boost, prioriteit in zoekresultaten, geavanceerde filters, Passport en Incognito modus. Bovendien betaal je per maand minder!',
              },
              {
                q: 'Zijn mijn betalingsgegevens veilig?',
                a: 'Absoluut! We gebruiken SSL-versleuteling en werken samen met betrouwbare betaalproviders. We slaan geen creditcardgegevens op. Jouw veiligheid staat voorop.',
              },
              {
                q: 'Wat gebeurt er na het einde van mijn abonnement?',
                a: 'Je account blijft bestaan en je kunt gewoon inloggen. Je keert terug naar het gratis Basis plan. Al je matches en gesprekken blijven behouden.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Klaar om je match te vinden?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Sluit je aan bij duizenden tevreden gebruikers en vind jouw perfecte match
          </p>
          {!session && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:from-primary/90 hover:to-pink-600/90 transition-all"
              >
                Gratis beginnen
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <span className="text-xl font-bold">Liefde Voor Iedereen</span>
            </div>
            <p className="text-gray-400 mb-6">
              Veilig, betrouwbaar en 100% Nederlands
            </p>
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Voorwaarden
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutData && (
          <CheckoutModal
            isOpen={!!checkoutData}
            onClose={() => setCheckoutData(null)}
            type={checkoutData.type}
            planId={checkoutData.planId}
            planName={checkoutData.planName}
            planPrice={checkoutData.planPrice}
            planPeriod={checkoutData.planPeriod}
            credits={checkoutData.credits}
          />
        )}
      </AnimatePresence>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
