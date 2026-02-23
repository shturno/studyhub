"use client"

import Link from "next/link"
import type { Track } from "@/features/study-cycle/types"

interface TrackCardProps {
  readonly track: Track
  readonly doneCount: number
  readonly totalCount: number
}

export function TrackCard({ track, doneCount, totalCount }: TrackCardProps) {
  const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const getFillColor = (percent: number) => {
    if (percent >= 67) return '#00ff41'
    if (percent >= 34) return '#ffbe0b'
    return '#555'
  }

  return (
    <Link href={`/track/${track.id}`} className="group block">
      <div className="p-4 transition-all duration-100 hover:-translate-y-0.5"
        style={{ border: '2px solid rgba(0,255,65,0.35)', background: '#04000a', boxShadow: '4px 4px 0 rgba(0,255,65,0.1)' }}>
        <div className="font-mono text-lg text-[#e0e0ff] group-hover:text-[#00ff41] transition-colors truncate mb-3">
          {track.name}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-pixel text-[6px] text-[#7f7f9f]">{doneCount} de {totalCount} concluídas</span>
            <span className="font-pixel text-[6px]" style={{ color: getFillColor(percentage) }}>{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#020008]" style={{ border: '1px solid rgba(0,255,65,0.2)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: getFillColor(percentage),
                boxShadow: `0 0 8px ${getFillColor(percentage)}60`,
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
