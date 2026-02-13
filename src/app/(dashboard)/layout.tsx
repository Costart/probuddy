import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-surface">
      <DashboardNav email={session.user.email} />
      <main className="max-w-7xl mx-auto py-8 px-6">{children}</main>
    </div>
  );
}
