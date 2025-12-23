/**
 * Loading skeleton for Discover page
 */

export function DiscoverSkeleton() {
  return (
    <div className="h-full max-w-lg mx-auto px-3">
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse w-full">
          <div className="h-[75vh] bg-gray-800 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}
