'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-4">Global Error</h2>
        <p className="text-gray-600 mb-8">Something went wrong!</p>
        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
        >
          Try Again
        </button>
      </div>
    </main>
  )
}
