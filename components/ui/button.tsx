import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "link"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "outline":
          return "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-800"
        case "link":
          return "bg-transparent underline text-blue-600 hover:text-blue-800"
        default:
          return "bg-blue-600 text-white hover:bg-blue-700"
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-8 px-3 text-xs"
        case "lg":
          return "h-12 px-8 text-lg"
        default:
          return "h-10 px-4 text-sm"
      }
    }

    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    const variantClasses = getVariantClasses()
    const sizeClasses = getSizeClasses()
    
    return (
      <button
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button } 