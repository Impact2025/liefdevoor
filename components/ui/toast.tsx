'use client'

import { Toaster as SonnerToaster } from 'sonner'

/**
 * Toast Provider - Wrapper around Sonner
 *
 * Usage:
 * import { toast } from 'sonner'
 *
 * toast.success('Success message')
 * toast.error('Error message')
 * toast.info('Info message')
 * toast.warning('Warning message')
 *
 * // With promise
 * toast.promise(asyncFunction(), {
 *   loading: 'Loading...',
 *   success: 'Success!',
 *   error: 'Error occurred'
 * })
 */
export function ToastProvider() {
  return (
    <SonnerToaster
      theme="light"
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#111827',
          border: '1px solid #e5e7eb',
        },
        className: 'toast',
        duration: 4000,
      }}
    />
  )
}

// Re-export toast function for convenience
export { toast } from 'sonner'
