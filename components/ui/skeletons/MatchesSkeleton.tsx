/**
 * Loading skeleton for Matches/Selection page
 */

export function MatchesSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 pt-4 pb-24">
      <div className="max-w-lg mx-auto px-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
