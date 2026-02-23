import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(

  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-base tracking-wide transition-all duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-x-[2px] active:translate-y-[2px]",
  {
    variants: {
      variant: {

        default:
          "bg-[#00ff41] text-black border-0 shadow-[4px_4px_0px_#006b1a] hover:shadow-[6px_6px_0px_#006b1a] hover:-translate-x-[1px] hover:-translate-y-[1px]",

        destructive:
          "bg-[#ff006e] text-black border-0 shadow-[4px_4px_0px_#6b0030] hover:shadow-[6px_6px_0px_#6b0030] hover:-translate-x-[1px] hover:-translate-y-[1px]",

        outline:
          "bg-transparent text-[#00ff41] border-2 border-[#00ff41] hover:bg-[#00ff41]/10 shadow-none",

        secondary:
          "bg-[#0d001a] text-[#e0e0ff] border-2 border-[#00ff41]/30 hover:border-[#00ff41] hover:text-[#00ff41] shadow-none",

        ghost:
          "bg-transparent text-[#7f7f9f] hover:text-[#00ff41] hover:bg-[#00ff41]/5 shadow-none border-0",

        link: "bg-transparent text-[#00ff41] underline-offset-4 hover:underline shadow-none border-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
