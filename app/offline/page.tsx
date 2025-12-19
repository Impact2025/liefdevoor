'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <WifiOff className="w-12 h-12 text-gray-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Je bent offline
        </h1>

        <p className="text-gray-600 mb-8">
          Geen internetverbinding gevonden. Controleer je verbinding en probeer het opnieuw.
        </p>

        <motion.button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-5 h-5" />
          Opnieuw proberen
        </motion.button>

        <p className="mt-8 text-sm text-gray-500">
          Sommige functies zijn offline beschikbaar dankzij caching.
        </p>
      </motion.div>
    </div>
  )
}
