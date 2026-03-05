import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full bg-[#020008] px-3 py-2 font-mono text-base text-[#e0e0ff] placeholder:text-[#3a3a5c] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 caret-[#00ff41] resize-y",
        className,
      )}
      style={{
        border: "2px solid rgba(0,255,65,0.4)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "#00ff41";
        e.currentTarget.style.boxShadow = "0 0 10px rgba(0,255,65,0.2)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,255,65,0.4)";
        e.currentTarget.style.boxShadow = "none";
      }}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
