function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#ffbe0b]/10 ${className ?? ""}`} />;
}

export default function GamificationLoading() {
  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6 space-y-6">
      <div
        className="p-6 text-center space-y-4"
        style={{ border: "2px solid #ffbe0b", background: "#04000a" }}
      >
        <SkeletonBlock className="h-3 w-16 mx-auto rounded-none" />
        <SkeletonBlock className="h-16 w-24 mx-auto rounded-none" />
        <SkeletonBlock className="h-4 w-full rounded-none" />
        <SkeletonBlock className="h-2 w-32 mx-auto rounded-none" />
      </div>

      <SkeletonBlock className="h-3 w-24 rounded-none" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 space-y-2"
            style={{ border: "2px solid rgba(255,190,11,0.3)", background: "#04000a" }}
          >
            <SkeletonBlock className="h-8 w-8 rounded-none" />
            <SkeletonBlock className="h-3 w-24 rounded-none" />
            <SkeletonBlock className="h-2 w-full rounded-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
