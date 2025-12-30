'use client'

import { X, Ban, UserCheck, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkAction: (action: 'ban' | 'unban' | 'approve' | 'reject', reason?: string) => Promise<void>
  actions: Array<'ban' | 'unban' | 'approve' | 'reject'>
}

/**
 * Bulk Action Bar Component
 *
 * Sticky action bar for bulk operations with progress indicator
 */
export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
  actions
}: BulkActionBarProps) {
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [reason, setReason] = useState('')
  const [currentAction, setCurrentAction] = useState<'ban' | 'unban' | 'approve' | 'reject' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)

  // Simulate progress animation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isProcessing && showProgress) {
      setProgress(0)
      interval = setInterval(() => {
        setProgress(prev => {
          // Quick start, slow finish pattern
          if (prev < 30) return prev + 8
          if (prev < 60) return prev + 4
          if (prev < 85) return prev + 2
          if (prev < 95) return prev + 0.5
          return prev
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isProcessing, showProgress])

  if (selectedCount === 0 && !showProgress) return null

  const handleActionClick = (action: 'ban' | 'unban' | 'approve' | 'reject') => {
    if (action === 'ban' || action === 'reject') {
      setCurrentAction(action)
      setShowReasonInput(true)
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: 'ban' | 'unban' | 'approve' | 'reject', actionReason?: string) => {
    setIsProcessing(true)
    setShowProgress(true)
    setProgress(0)

    const actionLabels = {
      ban: { loading: 'Gebruikers blokkeren', success: 'geblokkeerd', error: 'blokkeren' },
      unban: { loading: 'Gebruikers deblokkeren', success: 'gedeblokkeerd', error: 'deblokkeren' },
      approve: { loading: 'Gebruikers goedkeuren', success: 'goedgekeurd', error: 'goedkeuren' },
      reject: { loading: 'Gebruikers afwijzen', success: 'afgewezen', error: 'afwijzen' }
    }

    const labels = actionLabels[action]

    try {
      await onBulkAction(action, actionReason || reason)
      setProgress(100)

      // Show success state briefly
      await new Promise(resolve => setTimeout(resolve, 500))

      toast.success(`${selectedCount} gebruikers succesvol ${labels.success}!`, {
        description: `Actie voltooid om ${new Date().toLocaleTimeString('nl-NL')}`
      })

      setShowReasonInput(false)
      setReason('')
      setCurrentAction(null)
    } catch (error) {
      toast.error(`${labels.error} mislukt`, {
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden'
      })
    } finally {
      // Keep progress visible briefly after completion
      setTimeout(() => {
        setIsProcessing(false)
        setShowProgress(false)
        setProgress(0)
      }, 1000)
    }
  }

  const handleSubmitReason = () => {
    if (!currentAction) return

    if (reason.length < 10) {
      toast.error('Reden moet minimaal 10 tekens bevatten')
      return
    }

    executeAction(currentAction, reason)
  }

  const actionConfig = {
    ban: {
      icon: Ban,
      label: 'Blokkeren',
      color: 'bg-red-600 hover:bg-red-700',
      requiresReason: true
    },
    unban: {
      icon: UserCheck,
      label: 'Deblokkeren',
      color: 'bg-green-600 hover:bg-green-700',
      requiresReason: false
    },
    approve: {
      icon: CheckCircle,
      label: 'Goedkeuren',
      color: 'bg-blue-600 hover:bg-blue-700',
      requiresReason: false
    },
    reject: {
      icon: XCircle,
      label: 'Afwijzen',
      color: 'bg-orange-600 hover:bg-orange-700',
      requiresReason: true
    }
  }

  return (
    <>
      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl z-50 border-t-4 border-blue-400">
        {/* Progress Bar */}
        {showProgress && (
          <div className="h-1 bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Selection Counter / Progress Info */}
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg min-w-[140px]">
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">
                      {Math.round(progress)}% voltooid
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-bold">{selectedCount}</span>
                    <span className="ml-2 text-sm">geselecteerd</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {actions.map((action) => {
                  const config = actionConfig[action]
                  const Icon = config.icon

                  return (
                    <button
                      key={action}
                      onClick={() => handleActionClick(action)}
                      disabled={isProcessing}
                      className={`${config.color} px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105`}
                    >
                      {isProcessing && currentAction === action ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                      <span>{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>Selectie wissen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reason Input Modal */}
      {showReasonInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {currentAction === 'ban' ? 'Blokkeer' : 'Wijs af'} {selectedCount} gebruikers
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Geef een reden voor deze actie (minimaal 10 tekens):
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Voer reden in..."
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-2">
              {reason.length}/500 tekens (min: 10)
            </p>

            {/* Progress in Modal */}
            {isProcessing && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Verwerken...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReasonInput(false)
                  setReason('')
                  setCurrentAction(null)
                }}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSubmitReason}
                disabled={reason.length < 10 || reason.length > 500 || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isProcessing
                    ? 'Verwerken...'
                    : `Bevestig ${currentAction === 'ban' ? 'Blokkeren' : 'Afwijzen'}`
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
