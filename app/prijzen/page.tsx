'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart, Check, Shield, Star, MessageCircle, Sparkles } from 'lucide-react'
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
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)

  const handleSubscriptionSelect = (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) return

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

    setCheckoutData({
      type: 'credits',
      credits: pack.credits,
      planPrice: pack.price,
      planName: `${pack.credits} Superbericht${pack.credits === 1 ? '' : 'en'}`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:ml-64 lg:pt-16">
      {/* Header - Hidden on desktop */}
      <header className="lg:hidden bg-white border-b border-gray-200">
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

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Kies het abonnement dat bij jou past
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meer kans op een match? Bekijk onze abonnementen.
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 ${
                plan.highlighted
                  ? 'border-2 border-primary shadow-lg'
                  : 'border border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-sm font-medium px-4 py-1 rounded-full">
                    Meest gekozen
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Gratis' : formatPrice(plan.price)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{plan.periodLabel}</p>

                {plan.savings && (
                  <p className="mt-2 text-sm font-medium text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full">
                    {plan.savings}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscriptionSelect(plan.id)}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
                  plan.id === 'FREE'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : plan.highlighted
                    ? 'bg-primary text-white hover:bg-rose-hover'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.id === 'FREE' ? 'Gratis starten' : 'Kies dit abonnement'}
              </button>
            </div>
          ))}
        </div>

        {/* Superberichten Section */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Superberichten
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Stuur een bericht naar iemand die je leuk vindt, ook zonder match.
              Jouw bericht komt bovenaan te staan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handleCreditSelect(pack.id)}
                className="flex flex-col items-center p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {pack.credits} {pack.credits === 1 ? 'Bericht' : 'Berichten'}
                </h3>

                <p className="text-xl font-semibold text-primary mb-3">
                  {formatPrice(pack.price)}
                </p>

                <span className="text-sm text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
                  {pack.label}
                </span>

                <div className="mt-5 w-full py-3 bg-primary text-white font-semibold rounded-xl group-hover:bg-rose-hover transition-colors">
                  Kopen
                </div>
              </button>
            ))}
          </div>

          {/* Safety Notice */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start space-x-3 max-w-2xl mx-auto">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium">Jouw veiligheid voorop</p>
              <p className="text-blue-700 text-sm">
                Om je te beschermen kun je maximaal 20 euro per dag uitgeven aan Superberichten.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Waarom kiezen voor ons?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Veilig betalen</h3>
              <p className="text-gray-600 text-sm">
                Betaal veilig met iDEAL of creditcard via onze beveiligde betaalpagina
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Geen verborgen kosten</h3>
              <p className="text-gray-600 text-sm">
                De prijs die je ziet is de prijs die je betaalt. Geen verrassingen.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Maandelijks opzegbaar</h3>
              <p className="text-gray-600 text-sm">
                Je kunt je abonnement op elk moment stopzetten. Geen gedoe.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Veelgestelde vragen
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Hoe werkt een Superbericht?
              </h3>
              <p className="text-gray-600">
                Met een Superbericht kun je iemand direct een bericht sturen, ook als jullie nog geen match zijn.
                De ontvanger ziet jouw bericht bovenaan en krijgt een melding.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Kan ik mijn abonnement opzeggen?
              </h3>
              <p className="text-gray-600">
                Ja, je kunt op elk moment opzeggen in je instellingen.
                Je houdt toegang tot je abonnement tot het einde van de betaalperiode.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Wat is het verschil tussen Liefde Plus en Liefde Compleet?
              </h3>
              <p className="text-gray-600">
                Met Liefde Compleet krijg je alles van Liefde Plus, plus 3 gratis Superberichten per maand,
                een profiel boost, en prioriteit in zoekresultaten. Je betaalt ook minder per maand.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="font-semibold">Liefde Voor Iedereen</span>
          </div>
          <p className="text-gray-400 text-sm">
            Veilig, betrouwbaar en Nederlands
          </p>
        </div>
      </footer>

      {/* Checkout Modal */}
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
    </div>
  )
}
