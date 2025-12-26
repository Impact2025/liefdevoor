'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Shield,
  Trash2,
  Ban,
  AlertOctagon,
  CheckCircle,
  X,
  MessageSquare,
  User,
  Clock,
  TrendingDown,
  RefreshCw,
  Eye
} from 'lucide-react'

interface FlaggedConversation {
  matchId: string
  user1: {
    id: string
    name: string | null
    email: string | null
    safetyScore: number
  }
  user2: {
    id: string
    name: string | null
    email: string | null
    safetyScore: number
  }
  messageCount: number
  lastMessageAt: Date
  recentMessages: Array<{
    id: string
    content: string | null
    audioUrl: string | null
    gifUrl: string | null
    senderId: string
    createdAt: Date
  }>
  flags: Array<{
    type: 'report' | 'low_safety_score' | 'suspicious_activity'
    severity: 'low' | 'medium' | 'high' | 'critical'
    reason: string
    createdAt: Date
  }>
  riskScore: number
}

/**
 * Conversation Moderation Queue Component
 *
 * World-class moderation interface for flagged conversations
 */
export default function ConversationModerationQueue() {
  const [conversations, setConversations] = useState<FlaggedConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedConv, setSelectedConv] = useState<FlaggedConversation | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  useEffect(() => {
    fetchQueue()
  }, [filter])

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/moderation/conversations?filter=${filter}&limit=50`)
      if (!response.ok) throw new Error('Failed to fetch queue')

      const data = await response.json()
      setConversations(data.conversations.map((c: any) => ({
        ...c,
        lastMessageAt: new Date(c.lastMessageAt),
        recentMessages: c.recentMessages.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })),
        flags: c.flags.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt)
        }))
      })))
    } catch (error) {
      console.error('Failed to fetch queue:', error)
      toast.error('Failed to load moderation queue')
    } finally {
      setLoading(false)
    }
  }

  const takeAction = async (
    action: string,
    params: {
      matchId: string
      messageIds?: string[]
      userId?: string
      reason?: string
    }
  ) => {
    setActionInProgress(true)
    try {
      const response = await fetch('/api/admin/moderation/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      })

      if (!response.ok) throw new Error('Action failed')

      const data = await response.json()
      toast.success(data.message)

      // Refresh queue
      fetchQueue()
      setSelectedConv(null)
    } catch (error) {
      console.error('Action failed:', error)
      toast.error('Failed to perform action')
    } finally {
      setActionInProgress(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50'
    if (score >= 50) return 'text-orange-600 bg-orange-50'
    if (score >= 25) return 'text-yellow-600 bg-yellow-50'
    return 'text-blue-600 bg-blue-50'
  }

  const getSafetyColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    if (score >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
            <p className="text-sm text-gray-600">
              {conversations.length} flagged conversations requiring review
            </p>
          </div>
        </div>
        <button
          onClick={fetchQueue}
          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          {['all', 'reports_only', 'low_safety', 'high_risk'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading moderation queue...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No conversations need moderation right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => (
            <div
              key={conv.matchId}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-all cursor-pointer"
              onClick={() => setSelectedConv(conv)}
            >
              <div className="flex items-start justify-between mb-3">
                {/* Users */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="font-medium text-gray-900">
                        {conv.user1.name || 'Unknown'}
                      </span>
                      <span className={`ml-2 text-sm font-medium ${getSafetyColor(conv.user1.safetyScore)}`}>
                        {conv.user1.safetyScore}
                      </span>
                    </div>
                    <span className="text-gray-400">↔</span>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="font-medium text-gray-900">
                        {conv.user2.name || 'Unknown'}
                      </span>
                      <span className={`ml-2 text-sm font-medium ${getSafetyColor(conv.user2.safetyScore)}`}>
                        {conv.user2.safetyScore}
                      </span>
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap gap-2">
                    {conv.flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(flag.severity)}`}
                      >
                        {flag.type === 'report' && '🚨'}
                        {flag.type === 'low_safety_score' && '⚠️'}
                        {flag.type === 'suspicious_activity' && '🔍'}
                        {' '}{flag.reason}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Risk Score */}
                <div className={`ml-4 px-4 py-2 rounded-lg ${getRiskColor(conv.riskScore)}`}>
                  <div className="text-2xl font-bold">{conv.riskScore}</div>
                  <div className="text-xs font-medium opacity-75">RISK</div>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {conv.messageCount} messages
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Last: {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedConv(conv)
                  }}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedConv && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Moderation Review</h2>
                <p className="text-sm text-gray-600">
                  Risk Score: <span className="font-bold text-red-600">{selectedConv.riskScore}/100</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedConv(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Users Info */}
              <div className="grid grid-cols-2 gap-4">
                <UserCard user={selectedConv.user1} label="User 1" />
                <UserCard user={selectedConv.user2} label="User 2" />
              </div>

              {/* Flags */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Flags & Warnings</h3>
                <div className="space-y-2">
                  {selectedConv.flags.map((flag, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(flag.severity)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{flag.reason}</span>
                        <span className="text-xs opacity-75">{formatTime(flag.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Recent Messages</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedConv.recentMessages.map(msg => {
                    const isUser1 = msg.senderId === selectedConv.user1.id
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${isUser1 ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            {isUser1 ? selectedConv.user1.name : selectedConv.user2.name}
                          </span>
                          <span className="text-xs text-gray-500">{formatTime(msg.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-900">
                          {msg.content || (msg.audioUrl ? '🎤 Voice message' : msg.gifUrl ? '🖼️ GIF' : '[No content]')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    const messageIds = selectedConv.recentMessages.map(m => m.id)
                    if (confirm(`Delete ${messageIds.length} messages?`)) {
                      takeAction('delete_messages', {
                        matchId: selectedConv.matchId,
                        messageIds,
                        reason: 'Inappropriate content flagged by moderation'
                      })
                    }
                  }}
                  disabled={actionInProgress}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Messages
                </button>

                <button
                  onClick={() => {
                    const userId = prompt('Enter user ID to warn:')
                    if (userId) {
                      takeAction('warn_user', {
                        matchId: selectedConv.matchId,
                        userId,
                        reason: 'Flagged content in conversation'
                      })
                    }
                  }}
                  disabled={actionInProgress}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warn User
                </button>

                <button
                  onClick={() => {
                    const userId = prompt('Enter user ID to ban:')
                    if (userId && confirm('Ban this user permanently?')) {
                      takeAction('ban_user', {
                        matchId: selectedConv.matchId,
                        userId,
                        reason: 'Severe policy violation'
                      })
                    }
                  }}
                  disabled={actionInProgress}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Ban User
                </button>

                <button
                  onClick={() => {
                    if (confirm('Dismiss all reports for this conversation?')) {
                      takeAction('dismiss', {
                        matchId: selectedConv.matchId,
                        reason: 'False positive or resolved'
                      })
                    }
                  }}
                  disabled={actionInProgress}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * User Card Component
 */
function UserCard({
  user,
  label
}: {
  user: {
    id: string
    name: string | null
    email: string | null
    safetyScore: number
  }
  label: string
}) {
  const getSafetyColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    if (score >= 25) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className="font-bold text-gray-900 mb-1">{user.name || 'Unknown'}</div>
      <div className="text-sm text-gray-600 mb-3">{user.email}</div>
      <div className={`inline-flex items-center px-3 py-1 rounded-full font-bold ${getSafetyColor(user.safetyScore)}`}>
        <Shield className="w-4 h-4 mr-1" />
        Safety: {user.safetyScore}/100
      </div>
    </div>
  )
}
