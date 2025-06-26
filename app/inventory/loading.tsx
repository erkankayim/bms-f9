export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <div className="h-9 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="mt-2 h-4 w-1/2 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </header>

      <div className="mb-4 h-10 w-full max-w-sm rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>

      <div className="rounded-lg border dark:border-gray-700">
        <div className="h-[600px] w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="h-5 w-1/3 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="h-9 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
