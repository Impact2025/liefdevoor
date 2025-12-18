/**
 * Test Utilities
 *
 * Reusable utilities for testing React components and hooks
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

/**
 * Mock session data for authenticated tests
 */
export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER',
    profileImage: null,
    isVerified: true,
    safetyScore: 100,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Mock admin session
 */
export const mockAdminSession: Session = {
  user: {
    id: 'test-admin-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    profileImage: null,
    isVerified: true,
    safetyScore: 100,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

interface WrapperProps {
  children: React.ReactNode
  session?: Session | null
}

/**
 * Test wrapper with providers
 */
function AllTheProviders({ children, session }: WrapperProps) {
  return (
    <SessionProvider session={session || mockSession}>
      {children}
    </SessionProvider>
  )
}

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { session?: Session | null }
) {
  const { session, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  })
}

/**
 * Create mock fetch response
 */
export function createMockResponse<T>(data: T, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic' as ResponseType,
    url: '',
    clone: function() { return this },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response)
}

/**
 * Wait for promises to resolve
 */
export const waitForPromises = () => new Promise((resolve) => setImmediate(resolve))

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
