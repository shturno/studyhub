function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#00f5ff]/10 ${className ?? ""}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[#080010] p-4 md:p-6 space-y-6">
      <SkeletonBlock className="h-4 w-24 rounded-none" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-4 space-y-4"
          style={{ border: "2px solid rgba(0,245,255,0.3)", background: "#04000a" }}
        >
          <SkeletonBlock className="h-3 w-32 rounded-none" />
          <SkeletonBlock className="h-9 w-full rounded-none" />
          <SkeletonBlock className="h-9 w-full rounded-none" />
          <SkeletonBlock className="h-9 w-32 rounded-none" />
        </div>
      ))}
    </div>
  );
}
