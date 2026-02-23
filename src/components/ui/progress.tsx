"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-5 w-full overflow-hidden bg-[#020008]",
      className
    )}
    style={{ border: '2px solid rgba(0,255,65,0.4)', padding: '2px' }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full flex-1 transition-all duration-500",
        indicatorClassName
      )}
      style={{
        // Pixel block fill pattern
        width: `${value || 0}%`,
        background: 'repeating-linear-gradient(90deg, #00ff41 0px, #00ff41 12px, transparent 12px, transparent 16px)',
        boxShadow: '0 0 8px rgba(0,255,65,0.5)',
        transition: 'width 0.5s steps(8)',
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
