"use client"

import { useDraggable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"
import { Clock, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  trackName: string
  trackId: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE"
  estimated: number | null
}

interface DraggableLessonProps {
  lesson: Lesson
}

export function DraggableLesson({ lesson }: DraggableLessonProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lesson.id,
  })

  // Smooth rotation for more natural feel
  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.05)`,
      zIndex: 999,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
    }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 border rounded-xl bg-card border-border/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 group select-none",
        isDragging ? "opacity-0" : "opacity-100", // Hide original when dragging (using DragOverlay usually, but if not using overlay, opacity should be 1. Assuming Overlay is used)
        // If DropOverlay is used, we should control opacity logic there. 
        // For simplicity with dnd-kit default behavior in previous code:
        isDragging && "opacity-30"
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-md bg-zinc-900 text-zinc-500 group-hover:text-primary transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground">{lesson.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{lesson.trackName}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge variant={lesson.status === "IN_PROGRESS" ? "secondary" : "outline"} className="text-[10px] h-5">
              {lesson.status === "IN_PROGRESS" ? "Em andamento" : "Não iniciada"}
            </Badge>
            {lesson.estimated && (
              <div className="flex items-center space-x-1 text-xs text-zinc-500 font-mono">
                <Clock className="h-3 w-3" />
                <span>{lesson.estimated}m</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
