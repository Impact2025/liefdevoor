/**
 * GIF Picker Component
 *
 * Search and select GIFs using Tenor API (free, no key required for basic use)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface GifPickerProps {
  onSelect: (gifUrl: string) => void
  onClose: () => void
}

interface TenorGif {
  id: string
  media_formats: {
    gif: { url: string }
    tinygif: { url: string }
    nanogif: { url: string }
  }
  content_description: string
}

// Tenor API key (free tier - get your own at developers.google.com/tenor)
const TENOR_API_KEY = 'AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ' // Public demo key

export function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [search, setSearch] = useState('')
  const [gifs, setGifs] = useState<TenorGif[]>([])
  const [loading, setLoading] = useState(false)
  const [categories] = useState([
    { name: 'Trending', query: '' },
    { name: 'Liefde', query: 'love' },
    { name: 'Lachen', query: 'laugh' },
    { name: 'Knuffel', query: 'hug' },
    { name: 'Hi', query: 'hello wave' },
    { name: 'Blij', query: 'happy' },
  ])
  const [activeCategory, setActiveCategory] = useState('Trending')

  const fetchGifs = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const endpoint = query
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20&media_filter=gif,tinygif&locale=nl_NL`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=20&media_filter=gif,tinygif&locale=nl_NL`

      const res = await fetch(endpoint)
      const data = await res.json()
      setGifs(data.results || [])
    } catch (error) {
      console.error('Error fetching GIFs:', error)
      setGifs([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load - trending GIFs
  useEffect(() => {
    fetchGifs('')
  }, [fetchGifs])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        fetchGifs(search)
        setActiveCategory('')
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, fetchGifs])

  const handleCategoryClick = (category: { name: string; query: string }) => {
    setActiveCategory(category.name)
    setSearch('')
    fetchGifs(category.query)
  }

  const handleSelectGif = (gif: TenorGif) => {
    // Use tinygif for chat (smaller file size)
    const gifUrl = gif.media_formats.tinygif?.url || gif.media_formats.gif?.url
    onSelect(gifUrl)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-t-3xl shadow-xl overflow-hidden"
      style={{ maxHeight: '60vh' }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">GIF kiezen</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek GIFs..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === category.name
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name === 'Trending' && <TrendingUp size={14} />}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* GIF Grid */}
      <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 140px)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        ) : gifs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Geen GIFs gevonden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <motion.button
                key={gif.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectGif(gif)}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <img
                  src={gif.media_formats.nanogif?.url || gif.media_formats.tinygif?.url}
                  alt={gif.content_description}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Powered by Tenor */}
      <div className="p-2 text-center border-t bg-gray-50">
        <span className="text-xs text-gray-400">Powered by Tenor</span>
      </div>
    </motion.div>
  )
}

export default GifPicker
