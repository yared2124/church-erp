import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "outline";

export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground border border-primary hover:bg-primary-hover active:bg-primary-active disabled:bg-primary/50",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-background-alt active:bg-border-light disabled:text-text-disabled",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:bg-background-alt active:bg-border-light disabled:text-text-disabled",
  outline:
    "bg-transparent text-primary border border-primary hover:bg-primary-light active:bg-primary-light disabled:text-text-disabled disabled:border-border",
  danger:
    "bg-danger text-white border border-danger hover:bg-red-600 active:bg-red-700 disabled:bg-danger/50",
  success:
    "bg-success text-white border border-success hover:bg-green-700 active:bg-green-800 disabled:bg-success/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-control-sm px-3 text-[13px] gap-1.5",
  md: "h-control-md px-4 text-[14px] gap-2",
  lg: "h-control-lg px-5 text-[15px] gap-2",
};

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface ButtonProps
  extends BaseButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** When provided, the Button renders as a Next.js Link instead of a <button>. */
  href?: string;
}

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-md font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

/**
 * Single reusable Button. Never create a one-off button style in a page —
 * add a variant here instead. Pass `href` to render as a navigational link
 * that looks identical to the button (e.g. "Add Member" → /members/new).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, icon, children, disabled, href, ...props },
    ref
  ) => {
    if (href) {
      return (
        <Link href={href} className={buttonClasses(variant, size, className)}>
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonClasses(variant, size, className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
