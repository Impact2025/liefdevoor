/**
 * useMediaQuery Hook
 *
 * Detect media query matches for responsive design
 */

'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect if a media query matches
 *
 * @param query - Media query string
 * @returns Boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *   </div>
 * )
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Return early if window is undefined (SSR)
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback for older browsers
      media.addListener(listener)
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

/**
 * Common breakpoint hooks
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}
