'use client'

import { useState } from 'react'
import { Search, Zap, Link as LinkIcon, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function BlogAssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full mb-4">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">AI-Powered</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blog Assistant AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Wereldklasse SEO tools om je blog posts te optimaliseren voor Google
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Keywords</p>
                <p className="text-2xl font-bold text-gray-900">500+</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Beschikbaar in database</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">SEO Score</p>
                <p className="text-2xl font-bold text-gray-900">0-100</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Real-time analyse</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-rose-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Links</p>
                <p className="text-2xl font-bold text-gray-900">Auto</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Interne link suggesties</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Impact</p>
                <p className="text-2xl font-bold text-gray-900">+300%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Traffic groei verwacht</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Keyword Research */}
          <Link href="/admin/blog/assistant/keywords">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-purple-500">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Keyword Research
              </h3>
              <p className="text-gray-600 mb-6">
                Vind de beste keywords voor je topic. AI-powered suggesties voor primary, secondary en long-tail keywords.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  Search Volume
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  Competition
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  Content Ideas
                </span>
              </div>
              <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                Start Research
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* SEO Analyzer */}
          <Link href="/admin/blog/assistant/analyzer">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-pink-500">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                SEO Analyzer
              </h3>
              <p className="text-gray-600 mb-6">
                Analyseer je blog post en krijg een score van 0-100. Met concrete fixes om je score te verbeteren.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                  Score A-F
                </span>
                <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                  Readability
                </span>
                <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                  Fixes
                </span>
              </div>
              <div className="flex items-center gap-2 text-pink-600 font-semibold group-hover:gap-3 transition-all">
                Analyze Post
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Internal Links */}
          <Link href="/admin/blog/assistant/links">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-rose-500">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Internal Links
              </h3>
              <p className="text-gray-600 mb-6">
                Automatisch de beste interne links vinden voor je blog post. Met anchor text suggesties.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                  Relevance Score
                </span>
                <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                  Anchor Text
                </span>
                <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                  Distribution
                </span>
              </div>
              <div className="flex items-center gap-2 text-rose-600 font-semibold group-hover:gap-3 transition-all">
                Find Links
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Guide */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Snelle Start Gids
              </h3>
              <p className="text-gray-600 mb-4">
                Gebruik deze tools voor elke nieuwe blog post om wereldklasse SEO te bereiken
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Keyword Research</h4>
              <p className="text-sm text-gray-600">
                Vind de beste keywords voor je topic (2 min)
              </p>
            </div>

            <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-100">
              <div className="w-8 h-8 bg-pink-600 text-white rounded-lg flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Schrijf Blog</h4>
              <p className="text-sm text-gray-600">
                Gebruik keywords en schrijf 1500+ woorden (60-90 min)
              </p>
            </div>

            <div className="bg-rose-50 rounded-xl p-6 border-2 border-rose-100">
              <div className="w-8 h-8 bg-rose-600 text-white rounded-lg flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">SEO Analyze</h4>
              <p className="text-sm text-gray-600">
                Check score (min 70/B) en fix issues (5 min)
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-100">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold mb-3">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Add Links</h4>
              <p className="text-sm text-gray-600">
                Voeg 3-5 interne links toe en publish! (2 min)
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-sm text-green-800">
              <strong>Pro Tip:</strong> Gebruik alle 3 de tools voor elke post →
              gemiddelde SEO score gaat van 60 naar 90+ in 3 maanden! 🚀
            </p>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Volledige documentatie beschikbaar in je project
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/docs/BLOG-ASSISTANT-AI.md"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              📚 Lees Documentatie
            </a>
            <Link
              href="/admin/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Terug naar Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
