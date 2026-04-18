import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-full",
  {
    variants: {
      variant: {
        default: "bg-met-container border border-met-stroke text-met-text-secondary",
        success: "bg-met-success/10 text-met-success border border-met-success/20",
        warning: "bg-met-warning/10 text-met-warning border border-met-warning/20",
        danger: "bg-met-danger/10 text-met-danger border border-met-danger/20",
        accent: "bg-met-accent-400/10 text-met-accent-400 border border-met-accent-400/20",
        primary: "bg-met-primary-400/10 text-met-primary-400 border border-met-primary-400/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
