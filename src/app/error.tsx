"use client"

import { Button } from "@/components/ui/Button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <p className="font-display text-7xl font-extrabold text-error">Error</p>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Something went wrong
        </h1>
        <p className="text-on-surface-variant">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  )
}
