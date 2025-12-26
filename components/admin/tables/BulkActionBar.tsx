'use client'

import { X, Ban, UserCheck, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
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
 * Sticky action bar for bulk operations with confirmation
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

  if (selectedCount === 0) return null

  const handleActionClick = (action: 'ban' | 'unban' | 'approve' | 'reject') => {
    // Actions that require a reason
    if (action === 'ban' || action === 'reject') {
      setCurrentAction(action)
      setShowReasonInput(true)
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: 'ban' | 'unban' | 'approve' | 'reject', actionReason?: string) => {
    setIsProcessing(true)
    try {
      await toast.promise(
        onBulkAction(action, actionReason || reason),
        {
          loading: `Processing ${action} for ${selectedCount} users...`,
          success: `Successfully ${action}ed ${selectedCount} users!`,
          error: `Failed to ${action} users`
        }
      )
      setShowReasonInput(false)
      setReason('')
      setCurrentAction(null)
    } catch (error) {
      console.error(`Failed to ${action} users:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmitReason = () => {
    if (!currentAction) return

    if (reason.length < 10) {
      toast.error('Reason must be at least 10 characters')
      return
    }

    executeAction(currentAction, reason)
  }

  const actionConfig = {
    ban: {
      icon: Ban,
      label: 'Ban',
      color: 'bg-red-600 hover:bg-red-700',
      requiresReason: true
    },
    unban: {
      icon: UserCheck,
      label: 'Unban',
      color: 'bg-green-600 hover:bg-green-700',
      requiresReason: false
    },
    approve: {
      icon: CheckCircle,
      label: 'Approve',
      color: 'bg-blue-600 hover:bg-blue-700',
      requiresReason: false
    },
    reject: {
      icon: XCircle,
      label: 'Reject',
      color: 'bg-orange-600 hover:bg-orange-700',
      requiresReason: true
    }
  }

  return (
    <>
      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl z-50 border-t-4 border-blue-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-lg font-bold">{selectedCount}</span>
                <span className="ml-2 text-sm">selected</span>
              </div>

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
                      <Icon className="w-4 h-4" />
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
              <span>Clear Selection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reason Input Modal */}
      {showReasonInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {currentAction === 'ban' ? 'Ban' : 'Reject'} {selectedCount} Users
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide a reason for this action (minimum 10 characters):
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              {reason.length}/500 characters (min: 10)
            </p>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowReasonInput(false)
                  setReason('')
                  setCurrentAction(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReason}
                disabled={reason.length < 10 || reason.length > 500}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm {currentAction === 'ban' ? 'Ban' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
