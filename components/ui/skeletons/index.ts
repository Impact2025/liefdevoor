/**
 * Loading skeleton components
 *
 * Usage with Suspense:
 * ```tsx
 * import { Suspense } from 'react'
 * import { DiscoverSkeleton } from '@/components/ui/skeletons'
 *
 * <Suspense fallback={<DiscoverSkeleton />}>
 *   <DiscoverContent />
 * </Suspense>
 * ```
 */

export { DiscoverSkeleton } from './DiscoverSkeleton'
export { MatchesSkeleton } from './MatchesSkeleton'
export { ChatSkeleton } from './ChatSkeleton'
