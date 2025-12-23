'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'FREE',
    name: 'Basis',
    price: 0,
    period: 'maand',
    features: ['Profiel aanmaken', '10 likes per dag', '1 chat per dag starten', 'Basis zoekfilters']
  },
  {
    id: 'PLUS',
    name: 'Liefde Plus',
    price: 9.95,
    period: 'maand',
    features: ['Onbeperkt chatten', 'Onbeperkt likes', 'Zien wie jou leuk vindt', 'Audioberichten sturen', 'Leesbevestigingen', 'Geen advertenties']
  },
  {
    id: 'COMPLETE',
    name: 'Liefde Compleet',
    price: 24.95,
    period: '3 maanden',
    features: ['Alles van Liefde Plus', '3 Superberichten per maand', 'Prioriteit in ontdekken', 'Video chat', 'Geverifieerd badge']
  }
]

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    setLoading(planId)
    try {
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('Abonnement geactiveerd!')
          router.push('/subscription/success')
        } else if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        }
      } else {
        const data = await res.json()
        alert(data.error || 'Kon abonnement niet aanmaken')
      }
    } catch (error) {
      alert('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Kies je abonnement</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md p-6 border">
              <h2 className="text-xl font-bold mb-4">{plan.name}</h2>
              <p className="text-2xl font-bold text-primary mb-4">
                €{plan.price.toFixed(2)}
                {plan.price > 0 && <span className="text-sm font-normal">/{plan.period}</span>}
              </p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-rose-hover disabled:opacity-50 transition-colors"
              >
                {loading === plan.id ? 'Verwerken...' : plan.price === 0 ? 'Gratis starten' : 'Kies dit plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}