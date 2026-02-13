import { forwardRef, ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text" | "tonal" | "accent"
  size?: "default" | "sm" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "active:scale-[0.98]",
          {
            "bg-primary text-on-primary hover:bg-primary-hover shadow-elevation-1 hover:shadow-elevation-2": variant === "filled",
            "border border-outline-variant bg-white text-on-surface hover:bg-surface-container": variant === "outlined",
            "text-primary hover:bg-primary/5": variant === "text",
            "bg-primary-container text-on-primary-container hover:bg-primary-container/80": variant === "tonal",
            "bg-accent text-on-accent hover:bg-accent-hover shadow-elevation-1 hover:shadow-elevation-2": variant === "accent",
            "h-10 px-5 py-2 text-sm": size === "default",
            "h-9 px-3 text-sm": size === "sm",
            "h-11 px-8": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
