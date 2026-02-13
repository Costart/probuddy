import { getGeoData } from "@/lib/geo"
import { PublicHeader } from "@/components/layout/PublicHeader"
import { PublicFooter } from "@/components/layout/PublicFooter"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const geo = await getGeoData()

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <PublicHeader city={geo.city} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
