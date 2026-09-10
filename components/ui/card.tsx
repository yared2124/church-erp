import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Single standard Card used across every module (KPIs, tables, charts,
 * approvals, financial cards, activity panels). Do not create a bespoke
 * card style for an individual page.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Set false to render without the standard padding (e.g. a card with its
   * own edge-to-edge header/tabs, like the member detail panel). Defaults to true. */
  padded?: boolean;
  /** Add subtle interactive hover elevation and border transition */
  hoverable?: boolean;
}

export function Card({ className, padded = true, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-surface shadow-card transition-all duration-200",
        hoverable && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated",
        padded && "p-3.5 sm:p-4",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-2.5 flex items-start justify-between gap-2.5", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-card-title font-semibold text-text-primary", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-0.5 text-small text-text-secondary", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-3 flex items-center justify-between border-t border-border-light pt-3", className)}
      {...props}
    />
  );
}
