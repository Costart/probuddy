import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface">
          Hello, {session.user.email}
        </h1>
        <p className="mt-2 text-on-surface-variant">
          You are signed in. Welcome to your dashboard.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-on-surface-variant">
            This is your protected dashboard. Start building your app by editing{" "}
            <code className="rounded bg-surface-container px-1.5 py-0.5 text-sm font-mono text-primary">
              src/app/(dashboard)/dashboard/page.tsx
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
