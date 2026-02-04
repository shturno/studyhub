"use client"

import type React from "react"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DroppableAreaProps {
  id: string
  children: React.ReactNode
}

export function DroppableArea({ id, children }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-300 rounded-xl",
        isOver
          ? "bg-indigo-500/5 border-2 border-dashed border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)] scale-[1.01]"
          : "border-2 border-transparent"
      )}
    >
      {children}
    </div>
  )
}
