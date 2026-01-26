/**
 * VerificationRequiredModal Component
 *
 * Toont een modal wanneer een INACTIVE migration user probeert
 * te berichten of liken zonder foto + liveness verificatie.
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Camera, UserCheck, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import Link from 'next/link'

export interface VerificationRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  action?: 'message' | 'swipe' | 'like'
  missingVerifications?: ('photo' | 'liveness')[]
  verificationUrl?: string
}

export function VerificationRequiredModal({
  isOpen,
  onClose,
  action = 'message',
  missingVerifications = ['photo', 'liveness'],
  verificationUrl = '/verificatie',
}: VerificationRequiredModalProps) {
  const actionText = action === 'message' ? 'berichten sturen' : 'liken'

  const missingPhoto = missingVerifications.includes('photo')
  const missingLiveness = missingVerifications.includes('liveness')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-rose-500 to-pink-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Sluiten"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Shield size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Verificatie Vereist</h2>
                  <p className="text-white/90 text-sm">
                    Nog even en je kunt {actionText}!
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Om {actionText} vragen we je eerst om je account te verifiëren.
                Dit zorgt voor een veilige community met alleen echte mensen.
              </p>

              {/* Verification steps */}
              <div className="space-y-3 mb-6">
                <div className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-colors
                  ${missingPhoto
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-green-200 bg-green-50'
                  }
                `}>
                  <div className={`
                    p-2 rounded-full
                    ${missingPhoto ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}
                  `}>
                    <Camera size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Foto Verificatie</p>
                    <p className="text-sm text-gray-600">
                      {missingPhoto
                        ? 'Upload een duidelijke profielfoto'
                        : 'Voltooid!'
                      }
                    </p>
                  </div>
                  {!missingPhoto && (
                    <div className="text-green-600 font-bold">✓</div>
                  )}
                </div>

                <div className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-colors
                  ${missingLiveness
                    ? 'border-rose-200 bg-rose-50'
                    : 'border-green-200 bg-green-50'
                  }
                `}>
                  <div className={`
                    p-2 rounded-full
                    ${missingLiveness ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}
                  `}>
                    <UserCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Liveness Check</p>
                    <p className="text-sm text-gray-600">
                      {missingLiveness
                        ? 'Bewijs dat je echt bent met een korte video'
                        : 'Voltooid!'
                      }
                    </p>
                  </div>
                  {!missingLiveness && (
                    <div className="text-green-600 font-bold">✓</div>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Na verificatie kun je:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-rose-500">♥</span>
                    Onbeperkt berichten sturen
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-rose-500">♥</span>
                    Profielen liken en matchen
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-rose-500">♥</span>
                    Geverifieerd badge op je profiel
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Later
                </Button>
                <Link href={verificationUrl} className="flex-1">
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Verifieer Nu
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default VerificationRequiredModal
