import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-surface to-accent/5 p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-on-surface">
          Hello World
        </h1>
        <p className="text-xl text-on-surface-variant">
          A Next.js starter template with Cloudflare D1 and Auth.js
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outlined" size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
