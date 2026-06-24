export function SkeletonLoading() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 gap-4 animate-pulse">
      {/* Header skeleton */}
      <div className="w-1/3 h-6 bg-gray-700/50 rounded-md"></div>

      {/* Content skeleton lines */}
      <div className="w-full h-12 bg-gray-700/30 rounded-lg"></div>
      <div className="w-full h-12 bg-gray-700/30 rounded-lg"></div>
      <div className="w-3/4 h-12 bg-gray-700/30 rounded-lg"></div>

      {/* Bottom skeleton */}
      <div className="w-1/2 h-8 bg-gray-700/40 rounded-full mt-4"></div>
    </div>
  );
}
