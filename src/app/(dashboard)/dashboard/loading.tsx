export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-surface-container rounded-lg" />
        <div className="h-4 w-64 bg-surface-container rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-surface-container rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
