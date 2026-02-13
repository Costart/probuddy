import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata = { title: "Login" }

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-center text-on-surface">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-on-surface-variant">Sign in to your account to continue</p>
      <div className="mt-8">
        <Suspense><LoginForm /></Suspense>
      </div>
    </div>
  )
}
