function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#00ff41]/10 ${className ?? ""}`}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6 space-y-6">
      <div
        className="flex items-center justify-between p-3"
        style={{ border: "2px solid #00ff41", background: "#04000a" }}
      >
        <div className="space-y-2">
          <SkeletonBlock className="h-2 w-12 rounded-none" />
          <SkeletonBlock className="h-3 w-24 rounded-none" />
        </div>
        <div className="text-center space-y-2">
          <SkeletonBlock className="h-2 w-8 rounded-none mx-auto" />
          <SkeletonBlock className="h-8 w-10 rounded-none mx-auto" />
        </div>
        <div className="text-right space-y-2">
          <SkeletonBlock className="h-2 w-12 rounded-none ml-auto" />
          <SkeletonBlock className="h-3 w-28 rounded-none ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 space-y-3"
            style={{ border: "2px solid rgba(0,255,65,0.3)", background: "#04000a" }}
          >
            <SkeletonBlock className="h-2 w-16 rounded-none" />
            <SkeletonBlock className="h-6 w-20 rounded-none" />
            <SkeletonBlock className="h-2 w-12 rounded-none" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 p-6 space-y-4"
          style={{ border: "2px solid #00ff41", background: "#04000a" }}
        >
          <SkeletonBlock className="h-2 w-24 rounded-none" />
          <SkeletonBlock className="h-3 w-32 rounded-none" />
          <SkeletonBlock className="h-8 w-56 rounded-none" />
          <SkeletonBlock className="h-10 w-36 rounded-none" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="p-4 space-y-3"
              style={{ border: "2px solid rgba(0,255,65,0.4)", background: "#04000a" }}
            >
              <SkeletonBlock className="h-2 w-16 rounded-none" />
              <SkeletonBlock className="h-6 w-24 rounded-none" />
            </div>
          ))}
        </div>
      </div>

      <div style={{ border: "2px solid rgba(0,255,65,0.4)", background: "#04000a" }}>
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0,255,65,0.2)" }}
        >
          <SkeletonBlock className="h-2 w-32 rounded-none" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 grid grid-cols-12 gap-2"
            style={{ borderBottom: "1px solid rgba(0,255,65,0.05)" }}
          >
            <SkeletonBlock className="col-span-5 h-4 rounded-none" />
            <SkeletonBlock className="col-span-3 h-4 rounded-none" />
            <SkeletonBlock className="col-span-2 h-4 rounded-none ml-auto" />
            <SkeletonBlock className="col-span-2 h-4 rounded-none ml-auto" />
          </div>
        ))}
      </div>

      <div
        className="p-4"
        style={{ border: "2px solid rgba(0,255,65,0.3)", background: "#04000a" }}
      >
        <SkeletonBlock className="h-2 w-20 rounded-none mb-4" />
        <SkeletonBlock className="h-24 w-full rounded-none" />
      </div>

      <div
        className="p-4"
        style={{ border: "2px solid rgba(0,255,65,0.3)", background: "#04000a" }}
      >
        <SkeletonBlock className="h-2 w-20 rounded-none mb-4" />
        <SkeletonBlock className="h-48 w-full rounded-none" />
      </div>
    </div>
  );
}
