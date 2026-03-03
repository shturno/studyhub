"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { DroppableAreaProps } from "./types";

export function DroppableArea({ id, children }: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200",
        isOver ? "scale-[1.005]" : "",
      )}
      style={
        isOver
          ? {
              outline: "2px dashed rgba(0,255,65,0.6)",
              boxShadow: "0 0 20px rgba(0,255,65,0.1)",
              background: "rgba(0,255,65,0.03)",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
