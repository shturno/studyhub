"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ContestSelectorProps } from "./types";

export function ContestSelector({
  contests,
  activeContestId,
}: ContestSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (contests.length <= 1) return null;

  const selected =
    activeContestId ?? contests.find((c) => c.isPrimary)?.id ?? contests[0]?.id;

  function handleChange(id: string) {
    const url = `${pathname}?contestId=${id}`;
    router.push(url);
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className="font-pixel text-[7px] text-[#7f7f9f] shrink-0"
        style={{ letterSpacing: "0.1em" }}
      >
        CONCURSO
      </span>
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="font-mono text-sm text-[#e0e0ff] bg-[#04000a] px-3 py-1.5 outline-none cursor-pointer hover:border-[#7b61ff]/80 transition-colors"
        style={{
          border: "2px solid rgba(123,97,255,0.5)",
          minWidth: "180px",
        }}
      >
        {contests.map((c) => (
          <option key={c.id} value={c.id} className="bg-[#04000a]">
            {c.name}
            {c.isPrimary ? " ★" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
