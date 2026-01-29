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
        "transition-colors duration-200",
        isOver && "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600",
      )}
    >
      {children}
    </div>
  )
}
