import Link from "next/link";
import { Logo } from "./Logo";

interface PublicHeaderProps {
  city?: string | null;
}

export function PublicHeader({ city }: PublicHeaderProps) {
  return (
    <header className="border-b border-outline-variant/50 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/services"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Services
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            How It Works
          </Link>
        </nav>
        {city && (
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-on-surface-variant">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            <span>{city}</span>
          </div>
        )}
      </div>
    </header>
  );
}
