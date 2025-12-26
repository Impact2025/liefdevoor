'use client'

import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from 'next-themes'

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
  const { theme } = useTheme()

  return (
    <SonnerToaster
      theme={(theme as 'light' | 'dark' | 'system') || 'system'}
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#111827',
          border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
        },
        className: 'toast',
        duration: 4000,
      }}
    />
  )
}

// Re-export toast function for convenience
export { toast } from 'sonner'
