import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getRecentLeads } from "@/lib/db/queries/leads"
import { Card, CardContent } from "@/components/ui/Card"

export const metadata = { title: "Lead Submissions" }

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const leads = await getRecentLeads(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-on-surface">Leads</h1>
        <p className="mt-1 text-on-surface-variant">{leads.length} recent submissions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 text-left text-on-surface-variant">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Sub-Service</th>
                  <th className="p-4 font-medium">Postal Code</th>
                  <th className="p-4 font-medium">City</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-outline-variant/30 hover:bg-surface-container/50">
                    <td className="p-4 font-medium text-on-surface">{lead.name}</td>
                    <td className="p-4 text-on-surface-variant">{lead.categorySlug}</td>
                    <td className="p-4 text-on-surface-variant">{lead.subServiceSlug ?? "—"}</td>
                    <td className="p-4 text-on-surface-variant">{lead.postalCode}</td>
                    <td className="p-4 text-on-surface-variant">{lead.detectedCity ?? "—"}</td>
                    <td className="p-4">
                      <span className={
                        lead.handoffStatus === "sent" ? "text-primary font-medium" :
                        lead.handoffStatus === "failed" ? "text-error font-medium" :
                        "text-outline"
                      }>
                        {lead.handoffStatus}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                      No leads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
