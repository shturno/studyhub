"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className="relative h-2 w-full grow overflow-hidden bg-[#020008]"
      style={{ border: "1px solid rgba(0,255,65,0.3)" }}
    >
      <SliderPrimitive.Range
        className="absolute h-full bg-[#00ff41]"
        style={{ boxShadow: "0 0 8px rgba(0,255,65,0.4)" }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 bg-[#00ff41] shadow-lg ring-0 transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      style={{
        border: "2px solid #00ff41",
        boxShadow: "0 0 10px rgba(0,255,65,0.6), 2px 2px 0 #006b1a",
      }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
