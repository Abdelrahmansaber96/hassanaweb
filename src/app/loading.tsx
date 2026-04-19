export default function Loading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto px-4 py-10">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-64" />
        ))}
      </div>
    </div>
  );
}
