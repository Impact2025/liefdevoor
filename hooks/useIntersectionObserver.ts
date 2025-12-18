/**
 * useIntersectionObserver Hook
 *
 * Detect when an element enters the viewport (useful for infinite scroll)
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

/**
 * Hook to detect element visibility using Intersection Observer API
 *
 * @param options - Intersection Observer options
 * @returns Tuple of [ref, entry, isVisible]
 *
 * @example
 * ```tsx
 * const [ref, entry, isVisible] = useIntersectionObserver({
 *   threshold: 0.5,
 *   freezeOnceVisible: true
 * })
 *
 * useEffect(() => {
 *   if (isVisible) {
 *     loadMoreData()
 *   }
 * }, [isVisible])
 *
 * return <div ref={ref}>Load more trigger</div>
 * ```
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, IntersectionObserverEntry | undefined, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options

  const ref = useRef<T>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isVisible, setIsVisible] = useState(false)

  const frozen = freezeOnceVisible && isVisible

  useEffect(() => {
    const node = ref.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) {
      return
    }

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        setIsVisible(entry.isIntersecting)
      },
      observerParams
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, frozen, ref])

  return [ref, entry, isVisible]
}

/**
 * Simple infinite scroll hook
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const [sentryRef, , isVisible] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '100px',
  })

  useEffect(() => {
    if (isVisible && hasMore && !isLoading) {
      onLoadMore()
    }
  }, [isVisible, hasMore, isLoading, onLoadMore])

  return sentryRef
}
