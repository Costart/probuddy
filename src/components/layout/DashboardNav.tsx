"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  email?: string;
}

const navLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/sub-services", label: "Sub-Services" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/coverage", label: "Coverage" },
];

export function DashboardNav({ email }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-outline-variant/30 bg-white">
      <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            Admin
          </span>
        </Link>
        <div className="ml-8 flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href ||
                  (link.href !== "/dashboard" && pathname.startsWith(link.href))
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-on-surface-variant">{email}</span>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
}
