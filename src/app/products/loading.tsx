export default function Loading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-10 w-64 bg-gray-200 rounded mb-8" />
      <div className="flex gap-2 mb-6 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-64" />
        ))}
      </div>
    </div>
  );
}
