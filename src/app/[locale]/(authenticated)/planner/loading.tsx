function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#00ff41]/10 ${className ?? ""}`} />;
}

export default function PlannerLoading() {
  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <SkeletonBlock className="h-4 w-28 rounded-none" />
        <SkeletonBlock className="h-9 w-32 rounded-none" />
      </div>

      <div
        className="p-4"
        style={{ border: "2px solid rgba(0,255,65,0.3)", background: "#04000a" }}
      >
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
            <div key={d} className="text-center py-2">
              <SkeletonBlock className="h-2 w-8 mx-auto rounded-none" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square p-1"
              style={{ border: "1px solid rgba(0,255,65,0.1)" }}
            >
              <SkeletonBlock className="h-2 w-4 rounded-none mb-1" />
              {Math.random() > 0.7 && (
                <SkeletonBlock className="h-4 w-full rounded-none" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
