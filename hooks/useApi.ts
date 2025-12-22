/**
 * useApi Hook
 *
 * Generic hook for making API calls with loading and error states.
 * Provides type-safe API calls with automatic error handling.
 */

'use client'

import { useState, useCallback } from 'react'
import type { ApiResponse } from '@/lib/types'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseApiResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  execute: (endpoint: string, options?: RequestInit) => Promise<T | null>
  reset: () => void
}

/**
 * Generic API hook for making HTTP requests
 *
 * @param options - Callback options for success/error
 * @returns API state and execute function
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error } = useApi({
 *   onSuccess: (data) => console.log('Success!', data),
 *   onError: (error) => toast.error(error.message)
 * })
 *
 * const handleSubmit = async () => {
 *   await execute('/api/swipe', {
 *     method: 'POST',
 *     body: JSON.stringify({ swipedId: 'user123', isLike: true })
 *   })
 * }
 * ```
 */
export function useApi<T = any>(options: UseApiOptions = {}): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (endpoint: string, fetchOptions: RequestInit = {}): Promise<T | null> => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(endpoint, {
          ...fetchOptions,
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        })

        const responseData: ApiResponse<T> = await response.json()

        if (!response.ok || !responseData.success) {
          const errorMessage =
            responseData.error?.message || `Request failed with status ${response.status}`
          console.error('[useApi] Request failed:', errorMessage, responseData)
          throw new Error(errorMessage)
        }

        const result = responseData.data || null
        setData(result)

        if (options.onSuccess) {
          options.onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred')
        console.error('[useApi] Error:', error)
        setError(error)

        if (options.onError) {
          options.onError(error)
        }

        return null
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  }
}

/**
 * Hook specifically for POST requests
 */
export function usePost<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): Omit<UseApiResult<T>, 'execute'> & {
  post: (body: any) => Promise<T | null>
} {
  const { execute, ...rest } = useApi<T>(options)

  const post = useCallback(
    async (body: any) => {
      return execute(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    [endpoint, execute]
  )

  return {
    ...rest,
    post,
  }
}

/**
 * Hook specifically for PUT requests
 */
export function usePut<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): Omit<UseApiResult<T>, 'execute'> & {
  put: (body: any) => Promise<T | null>
} {
  const { execute, ...rest } = useApi<T>(options)

  const put = useCallback(
    async (body: any) => {
      return execute(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    [endpoint, execute]
  )

  return {
    ...rest,
    put,
  }
}

/**
 * Hook specifically for DELETE requests
 */
export function useDelete<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): Omit<UseApiResult<T>, 'execute'> & {
  del: () => Promise<T | null>
} {
  const { execute, ...rest } = useApi<T>(options)

  const del = useCallback(async () => {
    return execute(endpoint, {
      method: 'DELETE',
    })
  }, [endpoint, execute])

  return {
    ...rest,
    del,
  }
}
