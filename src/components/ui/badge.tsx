import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(

  "inline-flex items-center border px-2 py-0.5 font-pixel text-[7px] tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41]",
        secondary:
          "border-[#7f7f9f] bg-transparent text-[#7f7f9f]",
        destructive:
          "border-[#ff006e] bg-[#ff006e]/10 text-[#ff006e]",
        outline:
          "border-[#00ff41]/40 bg-transparent text-[#e0e0ff]",
        gold:
          "border-[#ffbe0b] bg-[#ffbe0b]/10 text-[#ffbe0b]",
        cyan:
          "border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  children?: React.ReactNode
  className?: string
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
