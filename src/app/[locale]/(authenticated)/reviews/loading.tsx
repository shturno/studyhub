function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#ff006e]/10 ${className ?? ""}`} />;
}

export default function ReviewsLoading() {
  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6 space-y-4">
      <SkeletonBlock className="h-4 w-40 rounded-none mb-6" />

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-4 space-y-2 text-center"
            style={{ border: "2px solid rgba(255,0,110,0.3)", background: "#04000a" }}
          >
            <SkeletonBlock className="h-6 w-12 mx-auto rounded-none" />
            <SkeletonBlock className="h-2 w-20 mx-auto rounded-none" />
          </div>
        ))}
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 space-y-3"
          style={{ border: "2px solid rgba(255,0,110,0.3)", background: "#04000a" }}
        >
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-3 w-48 rounded-none" />
            <SkeletonBlock className="h-5 w-20 rounded-none" />
          </div>
          <SkeletonBlock className="h-2 w-32 rounded-none" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <SkeletonBlock key={j} className="h-8 w-12 rounded-none" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
