"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Track } from "@/features/study-cycle/types"

interface TrackCardProps {
  track: Track
  doneCount: number
  totalCount: number
}

export function TrackCard({ track, doneCount, totalCount }: TrackCardProps) {
  const percentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const getProgressColor = (percent: number) => {
    if (percent >= 67) return "bg-emerald-400"
    if (percent >= 34) return "bg-amber-400"
    return "bg-gray-400"
  }

  return (
    <Link href={`/track/${track.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">{track.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {doneCount} de {totalCount} concluídas
              </span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
