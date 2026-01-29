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

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 border rounded-lg bg-white dark:bg-gray-900 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-lg",
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start space-x-3">
        <GripVertical className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{lesson.title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{lesson.trackName}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge variant={lesson.status === "IN_PROGRESS" ? "secondary" : "outline"} className="text-xs">
              {lesson.status === "IN_PROGRESS" ? "Em andamento" : "Não iniciada"}
            </Badge>
            {lesson.estimated && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{lesson.estimated}min</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
