import React from "react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-surface to-accent/5 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center">
          <Link href="/" className="font-display text-xl font-extrabold text-on-surface">
            Your App
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-10 shadow-elevation-3 border border-outline-variant/50">
          {children}
        </div>
      </div>
    </div>
  )
}
