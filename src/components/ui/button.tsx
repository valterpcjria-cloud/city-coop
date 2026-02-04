import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[#4A90D9] text-white shadow-md hover:bg-[#3A7BC8] hover:shadow-lg focus-visible:ring-[#4A90D9]",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 focus-visible:ring-red-500",
        outline:
          "border-2 border-[#4A90D9] text-[#4A90D9] bg-white hover:bg-[#4A90D9]/5 hover:border-[#3A7BC8]",
        secondary:
          "bg-[#F5A623]/10 text-[#E09000] border border-[#F5A623]/20 hover:bg-[#F5A623]/20 hover:border-[#F5A623]/40",
        ghost:
          "text-[#6B7C93] hover:bg-[#4A90D9]/5 hover:text-[#4A90D9]",
        link: "text-[#4A90D9] underline-offset-4 hover:underline hover:text-[#3A7BC8]",
        brand: "bg-gradient-to-r from-[#4A90D9] to-[#F5A623] text-white shadow-lg hover:from-[#3A7BC8] hover:to-[#E09000] hover:shadow-xl",
        orange: "bg-[#F5A623] text-white shadow-md hover:bg-[#E09000] hover:shadow-lg focus-visible:ring-[#F5A623]",
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
