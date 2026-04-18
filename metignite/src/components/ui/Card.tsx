import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
}

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[8px] border",
        variant === "default" &&
          "bg-met-container border-met-stroke",
        variant === "elevated" &&
          "bg-met-container-secondary border-met-stroke shadow-lg shadow-black/20",
        variant === "interactive" &&
          "bg-met-container border-met-stroke hover:border-met-stroke-active transition-colors cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "px-5 py-4 border-b border-met-stroke",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("px-5 py-4", className)} {...props} />;
}
