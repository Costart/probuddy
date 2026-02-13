import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <p className="font-display text-7xl font-extrabold text-primary">404</p>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Page Not Found
        </h1>
        <p className="text-on-surface-variant">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
