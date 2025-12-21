/**
 * Desktop Wrapper Component
 *
 * Wraps page content to properly offset for the desktop sidebar
 */

'use client'

interface DesktopWrapperProps {
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
}

export function DesktopWrapper({
  children,
  className = '',
  fullHeight = false,
}: DesktopWrapperProps) {
  return (
    <div
      className={`
        lg:ml-64 lg:pt-16
        ${fullHeight ? 'min-h-screen' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
