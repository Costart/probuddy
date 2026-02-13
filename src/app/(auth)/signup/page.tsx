import { SignupForm } from "@/components/auth/SignupForm"

export const metadata = { title: "Sign Up" }

export default function SignupPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-center text-on-surface">Create an account</h1>
      <p className="mt-2 text-center text-sm text-on-surface-variant">Enter your details to get started</p>
      <div className="mt-8"><SignupForm /></div>
    </div>
  )
}
