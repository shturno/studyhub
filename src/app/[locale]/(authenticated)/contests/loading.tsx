function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#00ff41]/10 ${className ?? ""}`} />;
}

export default function ContestsLoading() {
  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <SkeletonBlock className="h-4 w-32 rounded-none" />
        <SkeletonBlock className="h-9 w-36 rounded-none" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 space-y-3"
          style={{ border: "2px solid rgba(0,255,65,0.3)", background: "#04000a" }}
        >
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-3 w-56 rounded-none" />
            <SkeletonBlock className="h-5 w-16 rounded-none" />
          </div>
          <SkeletonBlock className="h-2 w-40 rounded-none" />
          <div className="flex gap-3">
            <SkeletonBlock className="h-8 w-24 rounded-none" />
            <SkeletonBlock className="h-8 w-24 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
