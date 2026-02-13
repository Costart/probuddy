import Link from "next/link"

export function PublicFooter() {
  return (
    <footer className="border-t border-outline-variant/50 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} FindaPro. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link href="/privacy" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
