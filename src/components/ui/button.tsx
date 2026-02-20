import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-city-blue text-white shadow-md hover:bg-city-blue-dark hover:shadow-lg focus-visible:ring-city-blue",
        destructive: "bg-red-500 text-white shadow-md hover:bg-red-600 focus-visible:ring-red-500",
        outline: "border-2 border-city-blue text-city-blue bg-white hover:bg-city-blue/5 hover:border-city-blue-dark",
        secondary: "bg-coop-orange/10 text-coop-orange-dark border border-coop-orange/20 hover:bg-coop-orange/20 hover:border-coop-orange/40",
        ghost: "text-tech-gray hover:bg-city-blue/5 hover:text-city-blue",
        link: "text-city-blue underline-offset-4 hover:underline hover:text-city-blue-dark",
        brand: "bg-gradient-to-r from-city-blue to-coop-orange text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]",
        orange: "bg-coop-orange text-white shadow-md hover:bg-coop-orange-dark hover:shadow-lg focus-visible:ring-coop-orange",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        icon: "size-10 rounded-lg",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
