export default function Loading() {
  return (
    <div className="w-full h-full p-4 sm:p-6 flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-surface-200 dark:bg-surface-800 rounded-md"></div>
          <div className="h-4 w-64 bg-surface-100 dark:bg-surface-900 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-surface-200 dark:bg-surface-800 rounded-lg"></div>
      </div>

      {/* Stats/Cards Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-5 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-surface-200 dark:bg-surface-800 rounded"></div>
              <div className="h-8 w-8 bg-surface-200 dark:bg-surface-800 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-32 bg-surface-200 dark:bg-surface-800 rounded"></div>
              <div className="h-3 w-16 bg-surface-200 dark:bg-surface-800 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table / List Skeleton */}
      <div className="flex-1 bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 mt-4 overflow-hidden flex flex-col">
        <div className="h-14 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50 flex items-center px-6">
          <div className="h-4 w-1/3 bg-surface-200 dark:bg-surface-800 rounded"></div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-100/50 dark:bg-surface-800/50 rounded-lg w-full"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
