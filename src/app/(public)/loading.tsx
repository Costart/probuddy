export default function PublicLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-surface-container py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="h-12 w-96 bg-outline-variant/20 rounded-lg mx-auto" />
          <div className="h-6 w-80 bg-outline-variant/20 rounded-lg mx-auto" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="h-8 w-48 bg-surface-container rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-surface-container rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
