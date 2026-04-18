"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-met-primary-400/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-met-accent-400 text-white hover:bg-met-accent-500 active:bg-met-accent-600",
        secondary:
          "bg-met-container border border-met-stroke text-met-text-primary hover:bg-met-container-secondary hover:border-met-stroke-active",
        ghost:
          "text-met-text-secondary hover:text-met-text-primary hover:bg-met-container",
        outline:
          "border border-met-border-secondary text-met-text-primary hover:border-met-border-primary hover:bg-met-container/50",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
