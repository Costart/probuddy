"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface DashboardNavProps {
  email?: string;
}

export function DashboardNav({ email }: DashboardNavProps) {
  return (
    <nav className="border-b border-outline-variant/30 bg-white">
      <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display text-lg font-extrabold text-on-surface">Your App</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-on-surface-variant">{email}</span>
          <Button variant="outlined" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
}
