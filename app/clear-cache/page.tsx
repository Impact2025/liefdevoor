'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearCachePage() {
  const router = useRouter()
  const [status, setStatus] = useState<string[]>([])

  useEffect(() => {
    async function clearAll() {
      const messages: string[] = []

      // Clear Service Workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            await registration.unregister()
            messages.push(`✅ Service Worker unregistered: ${registration.scope}`)
          }
          if (registrations.length === 0) {
            messages.push('ℹ️ No service workers found')
          }
        } catch (error) {
          messages.push(`❌ Error clearing service workers: ${error}`)
        }
      }

      // Clear Caches
      if ('caches' in window) {
        try {
          const names = await caches.keys()
          for (const name of names) {
            await caches.delete(name)
            messages.push(`✅ Cache deleted: ${name}`)
          }
          if (names.length === 0) {
            messages.push('ℹ️ No caches found')
          }
        } catch (error) {
          messages.push(`❌ Error clearing caches: ${error}`)
        }
      }

      // Clear localStorage (optional - only Turnstile related)
      try {
        const keys = Object.keys(localStorage)
        const turnstileKeys = keys.filter(k => k.toLowerCase().includes('turnstile') || k.toLowerCase().includes('cloudflare'))
        turnstileKeys.forEach(key => {
          localStorage.removeItem(key)
          messages.push(`✅ LocalStorage cleared: ${key}`)
        })
        if (turnstileKeys.length === 0) {
          messages.push('ℹ️ No Turnstile data in localStorage')
        }
      } catch (error) {
        messages.push(`❌ Error clearing localStorage: ${error}`)
      }

      messages.push('')
      messages.push('🎉 All done! Redirecting to homepage...')
      setStatus(messages)

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    }

    clearAll()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧹 Cache & Service Worker Clearen
        </h1>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96 space-y-1">
          {status.length === 0 ? (
            <div className="animate-pulse">Bezig met clearen...</div>
          ) : (
            status.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Wat doet deze pagina?</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Unregistered alle Service Workers</li>
            <li>Verwijdert alle browser caches</li>
            <li>Cleant Turnstile localStorage data</li>
            <li>Forceert een fresh start van de app</li>
          </ul>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Je wordt automatisch doorgestuurd naar de homepage.
            Doe daarna een hard refresh (Ctrl+Shift+R of Cmd+Shift+R) voor beste resultaten.
          </p>
        </div>
      </div>
    </div>
  )
}
