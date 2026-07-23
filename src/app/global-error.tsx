"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error caught:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold mb-2">Critical Application Error</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 break-words">
            {error.message || "A system-level error occurred."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
            >
              Reload Application
            </button>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-medium rounded-lg text-sm transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
