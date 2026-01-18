import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles matching input component
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
        "disabled:bg-input/50 dark:disabled:bg-input/80",
        // Boxy design with rounded-none
        "min-h-20 w-full rounded-none border bg-transparent px-2.5 py-2 text-xs",
        "transition-colors focus-visible:ring-1 aria-invalid:ring-1",
        "placeholder:text-muted-foreground resize-none outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
