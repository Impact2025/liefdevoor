'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Wrench,
  Eye,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  TrendingUp,
  Users,
  Loader2,
  Shield,
  Heart,
  MessageSquare,
  Calculator,
  FileCheck,
  Sparkles
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  nameNl: string
  slug: string
  description: string | null
  toolType: string
  isActive: boolean
  requiresAuth: boolean
  usageCount: number
  externalUrl: string | null
  createdAt: string
}

const toolIcons: Record<string, typeof Wrench> = {
  'scam-checker': Shield,
  'liefdetaal-quiz': Heart,
  'compatibility-quiz': Calculator,
  'dating-readiness': FileCheck,
  'icebreaker-generator': MessageSquare,
  'red-flag-checklist': Shield,
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsage: 0,
    activeTools: 0,
    mostUsed: null as Tool | null
  })

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/admin/kennisbank/tools')
      if (response.ok) {
        const data = await response.json()
        const toolsList = data.data?.tools || []
        setTools(toolsList)

        // Calculate stats
        const totalUsage = toolsList.reduce((sum: number, t: Tool) => sum + t.usageCount, 0)
        const activeTools = toolsList.filter((t: Tool) => t.isActive).length
        const mostUsed = toolsList.length > 0
          ? toolsList.reduce((max: Tool, t: Tool) => t.usageCount > max.usageCount ? t : max, toolsList[0])
          : null

        setStats({ totalUsage, activeTools, mostUsed })
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleToolStatus = async (toolId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/kennisbank/tools/${toolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setTools(prev =>
          prev.map(t => t.id === toolId ? { ...t, isActive: !isActive } : t)
        )
      }
    } catch (error) {
      console.error('Error toggling tool:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    )
  }

  // Fallback tools if none in database
  const displayTools = tools.length > 0 ? tools : [
    {
      id: '1',
      name: 'Scam Checker',
      nameNl: 'Scam Checker',
      slug: 'scam-checker',
      description: 'Analyseer berichten op rode vlaggen',
      toolType: 'CHECKER',
      isActive: true,
      requiresAuth: false,
      usageCount: 1520,
      externalUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Love Language Quiz',
      nameNl: 'Liefdetaal Quiz',
      slug: 'liefdetaal-quiz',
      description: 'Ontdek je liefdetaal',
      toolType: 'QUIZ',
      isActive: true,
      requiresAuth: false,
      usageCount: 892,
      externalUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Compatibility Quiz',
      nameNl: 'Compatibiliteit Check',
      slug: 'compatibility-quiz',
      description: 'Ontdek je relatieprofiel',
      toolType: 'QUIZ',
      isActive: true,
      requiresAuth: false,
      usageCount: 654,
      externalUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Dating Readiness Quiz',
      nameNl: 'Ben Je Klaar om te Daten?',
      slug: 'dating-readiness',
      description: 'Check of je klaar bent om te daten',
      toolType: 'QUIZ',
      isActive: true,
      requiresAuth: false,
      usageCount: 421,
      externalUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Red Flag Checklist',
      nameNl: 'Rode Vlaggen Checklist',
      slug: 'red-flag-checklist',
      description: 'Herken waarschuwingssignalen',
      toolType: 'CHECKLIST',
      isActive: true,
      requiresAuth: false,
      usageCount: 756,
      externalUrl: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Icebreaker Generator',
      nameNl: 'Openingszin Generator',
      slug: 'icebreaker-generator',
      description: 'Genereer creatieve openingszinnen',
      toolType: 'GENERATOR',
      isActive: true,
      requiresAuth: false,
      usageCount: 1123,
      externalUrl: null,
      createdAt: new Date().toISOString(),
    },
  ]

  const calculatedStats = {
    totalUsage: displayTools.reduce((sum, t) => sum + t.usageCount, 0),
    activeTools: displayTools.filter(t => t.isActive).length,
    mostUsed: displayTools.length > 0
      ? displayTools.reduce((max, t) => t.usageCount > max.usageCount ? t : max, displayTools[0])
      : null
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/kennisbank"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tools Beheer</h1>
          <p className="text-gray-500 mt-1">
            Beheer interactieve kennisbank tools
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Actieve Tools</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculatedStats.activeTools} / {displayTools.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Totaal Gebruik</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculatedStats.totalUsage.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Meest Gebruikt</p>
              <p className="text-xl font-bold text-gray-900 truncate">
                {calculatedStats.mostUsed?.nameNl || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Alle Tools</h2>
          <span className="text-sm text-gray-500">{displayTools.length} tools</span>
        </div>

        <div className="divide-y">
          {displayTools.map((tool) => {
            const Icon = toolIcons[tool.slug] || Wrench

            return (
              <div key={tool.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      tool.isActive ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        tool.isActive ? 'text-emerald-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{tool.nameNl}</h3>
                        {tool.isActive ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Actief
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Inactief
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tool.toolType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {tool.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {tool.usageCount.toLocaleString()} keer gebruikt
                        </span>
                        <span>/kennisbank/tools/{tool.slug}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/kennisbank/tools/${tool.slug}`}
                      target="_blank"
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                      title="Bekijk tool"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleToolStatus(tool.id, tool.isActive)}
                      className={`p-2 rounded-lg ${
                        tool.isActive
                          ? 'hover:bg-red-50 text-red-500'
                          : 'hover:bg-emerald-50 text-emerald-500'
                      }`}
                      title={tool.isActive ? 'Deactiveren' : 'Activeren'}
                    >
                      {tool.isActive ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Tool Configuratie</h3>
            <p className="text-sm text-blue-700 mt-1">
              Tools worden geconfigureerd via de code. De meeste tools hebben geen database
              configuratie nodig. Gebruik deze pagina om tools te activeren/deactiveren
              en gebruiksstatistieken te bekijken.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
