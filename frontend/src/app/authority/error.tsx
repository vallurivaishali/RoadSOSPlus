'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

export default function AuthorityError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-400 mb-5">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="btn-primary">
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      </div>
    </div>
  )
}
