/**
 * Confirmation Dialog Component
 *
 * Reusable confirmation modal voor destructive admin actions
 * Supports typing confirmation voor extra veiligheid
 */

'use client'

import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { AlertTriangle, X } from 'lucide-react'

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  confirmStyle?: 'danger' | 'warning' | 'primary'
  requiresInput?: boolean // Requires typing "CONFIRM" or custom text
  inputMatch?: string // Text that must be typed (default: "CONFIRM")
  impactPreview?: string[] // List of impacts (e.g., "User will be banned", "All data deleted")
  isLoading?: boolean
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bevestig',
  confirmStyle = 'danger',
  requiresInput = false,
  inputMatch = 'CONFIRM',
  impactPreview,
  isLoading = false
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  const canConfirm = !requiresInput || inputValue === inputMatch

  const handleConfirm = async () => {
    if (!canConfirm || isConfirming || isLoading) return

    setIsConfirming(true)

    try {
      await onConfirm()
      handleClose()
    } catch (error) {
      console.error('[ConfirmationDialog] Error:', error)
      // Don't close on error - let user retry or cancel
    } finally {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    if (isConfirming || isLoading) return
    setInputValue('')
    onClose()
  }

  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-rose-600 hover:bg-rose-700 text-white'
  }

  const iconStyles = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    primary: 'bg-rose-100 text-rose-600'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      closeOnBackdropClick={!isConfirming && !isLoading}
    >
      <div className="p-6">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconStyles[confirmStyle]}`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 text-center mb-4">
          {title}
        </h2>

        {/* Message */}
        <p className="text-slate-600 text-center mb-6">
          {message}
        </p>

        {/* Impact Preview */}
        {impactPreview && impactPreview.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Dit zal de volgende impact hebben:
            </p>
            <ul className="space-y-1">
              {impactPreview.map((impact, index) => (
                <li key={index} className="text-sm text-slate-600 flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation Input */}
        {requiresInput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type <span className="font-bold text-red-600">{inputMatch}</span> om te bevestigen
            </label>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputMatch}
              disabled={isConfirming || isLoading}
              autoFocus
              className={inputValue === inputMatch ? 'border-green-500' : ''}
            />
            {inputValue && inputValue !== inputMatch && (
              <p className="text-xs text-red-600 mt-1">
                Tekst komt niet overeen
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isConfirming || isLoading}
            className="min-w-[100px]"
          >
            <X className="w-4 h-4 mr-2" />
            Annuleer
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming || isLoading}
            isLoading={isConfirming || isLoading}
            className={`min-w-[120px] ${buttonStyles[confirmStyle]}`}
          >
            {isConfirming || isLoading ? 'Bezig...' : confirmText}
          </Button>
        </div>

        {/* Warning footer for dangerous actions */}
        {confirmStyle === 'danger' && (
          <p className="text-xs text-slate-500 text-center mt-4">
            ⚠️ Deze actie kan niet ongedaan worden gemaakt
          </p>
        )}
      </div>
    </Modal>
  )
}

/**
 * Hook voor eenvoudig gebruik
 */
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    props: Partial<ConfirmationDialogProps>
  }>({
    isOpen: false,
    props: {}
  })

  const confirm = (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        props: {
          ...props,
          onConfirm: async () => {
            await props.onConfirm()
            resolve(true)
          }
        }
      })
    })
  }

  const close = () => {
    setDialogState({ isOpen: false, props: {} })
  }

  const Dialog = () => (
    <ConfirmationDialog
      isOpen={dialogState.isOpen}
      onClose={close}
      title={dialogState.props.title || ''}
      message={dialogState.props.message || ''}
      onConfirm={dialogState.props.onConfirm || (() => {})}
      {...dialogState.props}
    />
  )

  return { confirm, close, Dialog }
}
