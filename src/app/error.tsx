'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Server Error
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  )
}