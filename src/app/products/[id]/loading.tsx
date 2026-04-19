export default function Loading() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-gray-100 rounded-2xl h-96" />
        <div className="space-y-4">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-3/4 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );
}
