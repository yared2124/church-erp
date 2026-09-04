import { cn } from "@/lib/utils";

/**
 * Loading placeholder. Match the shape of the real content (height/width)
 * rather than reaching for a spinner.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton-shimmer animate-shimmer rounded-md", className)}
    />
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-md" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5">
      <Skeleton className="h-9 w-9 rounded-md" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-3.5 w-16" />
    </div>
  );
}
