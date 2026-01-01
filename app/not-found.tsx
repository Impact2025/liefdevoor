import Link from 'next/link'
import { Home, Search, Heart } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="text-center px-4">
        <div className="mb-8">
          <Heart className="w-24 h-24 mx-auto text-pink-400 animate-pulse" />
        </div>

        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Pagina niet gevonden
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Oeps! Deze pagina bestaat niet (meer). Misschien is je perfecte match
          ergens anders te vinden?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Naar Home
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-pink-500 border-2 border-pink-500 rounded-full hover:bg-pink-50 transition-colors font-medium"
          >
            <Search className="w-5 h-5" />
            Ontdek matches
          </Link>
        </div>
      </div>
    </div>
  )
}
