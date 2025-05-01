import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "./utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        default: "h-6 w-6",
        sm: "h-4 w-4",
        lg: "h-10 w-10",
        xl: "h-16 w-16",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

function LoadingSpinner({
  className,
  size,
  variant,
  ...props
}) {
  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <div className={cn(spinnerVariants({ size, variant }))} />
    </div>
  )
}

export { LoadingSpinner, spinnerVariants }
export default LoadingSpinner 