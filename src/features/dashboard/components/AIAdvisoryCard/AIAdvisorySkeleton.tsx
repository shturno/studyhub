export function AIAdvisorySkeleton() {
  return (
    <div
      style={{
        border: "2px solid rgba(123,97,255,0.3)",
        background: "#04000a",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(123,97,255,0.15)" }}
      >
        <div className="h-2 w-24 bg-[#7b61ff]/20 animate-pulse" />
        <div className="h-3 w-3 bg-[#7b61ff]/20 animate-pulse rounded-full" />
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="h-2 w-full bg-[#7b61ff]/10 animate-pulse" />
          <div className="h-2 w-full bg-[#7b61ff]/10 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-2 w-2 bg-[#7b61ff]/20 animate-pulse shrink-0 mt-1" />
              <div className="h-2 flex-1 bg-[#7b61ff]/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
