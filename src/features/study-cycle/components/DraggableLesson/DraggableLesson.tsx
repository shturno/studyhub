"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Clock, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly trackId: string;
  readonly status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
  readonly estimated: number | null;
  readonly track?: {
    readonly name: string;
  };
}

interface DraggableLessonProps {
  readonly lesson: Lesson;
}

export function DraggableLesson({ lesson }: DraggableLessonProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lesson.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.02)`,
        zIndex: 999,
        boxShadow: "0 0 20px rgba(0,255,65,0.3), 4px 4px 0 #006b1a",
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 cursor-grab active:cursor-grabbing select-none transition-all duration-100 group",
        isDragging ? "opacity-30" : "opacity-100 hover:-translate-y-0.5",
      )}
      {...listeners}
      {...attributes}
      tabIndex={0}
    >
      <div
        className="flex items-start gap-3"
        style={{
          border: "1px solid rgba(0,255,65,0.3)",
          background: "#020008",
          padding: "8px",
        }}
      >
        <div className="p-1 text-[#555] group-hover:text-[#00ff41] transition-colors flex-shrink-0">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-base text-[#e0e0ff] truncate">
            {lesson.title}
          </div>
          <div className="font-mono text-sm text-[#7f7f9f] truncate">
            {lesson.track?.name}
          </div>
          <div className="flex items-center justify-between mt-2">
            <Badge
              variant={
                lesson.status === "IN_PROGRESS" ? "secondary" : "outline"
              }
            >
              {lesson.status === "IN_PROGRESS"
                ? "EM ANDAMENTO"
                : "NAO INICIADA"}
            </Badge>
            {lesson.estimated && (
              <div className="flex items-center gap-1 font-mono text-sm text-[#555]">
                <Clock className="h-3 w-3" />
                <span>{lesson.estimated}m</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
