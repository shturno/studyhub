import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(

          "flex h-10 w-full bg-[#020008] px-3 py-2 font-mono text-base text-[#e0e0ff]",
          "placeholder:text-[#3a3a5c]",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",

          "caret-[#00ff41]",
          className
        )}
        style={{
          border: '2px solid rgba(0,255,65,0.4)',
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.6)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#00ff41'
          e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(0,0,0,0.6), 0 0 10px rgba(0,255,65,0.3)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0,255,65,0.4)'
          e.currentTarget.style.boxShadow = 'inset 0 0 12px rgba(0,0,0,0.6)'
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
