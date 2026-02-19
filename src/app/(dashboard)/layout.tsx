import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ClarityIdentify } from "@/components/ClarityIdentify";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-surface">
      <ClarityIdentify
        userId={session.user.id!}
        friendlyName={session.user.email ?? undefined}
      />
      <DashboardNav email={session.user.email} />
      <main className="max-w-7xl mx-auto py-8 px-6">{children}</main>
    </div>
  );
}
