/**
 * Loading skeleton for Chat page
 */

export function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header skeleton */}
      <div className="bg-white shadow-sm p-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md h-12 rounded-lg animate-pulse ${
                i % 2 === 0 ? 'bg-primary/20' : 'bg-gray-200'
              }`}
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
