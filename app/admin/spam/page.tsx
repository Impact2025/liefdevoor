'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Mail,
  User,
  Clock,
  Globe,
  AlertTriangle,
  Ban,
  CheckCircle,
  RefreshCw,
  Search,
  Eye,
} from 'lucide-react'

interface SpamStats {
  totalUsers: number
  registrations: {
    last24h: number
    last7d: number
    last30d: number
  }
  blocked: {
    last24h: number
    last7d: number
  }
  blockRate24h: string
  spamEventCounts: {
    honeypot: number
    disposableEmail: number
    botTiming: number
    ipBlocked: number
    turnstileFailed: number
    suspiciousName: number
  }
}

interface IPReputation {
  ip: string
  score: number
  failedRegistrations: number
  successfulRegistrations: number
  spamAccountsCreated: number
  rateLimitHits: number
  lastActivity: string
  firstSeen: string
  flags: string[]
  isBlocked: boolean
}

interface AuditLog {
  id: string
  action: string
  details: string | null
  ip: string | null
  createdAt: string
}

export default function SpamDashboard() {
  const [stats, setStats] = useState<SpamStats | null>(null)
  const [blockedIPs, setBlockedIPs] = useState<IPReputation[]>([])
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchIP, setSearchIP] = useState('')
  const [blockingIP, setBlockingIP] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/spam')
      const data = await res.json()

      if (data.success) {
        setStats(data.stats)
        setBlockedIPs(data.blockedIPs || [])
        setRecentLogs(data.recentLogs || [])
      } else {
        toast.error('Kon spam data niet laden')
      }
    } catch (error) {
      toast.error('Fout bij laden spam data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBlockIP = async (ip: string, block: boolean) => {
    setBlockingIP(ip)
    try {
      const res = await fetch('/api/admin/spam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: block ? 'block' : 'unblock',
          ip,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message)
        fetchData()
      } else {
        toast.error(data.error || 'Actie mislukt')
      }
    } catch (error) {
      toast.error('Fout bij blokkeren IP')
    } finally {
      setBlockingIP(null)
    }
  }

  const filteredLogs = searchIP
    ? recentLogs.filter(log => log.ip?.includes(searchIP))
    : recentLogs

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SpamGuard Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time spam preventie monitoring
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Vernieuwen
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Totaal Gebruikers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <User className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-green-500 font-medium">+{stats.registrations.last24h}</span> laatste 24 uur
              </div>
            </div>

            {/* Block Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Block Rate (24h)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.blockRate24h}%
                  </p>
                </div>
                <ShieldCheck className="w-10 h-10 text-green-500 opacity-50" />
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-red-500 font-medium">{stats.blocked.last24h}</span> geblokkeerd
              </div>
            </div>

            {/* Blocked Last 7d */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Geblokkeerd (7d)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.blocked.last7d}
                  </p>
                </div>
                <ShieldX className="w-10 h-10 text-red-500 opacity-50" />
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Spam pogingen gestopt
              </div>
            </div>

            {/* Active IPs Blocked */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Geblokkeerde IPs</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {blockedIPs.length}
                  </p>
                </div>
                <Ban className="w-10 h-10 text-orange-500 opacity-50" />
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Actieve IP blocks
              </div>
            </div>
          </div>
        )}

        {/* Spam Event Breakdown */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Spam Detectie Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatBox
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Honeypot"
                value={stats.spamEventCounts.honeypot}
                color="red"
              />
              <StatBox
                icon={<Mail className="w-5 h-5" />}
                label="Wegwerp Email"
                value={stats.spamEventCounts.disposableEmail}
                color="orange"
              />
              <StatBox
                icon={<Clock className="w-5 h-5" />}
                label="Bot Timing"
                value={stats.spamEventCounts.botTiming}
                color="yellow"
              />
              <StatBox
                icon={<Globe className="w-5 h-5" />}
                label="IP Blocked"
                value={stats.spamEventCounts.ipBlocked}
                color="purple"
              />
              <StatBox
                icon={<ShieldAlert className="w-5 h-5" />}
                label="Turnstile Failed"
                value={stats.spamEventCounts.turnstileFailed}
                color="blue"
              />
              <StatBox
                icon={<User className="w-5 h-5" />}
                label="Verdachte Naam"
                value={stats.spamEventCounts.suspiciousName}
                color="pink"
              />
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blocked IPs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Geblokkeerde IPs ({blockedIPs.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {blockedIPs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Geen geblokkeerde IPs
                </p>
              ) : (
                blockedIPs.map((ip) => (
                  <div
                    key={ip.ip}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">
                        {ip.ip}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-red-500 font-medium">
                          Score: {ip.score}
                        </span>
                        <span className="text-xs text-gray-500">
                          Spam: {ip.spamAccountsCreated}
                        </span>
                        {ip.flags.slice(0, 2).map(flag => (
                          <span
                            key={flag}
                            className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBlockIP(ip.ip, false)}
                      disabled={blockingIP === ip.ip}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                      title="Deblokkeren"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recente Spam Events
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek IP..."
                  value={searchIP}
                  onChange={(e) => setSearchIP(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Geen spam events gevonden
                </p>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatAction(log.action)}
                        </p>
                        {log.ip && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                            IP: {log.ip}
                          </p>
                        )}
                        {log.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {log.details}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  const colorClasses: Record<string, string> = {
    red: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    pink: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
  }

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    SPAM_BLOCKED: 'Spam Geblokkeerd',
    SPAM_DETECTED: 'Spam Gedetecteerd',
    SPAM_EMAIL_BLOCKED: 'Wegwerp Email',
    REGISTER_SPAM_BLOCKED: 'Registratie Geblokkeerd',
    REGISTER_HONEYPOT_TRIGGERED: 'Honeypot Triggered',
    REGISTER_BOT_TIMING: 'Bot Gedetecteerd (Timing)',
    REGISTER_IP_BLOCKED: 'IP Geblokkeerd',
    REGISTER_HIGH_RISK: 'High Risk Registratie',
    EMAIL_CHECK_HIGH_VOLUME: 'High Volume Email Checks',
    PROFESSIONAL_SPAM_BLOCKED: 'Professional Spam',
    PROFESSIONAL_TURNSTILE_FAILED: 'Turnstile Failed',
  }

  return actionMap[action] || action.replace(/_/g, ' ')
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m geleden`
  if (hours < 24) return `${hours}u geleden`
  if (days < 7) return `${days}d geleden`

  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  })
}
