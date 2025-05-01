import * as React from "react"

import { cn } from "./utils"

// Input bileşeni - Yeniden kullanılabilir form elemanı
const Input = React.forwardRef(
  ({ className, type, label, required, helperText, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          type={type || "text"}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    )
  }
)

// Bileşen adı ayarla (DevTools'da görünecek ad)
Input.displayName = "Input"

export { Input } 