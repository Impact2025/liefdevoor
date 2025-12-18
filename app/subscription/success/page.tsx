'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PageLoading } from '@/components/ui'

function SubscriptionSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [message, setMessage] = useState('Betaling wordt geverifieerd...')

  useEffect(() => {
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      setStatus('error')
      setMessage('Geen order ID gevonden')
      return
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/subscription/verify?order_id=${orderId}`)
        const data = await res.json()

        if (data.success && data.subscription?.status === 'active') {
          setStatus('success')
          setMessage('Je premium abonnement is geactiveerd!')
          setTimeout(() => {
            router.push('/discover')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Betaling kon niet worden geverifieerd')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Er is een fout opgetreden bij het verifieren van je betaling')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  if (status === 'checking') {
    return <PageLoading message="Betaling wordt geverifieerd..." />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gefeliciteerd!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/discover')}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Start met Matchen
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Er ging iets mis</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/subscription')}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
              >
                Probeer opnieuw
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<PageLoading message="Laden..." />}>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}
