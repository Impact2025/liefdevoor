'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    features: ['5 swipes per day', 'Basic matching', 'Standard support']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: ['Unlimited swipes', 'See who liked you', 'Advanced filters', 'Priority support']
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 19.99,
    features: ['All Premium features', 'Priority matching', 'Video chat', 'VIP support']
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
          alert('Subscription activated!')
          router.push('/')
        } else if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        }
      } else {
        alert('Failed to create subscription')
      }
    } catch (error) {
      alert('Error creating subscription')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Choose Your Plan</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md p-6 border">
              <h2 className="text-xl font-bold mb-4">{plan.name}</h2>
              <p className="text-2xl font-bold text-primary mb-4">
                €{plan.price}
                {plan.price > 0 && <span className="text-sm font-normal">/month</span>}
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
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                {loading === plan.id ? 'Processing...' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}